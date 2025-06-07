// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/uploadPage.css';
import BackButton from '../components/BackButton';
import { useToast } from './ToastContext';
import { uploadMultipleFilesToS3 } from '../s3Service';
import { getUserSub } from '../utils/auth';

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/heic',
  'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/mp4',
  'video/mp4', 'video/quicktime', 'video/x-msvideo'
];

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [manualTags, setManualTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Handle file selection (button or drag-and-drop)
  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const validFiles = Array.from(selected).filter(file => ACCEPTED_TYPES.includes(file.type));
    setFiles(validFiles);
    setSuccess(false);
  };

  // Drag-and-drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle S3 upload
  const handleUpload = async () => {
    if (files.length === 0) {
      showToast('Please select files to upload', 'error');
      return;
    }

    const userSub = getUserSub();
    
    if (!userSub) {
      showToast('User authentication error. Please login again.', 'error');
      navigate('/login');
      return;
    }

    setUploading(true);
    setProgress(0);
    setSuccess(false);

    try {
      const uploadedKeys = await uploadMultipleFilesToS3(files, userSub, (progress) => {
        setProgress(progress);
      });

      console.log('All files uploaded successfully:', uploadedKeys);
      setUploading(false);
      setSuccess(true);
      showToast(`Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''} to S3! You will be able to view them in the media library soon.`, 'success');
      
      // Clear files after successful upload
      setFiles([]);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      setSuccess(false);
      showToast('Upload failed. Please try again.', 'error');
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <nav className="top-nav">
        <div className="nav-brand">
          <img src="bird.png" alt="Monash Birdy Buddies Logo" className="nav-logo" />
          <h1>Monash Birdy Buddies</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </nav>
      <main className="main-content">
        <BackButton/>
        <div className="upload-card">
          <h2 className="upload-title">📸 Upload Bird Media</h2>
          <p className="upload-subtitle">Share your bird photos, audio recordings, and videos with the research community</p><div className="upload-types-row">
            <div className="upload-type-card image">
              <span className="type-icon">📷</span>
              <div className="type-title">Images</div>
              <div className="type-desc">JPG, PNG, HEIC</div>
            </div>
            <div className="upload-type-card audio">
              <span className="type-icon">🎵</span>
              <div className="type-title">Audio</div>
              <div className="type-desc">MP3, WAV, M4A</div>
            </div>
            <div className="upload-type-card video">
              <span className="type-icon">🎬</span>
              <div className="type-title">Videos</div>
              <div className="type-desc">MP4, MOV, AVI</div>
            </div>
          </div>
          <div
            className="upload-drop-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current?.click()}
            style={{ cursor: 'pointer', borderColor: uploading ? '#bdbdbd' : undefined }}
          >
            <div className="upload-cloud-icon">☁️</div>
            <div className="upload-drop-text">Drag & Drop your files</div>
            <div className="upload-or">Or click to select files</div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="upload-supported">Supported formats: JPG, PNG, MP4, MOV, MP3, WAV (Max 50MB each)</div>
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="file-preview-list">
              {files.map((file, idx) => {
                const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
                const fileDate = new Date(file.lastModified).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                });
                return (
                  <div className="file-preview-item" key={idx}>
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="file-thumb" />
                    ) : file.type.startsWith('audio/') ? (
                      <span className="file-icon">🎵</span>
                    ) : file.type.startsWith('video/') ? (
                      <span className="file-icon">🎬</span>
                    ) : null}
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        <span>{fileDate}</span>
                        <span>•</span>
                        <span>{fileSizeMb}Mb</span>
                      </div>
                    </div>
                    <button className="remove-file-btn" onClick={() => removeFile(idx)} title="Remove">
                      <span className="trash-icon">🗑️</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="upload-progress-bar">
              <div className="upload-progress" style={{ width: `${progress}%` }} />
              <span className="upload-progress-label">{progress}%</span>
            </div>
          )}
          {success && <div className="upload-success-msg">✅ Upload successful!</div>}

          
          <button
            className="upload-btn"
            disabled={files.length === 0 || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage; 