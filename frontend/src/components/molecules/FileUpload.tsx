import React, { useCallback, useState } from 'react';
import { Button } from '../atoms';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  acceptedTypes?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading = false,
  acceptedTypes = '.pdf,.doc,.docx,.txt',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="file-selected">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button className="file-clear" onClick={clearFile} disabled={isUploading}>
              ×
            </button>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              Drag and drop a resume here, or click to browse
            </p>
            <p className="upload-hint">
              Supports PDF, DOC, DOCX, TXT (max 10MB)
            </p>
            <input
              type="file"
              className="file-input"
              accept={acceptedTypes}
              onChange={handleFileInput}
            />
          </>
        )}
      </div>
      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          variant="primary"
          size="large"
          className="upload-button"
        >
          {isUploading ? 'Processing...' : 'Upload & Analyze Resume'}
        </Button>
      )}
    </div>
  );
};
