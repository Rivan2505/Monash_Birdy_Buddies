// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/browsePage.css';
import BackButton from '../components/BackButton';
const mockMedia = [
  {
    id: 1,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80',
    filename: 'wren-in-bush.jpg',
    tags: ['wren', 'bush', 'Australia'],
    uploader: 'Alice',
    date: '2023-10-01'
  },
  {
    id: 2,
    type: 'audio',
    url: '',
    filename: 'song-thrush.mp3',
    tags: ['song thrush', 'call'],
    uploader: 'Bob',
    date: '2023-09-15'
  },
  {
    id: 3,
    type: 'video',
    url: '',
    filename: 'raptor-flight.mp4',
    tags: ['raptor', 'flight', 'soaring'],
    uploader: 'Carol',
    date: '2023-08-20'
  },
  {
    id: 4,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&q=80',
    filename: 'majestic-eagle.png',
    tags: ['eagle', 'majestic'],
    uploader: 'Dave',
    date: '2023-07-10'
  }
];

const BrowsePage = () => {
  const navigate = useNavigate();

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
        <BackButton/>
        <h2 className="browse-title">Browse Collection</h2>
        <div className="gallery-grid">
          {mockMedia.map(item => (
            <div className="gallery-card" key={item.id}>
              <div className="gallery-thumb">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.filename} />
                ) : item.type === 'audio' ? (
                  <span className="gallery-icon" role="img" aria-label="audio">🎵</span>
                ) : item.type === 'video' ? (
                  <span className="gallery-icon" role="img" aria-label="video">🎬</span>
                ) : null}
              </div>
              <div className="gallery-info">
                <div className="gallery-filename">{item.filename}</div>
                <div className="gallery-tags">
                  {item.tags.map(tag => (
                    <span className="gallery-tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="gallery-meta">
                  <span>By {item.uploader}</span> | <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrowsePage; 