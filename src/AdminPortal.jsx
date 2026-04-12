import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaGithub, FaExternalLinkAlt, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { supabase } from './supabaseClient';
import './AdminPortal.css';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSubmissions();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === correctPassword) {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminAuth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const [fetchError, setFetchError] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('magazine_submissions')
        .select('*');

      if (error) throw error;
      
      const sortedData = (data || []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setSubmissions(sortedData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setFetchError(error.message || 'Unknown database error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.category === filter);

  if (!isLoggedIn) {
    return (
      <div className="admin-container login-screen">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="admin-logo">
            <FaShieldAlt style={{ color: '#2563eb', fontSize: '3rem' }} />
          </div>
          <h2>Admin Access</h2>
          <p>Please enter your identification secret to continue.</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Enter Secret Code"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={loginError ? 'error-pulse' : ''}
              />
              {loginError && <span className="error-text">Access Denied! Incorrect code.</span>}
            </div>
            <button type="submit" className="cta-btn">Authorize Access</button>
            <button type="button" className="text-btn" onClick={() => navigate('/')} style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', width: '100%' }}>
              Back to Public Site
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="admin-container loading-container">
        <FaSpinner className="icon-spin" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="admin-container loading-container" style={{ color: '#ef4444' }}>
        <p>Database Error:</p>
        <code style={{ background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>{fetchError}</code>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '1rem' }}>
          Please ensure your Supabase Row Level Security (RLS) policies allow "SELECT" operations for this table!
        </p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">Portal Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="admin-back-btn" onClick={() => { sessionStorage.removeItem('adminAuth'); setIsLoggedIn(false); }}>
            Logout
          </button>
          <button className="admin-back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Home
          </button>
        </div>
      </header>

      <div className="filter-section">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'achievement' ? 'active' : ''}`} onClick={() => setFilter('achievement')}>Achievements</button>
        <button className={`filter-btn ${filter === 'stories' ? 'active' : ''}`} onClick={() => setFilter('stories')}>Stories</button>
        <button className={`filter-btn ${filter === 'parents' ? 'active' : ''}`} onClick={() => setFilter('parents')}>Parents</button>
        <button className={`filter-btn ${filter === 'creative' ? 'active' : ''}`} onClick={() => setFilter('creative')}>Creative</button>
      </div>

      <div className="submissions-grid">
        <AnimatePresence>
          {filteredSubmissions.map((sub, idx) => (
            <motion.div 
              key={sub.id || idx}
              className="submission-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <div className="card-header">
                <div className="user-info">
                  <span className="user-name">{sub.name || 'Anonymous'}</span>
                  <div className="user-meta">
                    <span className="campus-badge">{sub.campus}</span>
                    <span>Year {sub.year}</span>
                  </div>
                  <span className="user-meta" style={{marginTop: '4px', fontSize: '0.8rem'}}>{sub.email}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                  {sub.category}
                </span>
              </div>

              <div className="card-body">
                <p className="desc-text">{sub.description}</p>
                
                <div className="links">
                  {sub.project_link && (
                    <a href={sub.project_link} target="_blank" rel="noreferrer" className="link-btn">
                      <FaExternalLinkAlt /> Project
                    </a>
                  )}
                  {sub.github_link && (
                    <a href={sub.github_link} target="_blank" rel="noreferrer" className="link-btn">
                      <FaGithub /> GitHub
                    </a>
                  )}
                </div>

                {sub.images && sub.images.length > 0 && (
                  <div className="images-grid">
                    {sub.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt="submission" 
                        className="submission-img" 
                        onClick={() => setSelectedImage(img)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredSubmissions.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No submissions found for this category.
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <button className="close-modal" onClick={() => setSelectedImage(null)}><FaTimes /></button>
          <img src={selectedImage} alt="Fullscreen view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
