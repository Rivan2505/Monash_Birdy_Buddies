// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/browsePage.css';
import BackButton from '../components/BackButton';
import { useToast } from './ToastContext';

// Mock species list for dropdown
const SPECIES_LIST = ['crow', 'pigeon', 'eagle', 'wren', 'song thrush', 'raptor'];

// Mock media data (should be fetched from backend in future)
const mockMedia = [
  {
    id: 1,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80',
    filename: 'wren-in-bush.jpg',
    species: { wren: 2 },
    uploader: 'Alice',
    date: '2023-10-01'
  },
  {
    id: 2,
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    filename: 'song-thrush.mp3',
    species: { 'song thrush': 1 },
    uploader: 'Bob',
    date: '2023-09-15'
  },
  {
    id: 3,
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    filename: 'raptor-flight.mp4',
    species: { raptor: 1 },
    uploader: 'Carol',
    date: '2023-08-20'
  },
  {
    id: 4,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=400&q=80',
    filename: 'majestic-eagle.png',
    species: { eagle: 1 },
    uploader: 'Dave',
    date: '2023-07-10'
  }
];

const FILE_TYPES = ['All', 'Images', 'Audio', 'Video'];
const SORT_OPTIONS = ['Date', 'Species', 'File Type'];
const PAGE_SIZE = 8;

const BrowsePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [subscribedTags, setSubscribedTags] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<{ [key: string]: boolean }>({});

  // Search/filter state
  const [speciesFilters, setSpeciesFilters] = useState<{ [key: string]: number }>({});
  const [speciesInput, setSpeciesInput] = useState('');
  const [speciesCount, setSpeciesCount] = useState(1);
  const [fileType, setFileType] = useState('All');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [minCount, setMinCount] = useState(1);
  const [sortBy, setSortBy] = useState('Date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [similarResults, setSimilarResults] = useState<any[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);

  // Filtering logic (simulate backend query)
  let filtered = mockMedia.filter(item => {
    // File type filter
    if (fileType !== 'All') {
      if (fileType === 'Images' && item.type !== 'image') return false;
      if (fileType === 'Audio' && item.type !== 'audio') return false;
      if (fileType === 'Video' && item.type !== 'video') return false;
    }
    // Species filter
    for (const [sp, count] of Object.entries(speciesFilters)) {
      if (!item.species || !item.species[sp] || item.species[sp] < count) return false;
    }
    // Thumbnail URL filter (stub: match filename or url)
    if (thumbnailUrl && !(item.url.includes(thumbnailUrl) || item.filename.includes(thumbnailUrl))) return false;
    // Min count filter (any species count >= minCount)
    if (minCount > 1 && (!item.species || !Object.values(item.species).some(c => c >= minCount))) return false;
    // (Stub) Search by uploaded file: not implemented
    return true;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'Date') return b.date.localeCompare(a.date);
    if (sortBy === 'Species') return (Object.keys(b.species)[0] || '').localeCompare(Object.keys(a.species)[0] || '');
    if (sortBy === 'File Type') return a.type.localeCompare(b.type);
    return 0;
  });

  // Pagination
  const totalFiles = filtered.length;
  const totalPages = Math.ceil(totalFiles / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Bulk selection
  const allSelected = paged.length > 0 && paged.every(item => selected.includes(item.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(selected.filter(id => !paged.some(item => item.id === id)));
    } else {
      setSelected([...selected, ...paged.filter(item => !selected.includes(item.id)).map(item => item.id)]);
    }
  };
  const toggleSelect = (id: number) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  // Species filter add/remove
  const addSpecies = () => {
    if (speciesInput && !speciesFilters[speciesInput]) {
      setSpeciesFilters({ ...speciesFilters, [speciesInput]: speciesCount });
      setSpeciesInput('');
      setSpeciesCount(1);
    }
  };
  const removeSpecies = (sp: string) => {
    const copy = { ...speciesFilters };
    delete copy[sp];
    setSpeciesFilters(copy);
  };

  // Bulk actions (stubbed)
  const handleBulkDelete = () => {
    showToast('Bulk delete: ' + selected.join(', '), 'info');
    // TODO: Integrate with backend
  };
  const handleBulkTag = () => {
    showToast('Bulk tag: ' + selected.join(', '), 'info');
    // TODO: Integrate with backend
  };

  // Card actions (stubbed)
  const handleView = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const handleEditTags = (item: any) => {
    showToast('Edit tags for: ' + item.filename, 'info');
    // TODO: Open tag editor modal
  };
  const handleDelete = (item: any) => {
    showToast('Delete file: ' + item.filename, 'info');
    // TODO: Integrate with backend
  };

  // Pagination controls
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  // Grid/List toggle
  const handleViewMode = (mode: 'grid' | 'list') => setViewMode(mode);

  // Clear filters
  const clearFilters = () => {
    setSpeciesFilters({});
    setFileType('All');
    setThumbnailUrl('');
    setMinCount(1);
    setSearchFile(null);
    setPage(1);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Download started: ' + filename, 'success');
    } catch (err) {
      showToast('Failed to download file.', 'error');
    }
  };

  // Tag-based Notifications UI
  const handleSubscribe = (tag: string) => {
    if (!subscribedTags.includes(tag)) {
      setSubscribedTags([...subscribedTags, tag]);
      showToast(`Subscribed to notifications for ${tag}`, 'success');
    } else {
      setSubscribedTags(subscribedTags.filter(t => t !== tag));
      showToast(`Unsubscribed from notifications for ${tag}`, 'info');
    }
  };

  const handleEmailNotification = (tag: string) => {
    setEmailNotifications(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
    showToast(`Email notifications ${emailNotifications[tag] ? 'disabled' : 'enabled'} for ${tag}`, 'info');
  };

  const handleFindSimilar = () => {
    if (!searchFile) {
      showToast('Please upload an image to find similar birds.', 'error');
      setShowSimilar(false);
      return;
    }
    // Mock similar results (could be random subset of mockMedia)
    const mockSimilar = mockMedia.slice(0, 3).map((item, idx) => ({
      ...item,
      similarity: (0.95 - idx * 0.1).toFixed(2) // Mock similarity score
    }));
    setSimilarResults(mockSimilar);
    setShowSimilar(true);
    showToast('Showing mock similar bird results.', 'info');
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
        {/* Header with Back and View Toggle */}
        <div className="browse-header">
          <BackButton />
          <h2 className="browse-title">Browse Collection</h2>
          <div className="view-toggle">
            <button onClick={() => handleViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>
              🔲 <span className="icon-label">Grid</span>
            </button>
            <button onClick={() => handleViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
              📋 <span className="icon-label">List</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Panel */}
        <div className="search-panel">
          <div className="search-row">
            <label>🔍 Search by Species:</label>
            <select value={speciesInput} onChange={e => setSpeciesInput(e.target.value)}>
              <option value="">Select species</option>
              {SPECIES_LIST.map(sp => (
                <option value={sp} key={sp}>{sp}</option>
              ))}
            </select>
            <input type="number" min={1} value={speciesCount} onChange={e => setSpeciesCount(Number(e.target.value))} />
            <button onClick={addSpecies} disabled={!speciesInput} className="add-btn">ADD</button>
            <div className="species-chips">
              {Object.entries(speciesFilters).map(([sp, count]) => (
                <span className="species-chip" key={sp}>{sp}: {count} <button onClick={() => removeSpecies(sp)} title="Remove">×</button></span>
              ))}
            </div>
          </div>
          <div className="search-row">
            <label>📊 Minimum Count:</label>
            <input type="number" min={1} value={minCount} onChange={e => setMinCount(Number(e.target.value))} />
            <label>📁 File Type:</label>
            <select value={fileType} onChange={e => setFileType(e.target.value)}>
              {FILE_TYPES.map(type => <option value={type} key={type}>{type}</option>)}
            </select>
            <label>🔗 Thumbnail URL:</label>
            <input type="text" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="Enter URL or filename" />
          </div>
          <div className="search-row">
            <label>📋 Upload file to find similar:</label>
            <input type="file" onChange={e => setSearchFile(e.target.files?.[0] || null)} />
          </div>
          <div className="button-row">
            <button className="stub-btn" onClick={handleFindSimilar}>FIND SIMILAR (STUB)</button>
            <button className="clear-btn" onClick={clearFilters}>CLEAR FILTERS</button>
            <button className="search-btn" onClick={() => setPage(1)}>SEARCH</button>
          </div>
        </div>

        {/* Results Summary & Sorting */}
        <div className="results-summary">
          <span>Showing {paged.length} of {totalFiles} files</span>
          <span> | Sort by: </span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(opt => <option value={opt} key={opt}>{opt}</option>)}
          </select>
        </div>

        {/* Bulk Actions Bar */}
        <div className="bulk-actions-bar">
          <div className="bulk-left">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} id="selectAll" />
            <label htmlFor="selectAll">Select All</label>
            <span>|</span>
            <span>Selected: {selected.length}</span>
          </div>
          <div className="bulk-btn-row">
            <button onClick={handleBulkDelete} disabled={selected.length === 0}>DELETE</button>
            <button onClick={handleBulkTag} disabled={selected.length === 0}>TAG</button>
          </div>
        </div>

        {/* Media Grid/List */}
        <div className={viewMode === 'grid' ? 'gallery-grid' : 'gallery-list'}>
          {paged.map(item => (
            <div className={viewMode === 'grid' ? 'gallery-card' : 'gallery-list-item'} key={item.id}>
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
              {/* Download icon with label in top right for audio/video */}
              {item.type !== 'image' && item.url && (
                <a
                  href={item.url}
                  download={item.filename}
                  className="download-icon-link"
                  title="Download"
                >
                  <span className="download-svg" aria-label="download">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="17" />
                      <polyline points="19 12 12 19 5 12" />
                      <path d="M5 19h14" />
                    </svg>
                  </span>
                  <span className="download-label">Download</span>
                </a>
              )}
              <div className="gallery-thumb" onClick={() => handleView(item)} style={{ cursor: 'pointer' }}>
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
                <div className="gallery-species-tags">
                  {item.species && Object.entries(item.species).map(([sp, count]) => (
                    <span className="gallery-tag" key={sp}>{count} {sp}{count > 1 ? 's' : ''}</span>
                  ))}
                </div>
                <div className="gallery-meta">
                  <span>By {item.uploader}</span> | <span>{item.date}</span>
                </div>
                <div className="gallery-actions">
                  <button onClick={() => handleView(item)}>VIEW</button>
                  <button onClick={() => handleEditTags(item)}>EDIT TAGS</button>
                  <button onClick={() => handleDelete(item)}>DELETE</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination-bar">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}>← Previous</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => goToPage(i + 1)} className={page === i + 1 ? 'active' : ''}>{i + 1}</button>
          ))}
          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>Next →</button>
        </div>

        {/* File Details/Preview Modal */}
        {isModalOpen && selectedItem && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{selectedItem.filename}</h3>
              {selectedItem.type === 'image' ? (
                <img src={selectedItem.url} alt={selectedItem.filename} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              ) : selectedItem.type === 'audio' ? (
                <audio controls src={selectedItem.url} style={{ width: '100%' }} />
              ) : selectedItem.type === 'video' ? (
                <video controls src={selectedItem.url} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              ) : null}
              <div>
                <p>Uploader: {selectedItem.uploader}</p>
                <p>Date: {selectedItem.date}</p>
                <p>Species: {Object.entries(selectedItem.species).map(([sp, count]) => `${sp}: ${count}`).join(', ')}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Tag-based Notifications UI */}
        <div className="tag-notifications-section">
          <h3>Tag-based Notifications</h3>
          <select onChange={(e) => handleSubscribe(e.target.value)}>
            <option value="">Select a tag</option>
            {SPECIES_LIST.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <div>
            <h4>Subscribed Tags:</h4>
            <ul>
              {subscribedTags.map(tag => (
                <li key={tag}>
                  {tag}
                  <label>
                    <input
                      type="checkbox"
                      checked={emailNotifications[tag] || false}
                      onChange={() => handleEmailNotification(tag)}
                    />
                    Email Notifications
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {showSimilar && (
          <div className="similar-results-section">
            <h3>Similar Bird Images (Mock Results)</h3>
            <div className="gallery-grid">
              {similarResults.map(item => (
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
                    <div className="gallery-meta">
                      <span>Similarity: {item.similarity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowsePage; 