"use client"
import React from 'react';
import { DocumentIcon, FileTypeIcon, IconCollection } from './IconComponents';
import { DocumentDisplay, TempFile } from './types';

// This is the dedicated component for handling the document upload UI.

type DocumentUploaderProps = {
  document: DocumentDisplay;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  onRemove: (type: string) => void;
  tempFiles?: TempFile[];
  onRemoveTempFile?: (index: number) => void;
};

export const DocumentUploader = React.memo(({ 
  document, onFileUpload, onRemove, tempFiles = [], onRemoveTempFile 
}: DocumentUploaderProps) => {

  // File item renderer - reused for both current and temp files
  const renderFileItem = (fileName: string, onClickRemove: () => void, key?: string | number) => (
    <div key={key} className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center space-x-2 overflow-hidden">
        <FileTypeIcon fileName={fileName} />
        <span className="text-xs text-blue-700 truncate max-w-[180px]">
          {fileName.split('/').pop()}
        </span>
      </div>
      <button
        type="button"
        onClick={onClickRemove}
        className="ml-2 p-1 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Remove file"
      >
        {IconCollection.remove}
      </button>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-3">
        <DocumentIcon type={document.fieldName} />
        <h4 className="font-medium text-gray-700">{document.label}</h4>
      </div>
      
      {/* Upload input */}
      <div className="relative mb-3">
        <label 
          htmlFor={`file-${document.fieldName}`} 
          className="flex items-center justify-center w-full p-3 bg-gray-50 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center">
            {IconCollection.upload}
            <span className="text-xs font-medium text-gray-600">
              {document.allowMultiple ? 'Click to upload multiple files' : 'Click to upload file'}
            </span>
            <span className="text-xs text-gray-500 mt-1">PDF, JPG or PNG</span>
          </div>
        </label>
        <input
          id={`file-${document.fieldName}`}
          type="file"
          onChange={(e) => onFileUpload(e, document.fieldName)}
          multiple={document.allowMultiple}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>
      
      {/* Files display */}
      <div className="space-y-2">
        {document.currentValue && renderFileItem(
          document.currentValue, 
          () => onRemove(document.fieldName)
        )}
        
        {tempFiles.map((file, index) => renderFileItem(
          file.file.name, 
          () => onRemoveTempFile && onRemoveTempFile(index), 
          index
        ))}
        
        {!document.currentValue && tempFiles.length === 0 && (
          <div className="p-2 text-center text-xs text-gray-500">
            No {document.label.toLowerCase()} uploaded yet
          </div>
        )}
      </div>
    </div>
  );
});
DocumentUploader.displayName = 'DocumentUploader';