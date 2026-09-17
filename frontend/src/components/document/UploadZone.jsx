import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileCheck, AlertCircle, FileText } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const UploadZone = ({ onFileSelected, isUploading = false, uploadProgress = 0 }) => {
  const [fileError, setFileError] = useState('');

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setFileError('');
      if (rejectedFiles && rejectedFiles.length > 0) {
        setFileError('Please upload a valid PDF or DOCX file under 10MB.');
        return;
      }
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10485760, // 10MB
    multiple: false,
    disabled: isUploading,
  });

  const selectedFile = acceptedFiles[0];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-accent bg-accent/10 shadow-glow-cyan scale-[1.01]'
            : isUploading
            ? 'border-primary/40 bg-card/60 cursor-not-allowed'
            : 'border-white/20 hover:border-primary/80 bg-card hover:bg-[#1C1C32]'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${
              isDragActive
                ? 'bg-accent/20 scale-110 shadow-glow-cyan text-accent'
                : 'bg-primary/20 text-primary-light border border-primary/40'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              {isDragActive
                ? 'Drop your contract here to analyze...'
                : 'Drag & drop contract here, or browse files'}
            </p>
            <p className="text-xs text-textSecondary mt-1 font-mono">
              Supported Formats: PDF, DOCX &bull; Maximum File Size: 10 MB
            </p>
          </div>

          {selectedFile && !isUploading && (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white">
              <FileText className="w-4 h-4 text-accent" />
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-textSecondary font-mono">({formatBytes(selectedFile.size)})</span>
            </div>
          )}

          {isUploading && (
            <div className="w-full max-w-md space-y-2 pt-2">
              <div className="flex justify-between text-xs text-textSecondary font-mono">
                <span>Encrypting &amp; Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300 shadow-glow-cyan"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {fileError && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-danger bg-danger/10 border border-danger/20 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
