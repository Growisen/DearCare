import React, { useState, useEffect } from 'react';
import { FiFile, FiImage, FiFileText, FiDownload, FiTrash2, FiUpload, FiX, FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ModalPortal from '@/components/ui/ModalPortal';

type FileItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  tag?: string;
};

type FilesSectionProps = {
  clientId: string;
  files: FileItem[];
  onUpload: (files: File[], tags: Record<string, string>) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
};

const FileSection: React.FC<FilesSectionProps> = ({ files, onUpload, onDelete }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileTags, setFileTags] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadSectionExpanded, setUploadSectionExpanded] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ERROR_DISPLAY_DURATION = 5000; // 5 seconds

  useEffect(() => {
    if (Object.keys(fileErrors).length > 0) {
      setShowErrors(true);
      const timer = setTimeout(() => {
        setShowErrors(false);
        // Clear error messages after display timeout
        setFileErrors({});
      }, ERROR_DISPLAY_DURATION);
      
      return () => clearTimeout(timer);
    }
  }, [fileErrors]);

  const validateFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const newTags = { ...fileTags };
      const errors = { ...fileErrors };

      newFiles.forEach(file => {
        if (validateFileSize(file)) {
          validFiles.push(file);
          if (!newTags[file.name]) {
            newTags[file.name] = '';
          }
          delete errors[file.name];
        } else {
          errors[file.name] = `File too large (${formatFileSize(file.size)}). Maximum size is 2 MB.`;
        }
      });

      setSelectedFiles(prev => [...prev, ...validFiles]);
      setFileTags(newTags);
      setFileErrors(errors);
      setUploadSectionExpanded(true);
    }
  };

  const handleTagChange = (fileName: string, tag: string) => {
    setFileTags(prev => ({
      ...prev,
      [fileName]: tag
    }));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      await onUpload(selectedFiles, fileTags);
      setSelectedFiles([]);
      setFileTags({});
      setFileErrors({});
      setUploadSectionExpanded(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    const newSelectedFiles = [...selectedFiles];
    const removedFile = newSelectedFiles.splice(index, 1)[0];
    setSelectedFiles(newSelectedFiles);
    
    const newTags = { ...fileTags };
    const newErrors = { ...fileErrors };
    delete newTags[removedFile.name];
    delete newErrors[removedFile.name];
    setFileTags(newTags);
    setFileErrors(newErrors);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles: File[] = [];
      const newTags = { ...fileTags };
      const errors = { ...fileErrors };

      newFiles.forEach(file => {
        if (validateFileSize(file)) {
          validFiles.push(file);
          if (!newTags[file.name]) {
            newTags[file.name] = '';
          }
          delete errors[file.name];
        } else {
          errors[file.name] = `File too large (${formatFileSize(file.size)}). Maximum size is 2 MB.`;
        }
      });

      setSelectedFiles(prev => [...prev, ...validFiles]);
      setFileTags(newTags);
      setFileErrors(errors);
      setUploadSectionExpanded(true);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FiImage className="text-blue-500" size={24} />;
    if (fileType.includes('pdf')) return <FiFileText className="text-red-500" size={24} />;
    if (fileType.includes('word') || fileType.includes('doc')) 
      return <FiFileText className="text-blue-700" size={24} />;
    return <FiFile className="text-gray-500" size={24} />;
  };

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      setIsDeleting(true);
      try {
        await onDelete(fileToDelete);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file');
      } finally {
        setIsDeleting(false);
        setFileToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setFileToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
        <div className="p-4">
          <h3 className="font-medium text-lg mb-4 text-gray-900">Patient Files / Documents</h3>
          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">File</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Uploaded</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {files.map(file => (
                    <tr key={file.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <span className="ml-3 truncate max-w-xs text-gray-800">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {file.tag || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <a 
                            href={file.url} 
                            download
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FiDownload size={18} />
                          </a>
                          <button 
                            onClick={() => handleDeleteClick(file.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
        <button 
          onClick={() => setUploadSectionExpanded(!uploadSectionExpanded)}
          className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
        >
          <h3 className="font-medium text-lg text-gray-900">Upload Files</h3>
          {uploadSectionExpanded ? 
            <FiChevronUp className="text-gray-500" /> : 
            <FiChevronDown className="text-gray-500" />
          }
        </button>
        
        {uploadSectionExpanded && (
          <div className="p-4 pt-0 border-t border-slate-200">
            <div 
              className={`border-2 border-dashed rounded-sm text-center ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
              } ${selectedFiles.length > 0 ? 'p-2' : 'p-4'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileSelection}
                disabled={uploading}
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer inline-flex flex-col items-center py-2"
              >
                <FiFile size={24} className="text-gray-400 mb-1" />
                <span className="text-sm font-medium text-blue-600">
                  {uploading ? 'Uploading...' : 'Click to select or drag files here'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Max file size: 2 MB
                </p>
              </label>
            </div>

            {Object.keys(fileErrors).length > 0 && showErrors && (
              <div className="mt-3 transition-opacity duration-200 ease-in-out">
                <div className="text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  <div className="flex items-center mb-1">
                    <FiAlertCircle size={16} className="mr-1" />
                    <span className="font-medium text-sm">Files exceeding 2 MB limit:</span>
                  </div>
                  <ul className="ml-6 text-xs list-disc">
                    {Object.entries(fileErrors).map(([fileName, error]) => (
                      <li key={fileName}>{fileName}: {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2 text-gray-700">Selected Files</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center p-2 border rounded bg-gray-50">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="ml-2 flex-1 truncate text-sm text-gray-700">
                        {file.name}
                        <span className="text-xs text-gray-500 ml-1">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <div className="flex-1 px-2">
                        <input
                          type="text"
                          placeholder="Add tag"
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={fileTags[file.name] || ''}
                          onChange={(e) => handleTagChange(file.name, e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => removeSelectedFile(index)}
                        className="flex-shrink-0 ml-1 text-red-500 hover:text-red-700"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-sm shadow-none text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FiUpload className="mr-1" size={14} />
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {fileToDelete && (
        <ModalPortal>
          <ConfirmationModal
            isOpen={fileToDelete !== null}
            title="Confirm Deletion"
            message="Are you sure you want to delete this file? This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            confirmButtonText="Delete"
            confirmButtonColor="red"
            isLoading={isDeleting}
          />
        </ModalPortal>
      )}
    </div>
  );
};

export default FileSection;