import { useState, useEffect } from 'react';
import { 
  uploadClientFiles, 
  deleteClientFile, 
  getClientFiles 
} from '@/app/actions/client-actions';

export type FileItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  tag?: string; // Add tag field
};

export const useClientFiles = (clientId: string) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getClientFiles(clientId);
      
      if (response.success && response.data) {
        // Map database records to FileItem format
        const mappedFiles: FileItem[] = response.data.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          uploadedAt: file.uploaded_at,
          tag: file.tag // Add tag field
        }));
        setFiles(mappedFiles);
      } else {
        throw new Error(response.error || 'Failed to load files');
      }
    } catch (err) {
      console.error('Error fetching client files:', err);
      setError('Failed to load files');
      
      // For development only, use mockup data
      if (process.env.NODE_ENV === 'development') {
        setFiles([
          {
            id: '1',
            name: 'patient_report.pdf',
            type: 'application/pdf',
            url: '#',
            uploadedAt: new Date().toISOString(),
            tag: 'Annual checkup report'
          },
          {
            id: '2',
            name: 'medical_history.docx',
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            url: '#',
            uploadedAt: new Date().toISOString(),
            tag: 'Previous treatments'
          },
          {
            id: '3',
            name: 'xray_scan.jpg',
            type: 'image/jpeg',
            url: '#',
            uploadedAt: new Date().toISOString(),
            tag: 'Spine X-ray'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: File[], tags: Record<string, string>): Promise<void> => {
    try {
      // You'll need to modify your uploadClientFiles action to accept tags
      const response = await uploadClientFiles(clientId, files, tags);
      
      if (!response.success) {
        throw new Error(response.error || 'Upload failed');
      }
      
      // After successful upload, refresh the files list
      fetchFiles();
    } catch (err) {
      console.error('Error uploading files:', err);
      throw err;
    }
  };

  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      const response = await deleteClientFile(clientId, fileId);
      
      if (!response.success) {
        throw new Error(response.error || 'Delete failed');
      }
      
      // After successful deletion, refresh the files list
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return {
    files,
    loading,
    error,
    uploadFiles,
    deleteFile,
    refreshFiles: fetchFiles
  };
};