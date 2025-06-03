// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import '../styles/uploadPage.css';
import React from 'react';

const UploadPage = () => {
  return (
    <div className="home-container">
      <nav className="top-nav">
        <div className="nav-brand">
          <img src="bird.png" alt="Monash Birdy Buddies Logo" className="nav-logo" />
          <h1>Monash Birdy Buddies</h1>
        </div>
        <button className="logout-button">
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </nav>
      <main className="main-content">
        <div className="upload-card">
          <h2 className="upload-title">📸 Upload Bird Media</h2>
          <p className="upload-subtitle">Share your bird photos, audio recordings, and videos with the research community</p>
          <div className="upload-drop-area">
            <div className="upload-cloud-icon">☁️</div>
            <div className="upload-drop-text">Drag & Drop your files</div>
            <div className="upload-or">Or click to select files</div>
            <button className="select-files-btn">Select Files</button>
            <div className="upload-supported">Supported formats: JPG, PNG, MP4, MOV, MP3, WAV (Max 50MB each)</div>
          </div>
          <div className="upload-types-row">
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
          <div className="manual-tags-section">
            <label htmlFor="manual-tags" className="manual-tags-label">Add Manual Tags (Optional)</label>
            <input
              id="manual-tags"
              className="manual-tags-input"
              type="text"
              placeholder="Enter bird species, location, or other tags..."
            />
            <div className="manual-tags-desc">Separate multiple tags with commas. AI will also auto-detect bird species.</div>
          </div>
          <button className="upload-btn" disabled>Upload 0 Files</button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage; 