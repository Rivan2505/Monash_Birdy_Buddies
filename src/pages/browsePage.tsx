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
  const [speciesInput2, setSpeciesInput2] = useState('');
  const [speciesFilters2, setSpeciesFilters2] = useState<string[]>([]);
  const [paged2, setPaged2] = useState<any[]>([]);
  const [thumbnailInput, setThumbnailInput] = useState('');
  const [thumbnailResult, setThumbnailResult] = useState<any | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [discoveredTags, setDiscoveredTags] = useState<string[]>([]);
  const [query4Results, setQuery4Results] = useState<any[]>([]);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkOperation, setBulkOperation] = useState(1); // 1 for add, 0 for remove
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<string>('');
  const [deleteUrls, setDeleteUrls] = useState('');
  const [deleteResult, setDeleteResult] = useState('');

  // --- Query 1 API Integration ---
  const [paged, setPaged] = useState<any[]>([]);
  const [q1Loading, setQ1Loading] = useState(false);
  const [q1Error, setQ1Error] = useState('');
  const totalFiles = paged.length;
  const totalPages = Math.ceil(totalFiles / PAGE_SIZE);

  // Helper to build query string for multi-species/count
  const buildQ1QueryString = () => {
    const speciesEntries = Object.entries(speciesFilters);
    if (speciesEntries.length === 1 && speciesEntries[0][1] === 1) {
      // Single species, count=1: use ?species=Name
      return `?species=${encodeURIComponent(speciesEntries[0][0])}`;
    }
    // Multi-species or any with count > 1
    return speciesEntries
      .map(([sp, count], idx) => `tag${idx + 1}=${encodeURIComponent(sp)}&count${idx + 1}=${count}`)
      .join('&')
      ? '?' + speciesEntries
      .map(([sp, count], idx) => `tag${idx + 1}=${encodeURIComponent(sp)}&count${idx + 1}=${count}`)
      .join('&')
      : '';
  };

  // Add species for Query 1 (with Enter key support)
  const addSpecies = () => {
    if (speciesInput && !speciesFilters[speciesInput]) {
      setSpeciesFilters({ ...speciesFilters, [speciesInput]: speciesCount });
      setSpeciesInput('');
      setSpeciesCount(1);
    }
  };

  // Query 1: Search by Bird Species Tags (API call)
  const handleQ1Search = async () => {
    // Auto-add input if not empty
    if (speciesInput && !speciesFilters[speciesInput]) {
      setSpeciesFilters(prev => {
        const updated = { ...prev, [speciesInput]: speciesCount };
        setSpeciesInput('');
        setSpeciesCount(1);
        return updated;
      });
      setTimeout(handleQ1Search, 0);
      return;
    }
    if (Object.keys(speciesFilters).length === 0) return;
    setQ1Loading(true);
    setQ1Error('');
    setPage(1);
    try {
      const queryString = buildQ1QueryString();
      const url = `https://uwxthsjzpg.execute-api.us-east-1.amazonaws.com/prod/search${queryString}`;
      console.log('Calling API:', url);
      const token = sessionStorage.getItem('idToken');
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (!data.links) throw new Error('Malformed response');
      const results = data.links.map((item, idx) => ({
        id: idx + 1,
        type: item.thumbURL ? 'image' : (item.fileURL.endsWith('.mp4') ? 'video' : 'audio'),
        url: item.thumbURL || item.fileURL,
        filename: item.fileURL.split('/').pop() || '',
        species: {},
        uploader: '',
        date: '',
        fileURL: item.fileURL,
        thumbURL: item.thumbURL
      }));
      setPaged(results);
    } catch (err) {
      setQ1Error(err instanceof Error ? err.message : String(err));
      setPaged([]);
    } finally {
      setQ1Loading(false);
    }
  };

  // Clear filters for Query 1
  const clearFilters = () => {
    setSpeciesFilters({});
    setFileType('All');
    setThumbnailUrl('');
    setMinCount(1);
    setSearchFile(null);
    setPage(1);
    setPaged([]);
    setQ1Error('');
  };

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

  // Search logic for Query 2
  const handleSearchSpeciesOnly = async () => {
    if (speciesFilters2.length === 0) return;
    
    try {
      // Build query string with just species names, no counts
      const queryString = speciesFilters2
        .map((sp, idx) => `tag${idx + 1}=${encodeURIComponent(sp)}&count${idx + 1}=1`)
        .join('&');
      
      const url = `https://uwxthsjzpg.execute-api.us-east-1.amazonaws.com/prod/search?${queryString}`;
      console.log('Calling API:', url);
      
      const token = sessionStorage.getItem('idToken');
      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: token ? { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      
      if (!data.links) throw new Error('Malformed response');
      
      const results = data.links.map((item, idx) => ({
        id: idx + 1,
        type: item.thumbURL ? 'image' : (item.fileURL.endsWith('.mp4') ? 'video' : 'audio'),
        url: item.thumbURL || item.fileURL,
        filename: item.fileURL.split('/').pop() || '',
        species: {},
        uploader: '',
        date: '',
        fileURL: item.fileURL,
        thumbURL: item.thumbURL
      }));
      
      setPaged2(results);
    } catch (err) {
      console.error('Error:', err);
      showToast(err instanceof Error ? err.message : 'Failed to search species', 'error');
      setPaged2([]);
    }
  };

  // Add species for Query 2
  const addSpecies2 = () => {
    const sp = speciesInput2.trim();
    if (sp && !speciesFilters2.includes(sp)) {
      setSpeciesFilters2([...speciesFilters2, sp]);
    }
    setSpeciesInput2('');
  };

  // Remove species for Query 2
  const removeSpecies2 = (sp: string) => {
    setSpeciesFilters2(speciesFilters2.filter(s => s !== sp));
  };

  // Clear Query 2 filters
  const clearFilters2 = () => {
    setSpeciesInput2('');
    setSpeciesFilters2([]);
    setPaged2([]);
  };

  // Search logic for Query 3
  const handleSearchThumbnail = async () => {
    if (!thumbnailInput) return;
    
    try {
      const encodedUrl = encodeURIComponent(thumbnailInput);
      const url = `https://uwxthsjzpg.execute-api.us-east-1.amazonaws.com/prod/fullsize?thumbURL=${encodedUrl}`;
      console.log('Input URL:', thumbnailInput);
      console.log('Encoded URL:', encodedUrl);
      console.log('Full API URL:', url);
      const token = sessionStorage.getItem('idToken');
      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: token ? { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data);
      setThumbnailResult({
        thumb: thumbnailInput,
        full: data.fileURL
      });
    } catch (err) {
      console.error('Error:', err);
      showToast(err instanceof Error ? err.message : 'Failed to find full-size image', 'error');
      setThumbnailResult(null);
    }
  };

  const clearThumbnailSearch = () => {
    setThumbnailInput('');
    setThumbnailResult(null);
  };

  // Mock tag discovery for uploaded file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadedFile(file);
    if (file) {
      // Mock: randomly pick 1-2 species from SPECIES_LIST
      const allSpecies = Object.keys(mockMedia.reduce((acc, item) => ({ ...acc, ...item.species }), {}));
      const randomTags = allSpecies.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
      setDiscoveredTags(randomTags);
    } else {
      setDiscoveredTags([]);
    }
    setQuery4Results([]);
  };

  // Search logic for Query 4
  const handleSearchByFileTags = () => {
    if (discoveredTags.length === 0) return;
    const results = mockMedia.filter(item =>
      discoveredTags.every(tag => item.species && item.species[tag] && item.species[tag] > 0)
    );
    setQuery4Results(results);
  };

  const clearQuery4 = () => {
    setUploadedFile(null);
    setDiscoveredTags([]);
    setQuery4Results([]);
  };

  const addBulkTag = () => {
    const tag = bulkTagInput.trim();
    if (tag && !bulkTags.includes(tag)) {
      setBulkTags([...bulkTags, tag]);
    }
    setBulkTagInput('');
  };

  const removeBulkTag = (tag: string) => {
    setBulkTags(bulkTags.filter(t => t !== tag));
  };

  const clearBulk = () => {
    setBulkUrls('');
    setBulkOperation(1);
    setBulkTagInput('');
    setBulkTags([]);
    setBulkResult('');
  };

  const handleBulkSubmit = async () => {
    if (!bulkUrls || bulkTags.length === 0) {
      setBulkResult('Please provide file URLs and at least one tag.');
      return;
    }
    const urlList = bulkUrls.split(/\s|,/).map(u => u.trim()).filter(Boolean);
    setBulkResult('');
    try {
      const token = sessionStorage.getItem('idToken');
      const res = await fetch('https://uwxthsjzpg.execute-api.us-east-1.amazonaws.com/prod/manage-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          urls: urlList,
          operation: bulkOperation,
          tags: bulkTags
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setBulkResult(`API error: ${res.status} ${errorData.error || ''}`);
        return;
      }
      const data = await res.json();
      if (!data.updated) {
        setBulkResult('Malformed response from server.');
        return;
      }
      // Format the result for display
      const resultText = data.updated.map((item: any) => `${item.url}: ${item.status}`).join('\n');
      setBulkResult(resultText);
    } catch (err) {
      setBulkResult('Failed to update tags.');
    }
  };

  const handleBulkDeleteFiles = () => {
    if (!deleteUrls.trim()) {
      setDeleteResult('Please provide at least one file URL.');
      return;
    }
    const urlList = deleteUrls.split(/\s|,/).map(u => u.trim()).filter(Boolean);
    setDeleteResult(`Deleted files: ${urlList.join(', ')}`);
    // In a real app, call the backend API to delete files and their thumbnails
  };

  const clearBulkDelete = () => {
    setDeleteUrls('');
    setDeleteResult('');
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
          {/* Query 1: Tag-based Search Section */}
          <div className="query-section">
            <h3 className="query-title">Query 1: Search by Bird Species Tags</h3>
            <div className="query-description">
              Search for images and videos containing specific bird species with minimum counts.
              Example: {'{"crow": 3}'} or {'{"pigeon": 2, "crow": 1}'}
            </div>
            <div className="search-row">
              <div className="species-input-group">
                <input 
                  type="text"
                  value={speciesInput}
                  onChange={e => setSpeciesInput(e.target.value)}
                  placeholder="Enter species name"
                  className="species-input"
                  onKeyDown={e => { if (e.key === 'Enter') addSpecies(); }}
                />
                <input 
                  type="number" 
                  min={0} 
                  value={speciesCount} 
                  onChange={e => setSpeciesCount(Number(e.target.value))} 
                  placeholder="Count"
                />
                <button onClick={addSpecies} disabled={!speciesInput} className="add-btn">ADD</button>
                <button className="search-btn" onClick={handleQ1Search} disabled={Object.keys(speciesFilters).length === 0 && !speciesInput}>SEARCH</button>
                <button className="clear-btn" onClick={clearFilters}>CLEAR</button>
              </div>
              <div className="species-chips">
                {Object.entries(speciesFilters).map(([sp, count]) => (
                  <span className="species-chip" key={sp}>
                    {sp}: {count} 
                    <button onClick={() => removeSpecies(sp)} title="Remove">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section for Query 1 */}
          <div className="query-results">
            <h4>Search Results</h4>
            {(!q1Loading && paged.length === 0 && !q1Error) && (
              <div style={{ color: '#888', margin: '20px 0' }}>No results found.</div>
            )}
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
                      {item.species && Object.entries(item.species).map(([sp, count]) => {
                        const c = count as number;
                        return (
                          <span className="gallery-tag" key={sp}>{c} {sp}{c > 1 ? 's' : ''}</span>
                        );
                      })}
                    </div>
                    <div className="gallery-meta">
                      <span>By {item.uploader}</span> | <span>{item.date}</span>
                    </div>
                    <div className="gallery-actions">
                      <button onClick={() => handleView(item)}>VIEW</button>
                      <button onClick={() => handleEditTags(item)}>EDIT TAGS</button>
                      <button onClick={() => handleDelete(item)} style={{ backgroundColor: '#dc3545', color: 'white' }}>DELETE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder for other queries */}
          <div className="query-section">
            <h3 className="query-title">Query 2: Search by Bird Species (No Count)</h3>
            <div className="query-description">
              Find all images, audios, and videos that contain at least one of each specified bird species. Example: {'{"crow"}'}
            </div>
            <div className="search-row">
              <div className="species-input-group">
                <input
                  type="text"
                  value={speciesInput2}
                  onChange={e => setSpeciesInput2(e.target.value)}
                  placeholder="Enter species name"
                  className="species-input"
                  onKeyDown={e => { if (e.key === 'Enter') addSpecies2(); }}
                />
                <button onClick={addSpecies2} disabled={!speciesInput2} className="add-btn">ADD</button>
                <button className="search-btn" onClick={handleSearchSpeciesOnly} disabled={speciesFilters2.length === 0}>SEARCH</button>
                <button className="clear-btn" onClick={clearFilters2}>CLEAR</button>
              </div>
              <div className="species-chips">
                {speciesFilters2.map(sp => (
                  <span className="species-chip" key={sp}>
                    {sp}
                    <button onClick={() => removeSpecies2(sp)} title="Remove">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="query-results">
              <h4>Search Results</h4>
              <div className={viewMode === 'grid' ? 'gallery-grid' : 'gallery-list'}>
                {paged2.map(item => (
                  <div className={viewMode === 'grid' ? 'gallery-card' : 'gallery-list-item'} key={item.id}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
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
                        {item.species && Object.entries(item.species).map(([sp, count]) => {
                          const c = count as number;
                          return (
                            <span className="gallery-tag" key={sp}>{c} {sp}{c > 1 ? 's' : ''}</span>
                          );
                        })}
                      </div>
                      <div className="gallery-meta">
                        <span>By {item.uploader}</span> | <span>{item.date}</span>
                      </div>
                      <div className="gallery-actions">
                        <button onClick={() => handleView(item)}>VIEW</button>
                        <button onClick={() => handleEditTags(item)}>EDIT TAGS</button>
                        <button onClick={() => handleDelete(item)} style={{ backgroundColor: '#dc3545', color: 'white' }}>DELETE</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Query 3: Find Full-size Image by Thumbnail URL */}
          <div className="query-section">
            <h3 className="query-title">Query 3: Find Full-size Image by Thumbnail URL</h3>
            <div className="query-description">
              Enter the S3 URL of a thumbnail to find the corresponding full-size image S3 URL.
            </div>
            <div className="search-row">
              <div className="species-input-group">
                <input
                  type="text"
                  value={thumbnailInput}
                  onChange={e => setThumbnailInput(e.target.value)}
                  placeholder="Enter thumbnail S3 URL or part of it"
                  className="species-input"
                  style={{ minWidth: '350px' }}
                />
                <button className="search-btn" onClick={handleSearchThumbnail} disabled={!thumbnailInput}>SEARCH</button>
                <button className="clear-btn" onClick={clearThumbnailSearch}>CLEAR</button>
              </div>
            </div>
            <div className="query-results">
              <h4>Result</h4>
              {thumbnailResult ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <img src={thumbnailResult.thumb} alt="Thumbnail" style={{ maxWidth: '120px', borderRadius: '8px', border: '1px solid #ccc' }} />
                  <div>
                    <div>Full-size Image URL:</div>
                    <a href={thumbnailResult.full} target="_blank" rel="noopener noreferrer">{thumbnailResult.full}</a>
                  </div>
                </div>
              ) : (
                thumbnailInput && <div>No matching image found.</div>
              )}
            </div>
          </div>

          {/* Query 4: Find Files by Uploaded File's Tags */}
          <div className="query-section">
            <h3 className="query-title">Query 4: Find Files by Uploaded File's Tags</h3>
            <div className="query-description">
              Upload a file (image/audio/video). The system will discover the tags (bird species) in the file and find all files containing those tags. The uploaded file is not stored.
            </div>
            <div className="search-row">
              <div className="species-input-group">
                <input type="file" onChange={handleFileUpload} />
                <button className="search-btn" onClick={handleSearchByFileTags} disabled={!uploadedFile || discoveredTags.length === 0}>SEARCH</button>
                <button className="clear-btn" onClick={clearQuery4}>CLEAR</button>
              </div>
            </div>
            {uploadedFile && (
              <div style={{ margin: '10px 0' }}>
                <strong>Discovered tags:</strong> {discoveredTags.length > 0 ? discoveredTags.join(', ') : 'None'}
              </div>
            )}
            <div className="query-results">
              <h4>Search Results</h4>
              <div className={viewMode === 'grid' ? 'gallery-grid' : 'gallery-list'}>
                {query4Results.map(item => (
                  <div className={viewMode === 'grid' ? 'gallery-card' : 'gallery-list-item'} key={item.id}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
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
                        {item.species && Object.entries(item.species).map(([sp, count]) => {
                          const c = count as number;
                          return (
                            <span className="gallery-tag" key={sp}>{c} {sp}{c > 1 ? 's' : ''}</span>
                          );
                        })}
                      </div>
                      <div className="gallery-meta">
                        <span>By {item.uploader}</span> | <span>{item.date}</span>
                      </div>
                      <div className="gallery-actions">
                        <button onClick={() => handleView(item)}>VIEW</button>
                        <button onClick={() => handleEditTags(item)}>EDIT TAGS</button>
                        <button onClick={() => handleDelete(item)} style={{ backgroundColor: '#dc3545', color: 'white' }}>DELETE</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Query 5: Bulk Add/Remove Tags */}
          <div className="query-section">
            <h3 className="query-title">Query 5: Bulk Add/Remove Tags</h3>
            <div className="query-description">
              Enter a list of file URLs, select add or remove, and specify tags with counts (e.g., "crow,1").
            </div>
            <div className="search-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <textarea
                value={bulkUrls}
                onChange={e => setBulkUrls(e.target.value)}
                placeholder="Enter file URLs (one per line or comma-separated)"
                rows={3}
                style={{ width: '100%', minWidth: '350px', marginBottom: '10px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                <label>
                  <input
                    type="radio"
                    name="bulk-operation"
                    value={1}
                    checked={bulkOperation === 1}
                    onChange={() => setBulkOperation(1)}
                  />{' '}
                  Add
                </label>
                <label>
                  <input
                    type="radio"
                    name="bulk-operation"
                    value={0}
                    checked={bulkOperation === 0}
                    onChange={() => setBulkOperation(0)}
                  />{' '}
                  Remove
                </label>
              </div>
              <div className="species-input-group">
                <input
                  type="text"
                  value={bulkTagInput}
                  onChange={e => setBulkTagInput(e.target.value)}
                  placeholder="Enter tag,count (e.g., crow,1)"
                  className="species-input"
                  onKeyDown={e => { if (e.key === 'Enter') addBulkTag(); }}
                />
                <button onClick={addBulkTag} disabled={!bulkTagInput} className="add-btn">ADD</button>
                <button className="clear-btn" onClick={() => setBulkTags([])} disabled={bulkTags.length === 0}>CLEAR TAGS</button>
              </div>
              <div className="species-chips">
                {bulkTags.map(tag => (
                  <span className="species-chip" key={tag}>
                    {tag}
                    <button onClick={() => removeBulkTag(tag)} title="Remove">×</button>
                  </span>
                ))}
              </div>
              <div className="button-row" style={{ marginTop: '15px' }}>
                <button className="search-btn" onClick={handleBulkSubmit}>SUBMIT</button>
                <button className="clear-btn" onClick={clearBulk}>CLEAR ALL</button>
              </div>
            </div>
            <div className="query-results">
              <h4>Result</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{bulkResult}</pre>
            </div>
          </div>

          {/* Query 6: Delete Files */}
          <div className="query-section">
            <h3 className="query-title">Query 6: Delete Files</h3>
            <div className="query-description">
              Enter a list of file URLs to delete them (and their thumbnails, if images). You can also delete files individually using the DELETE button on each card.
            </div>
            <div className="search-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <textarea
                value={deleteUrls}
                onChange={e => setDeleteUrls(e.target.value)}
                placeholder="Enter file URLs to delete (one per line or comma-separated)"
                rows={3}
                style={{ width: '100%', minWidth: '350px', marginBottom: '10px', resize: 'vertical' }}
              />
              <div className="button-row">
                <button className="search-btn" style={{ backgroundColor: '#dc3545' }} onClick={handleBulkDeleteFiles}>DELETE</button>
                <button className="clear-btn" onClick={clearBulkDelete}>CLEAR</button>
              </div>

            </div>
            <div className="query-results">
              <h4>Result</h4>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{deleteResult}</pre>
            </div>
          </div>
        </div>

        {/* Results Summary & Sorting */}
        {/* <div className="results-summary">
          <span>Showing {paged.length} of {totalFiles} files</span>
          <span> | Sort by: </span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map(opt => <option value={opt} key={opt}>{opt}</option>)}
          </select>
        </div> */}

        {/* Bulk Actions Bar */}
        {/* <div className="bulk-actions-bar">
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
        </div> */}

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