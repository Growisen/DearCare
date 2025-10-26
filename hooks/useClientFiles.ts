import { useState, useEffect } from 'react';
import { 
  uploadClientFiles, 
  deleteClientFile, 
  getClientFiles 
} from '@/app/actions/clients/client-actions';

export type FileItem = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  tag?: string;
};

export const useClientFiles = (clientId: string, shouldFetch: boolean = false) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!shouldFetch) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getClientFiles(clientId);
      
      if (response.success && response.data) {
        const mappedFiles: FileItem[] = response.data.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          uploadedAt: file.uploaded_at,
          tag: file.tag
        }));
        setFiles(mappedFiles);
      } else {
        throw new Error(response.error || 'Failed to load files');
      }
    } catch (err) {
      console.error('Error fetching client files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files: File[], tags: Record<string, string>): Promise<void> => {
    try {
      const response = await uploadClientFiles(clientId, files, tags);
      
      if (!response.success) {
        throw new Error(response.error || 'Upload failed');
      }
      
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
      
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, shouldFetch]);

  return {
    files,
    loading,
    error,
    uploadFiles,
    deleteFile,
    refreshFiles: fetchFiles
  };
};