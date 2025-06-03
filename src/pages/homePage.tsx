// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router-dom';
import '../styles/homePage.css';

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
        <div className="quick-actions">
          <button className="action-button secondary">
            <span className="button-icon">🔍</span>
            Browse Collection
          </button>
        </div>
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate('/upload')} style={{ cursor: 'pointer' }}>
            <span className="feature-icon">📸</span>
            <h3>Upload Media</h3>
            <p>Share your bird photos, audio recordings, and videos</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏷️</span>
            <h3>Auto-Tagging</h3>
            <p>Automatic species detection and tagging</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Search</h3>
            <p>Find media by species, location, or date</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👥</span>
            <h3>Collaborate</h3>
            <p>Work with researchers across campuses</p>
          </div>
        </div>

        
      </main>
    </div>
  );
};

export default HomePage;
