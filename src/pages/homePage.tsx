// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/homePage.css';
import { useToast } from './ToastContext';

// Mock species list for dropdown
const SPECIES_LIST = ['crow', 'pigeon', 'eagle', 'wren', 'song thrush', 'raptor'];

/*eslint-disable*/
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

const HomePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [subscribedTags, setSubscribedTags] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<{ [key: string]: boolean }>({});
  const [tagInput, setTagInput] = useState('');

  var idToken = parseJwt(sessionStorage.idToken.toString());
  var accessToken = parseJwt(sessionStorage.accessToken.toString());
  console.log ("Amazon Cognito ID token encoded: " + sessionStorage.idToken.toString());
  console.log ("Amazon Cognito ID token decoded: ");
  console.log ( idToken );
  console.log ("Amazon Cognito access token encoded: " + sessionStorage.accessToken.toString());
  console.log ("Amazon Cognito access token decoded: ");
  console.log ( accessToken );
  console.log ("Amazon Cognito refresh token: ");
  console.log ( sessionStorage.refreshToken );
  console.log ("Amazon Cognito example application. Not for use in production applications.");
  
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  // Tag-based Notifications UI
  const handleSubscribe = () => {
    if (!tagInput.trim()) {
      showToast('Please enter at least one tag', 'error');
      return;
    }

    const newTags = tagInput.split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag && !subscribedTags.includes(tag));

    if (newTags.length === 0) {
      showToast('No new tags to add', 'info');
      return;
    }

    setSubscribedTags([...subscribedTags, ...newTags]);
    showToast(`Subscribed to notifications for: ${newTags.join(', ')}`, 'success');
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSubscribedTags(subscribedTags.filter(tag => tag !== tagToRemove));
    showToast(`Unsubscribed from notifications for ${tagToRemove}`, 'info');
  };

  const handleEmailNotification = (tag: string) => {
    setEmailNotifications(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
    showToast(`Email notifications ${emailNotifications[tag] ? 'disabled' : 'enabled'} for ${tag}`, 'info');
  };

/*eslint-enable*/

  return (
    <div className="home-container">
      <nav className="top-nav">
        <div className="nav-brand">
          <img src="bird.png" alt="Monash Birdy Buddies Logo" className="nav-logo" />
          <h1>Monash Birdy Buddies</h1>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </nav>

      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome to Your Bird Watching Hub</h2>
          <p>Store, organize, and discover bird media from across Monash campuses</p>
        </div>
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate('/upload')} style={{ cursor: 'pointer' }}>
            <span className="feature-icon">📸</span>
            <h3>Upload Media</h3>
            <p>Share your bird photos, audio recordings, and videos</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/browse')} style={{ cursor: 'pointer' }}>
            <span className="feature-icon">🗂️</span>
            <h3>Browse Collection</h3>
            <p>View and search all uploaded bird media</p>
          </div>
        </div>

        {/* Tag-based Notifications UI */}
        <div className="tag-notifications-section">
          <h3>Tag-based Notifications</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tags separated by commas (e.g., crow, pigeon)"
              className="tag-input"
            />
            <button onClick={handleSubscribe} className="add-tag-btn">
              Add Tags
            </button>
          </div>
          <div className="subscribed-tags">
            <h4>Subscribed Tags:</h4>
            {subscribedTags.length === 0 ? (
              <p className="no-tags">No tags subscribed yet</p>
            ) : (
              <ul className="tags-list">
                {subscribedTags.map(tag => (
                  <li key={tag} className="tag-item">
                    <span className="tag-name">{tag}</span>
                    <div className="tag-actions">
                      <label className="email-toggle">
                        <input
                          type="checkbox"
                          checked={emailNotifications[tag] || false}
                          onChange={() => handleEmailNotification(tag)}
                        />
                        Email Notifications
                      </label>
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="remove-tag-btn"
                        title="Remove tag"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
