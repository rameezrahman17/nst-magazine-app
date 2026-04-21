import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaGithub, FaExternalLinkAlt, FaTimes, FaShieldAlt, FaHandHoldingHeart, FaDownload, FaTrash } from 'react-icons/fa';
import { supabase } from './supabaseClient';
import './AdminPortal.css';

const AdminPortal = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'achievement', etc, or 'volunteers'
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'NSTAdmin2026';
    if (passwordInput === correctPassword) {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminAuth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const [fetchError, setFetchError] = useState(null);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Submissions
      const { data: subData, error: subError } = await supabase
        .from('magazine_submissions')
        .select('*');

      if (subError) throw subError;
      setSubmissions(subData || []);

      // Fetch Volunteers
      const { data: volData, error: volError } = await supabase
        .from('volunteers')
        .select('*');

      if (volError) {
        console.warn('Volunteers table might not exist yet:', volError.message);
      } else {
        setVolunteers(volData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setFetchError(error.message || 'Unknown database error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : filter === 'volunteers' ? [] : submissions.filter(sub => sub.category === filter);

  const deleteSubmission = async (id, type = 'submission') => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      if (type === 'volunteer') {
        const { error } = await supabase.from('volunteers').delete().eq('id', id);
        if (error) throw error;
        setVolunteers(prev => prev.filter(v => v.id !== id));
      } else {
        const { error } = await supabase.from('magazine_submissions').delete().eq('id', id);
        if (error) throw error;
        setSubmissions(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      alert("Error deleting: " + e.message);
    }
  };

  const exportCSV = () => {
    let csvContent = "";
    if (filter === 'volunteers') {
      csvContent += "Name,Email,Campus,Year,Contribution\n";
      volunteers.forEach(v => {
        csvContent += `"${v.name}","${v.email}","${v.campus}","${v.year}","${v.contribution}"\n`;
      });
    } else {
      csvContent += "Category,Name,Email,Campus,Year,Description,Project Link,Github Link,Files\n";
      filteredSubmissions.forEach(s => {
        const files = s.images ? s.images.join(' | ') : '';
        const desc = s.description ? s.description.replace(/"/g, '""') : '';
        csvContent += `"${s.category}","${s.name}","${s.email}","${s.campus}","${s.year}","${desc}","${s.project_link || ''}","${s.github_link || ''}","${files}"\n`;
      });
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filter}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Submissions</button>
        <button className={`filter-btn ${filter === 'volunteers' ? 'active' : ''}`} onClick={() => setFilter('volunteers')}>
          <FaHandHoldingHeart style={{marginRight: '8px'}} /> Volunteers
        </button>
        <button className={`filter-btn ${filter === 'achievement' ? 'active' : ''}`} onClick={() => setFilter('achievement')}>Achievements</button>
        <button className={`filter-btn ${filter === 'stories' ? 'active' : ''}`} onClick={() => setFilter('stories')}>Stories</button>
        <button className={`filter-btn ${filter === 'parents' ? 'active' : ''}`} onClick={() => setFilter('parents')}>Parents</button>
        <button className={`filter-btn ${filter === 'creative' ? 'active' : ''}`} onClick={() => setFilter('creative')}>Creative</button>
        <button className="filter-btn" style={{ marginLeft: 'auto', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={exportCSV}>
          <FaDownload /> Export CSV
        </button>
      </div>

      <div className="submissions-grid">
        <AnimatePresence mode="wait">
          {filter === 'volunteers' ? (
            <motion.div key="vols" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', gridColumn: '1/-1' }}>
              <div className="volunteers-table-container" style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                   <thead>
                     <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                       <th style={{ padding: '1rem' }}>Name</th>
                       <th style={{ padding: '1rem' }}>Email</th>
                       <th style={{ padding: '1rem' }}>Campus</th>
                       <th style={{ padding: '1rem' }}>Year</th>
                       <th style={{ padding: '1rem' }}>Contribution</th>
                       <th style={{ padding: '1rem' }}>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {volunteers.map((v, i) => (
                       <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <td style={{ padding: '1rem', fontWeight: 'bold' }}>{v.name}</td>
                         <td style={{ padding: '1rem' }}>{v.email}</td>
                         <td style={{ padding: '1rem' }}><span className="campus-badge">{v.campus}</span></td>
                         <td style={{ padding: '1rem' }}>Year {v.year}</td>
                         <td style={{ padding: '1rem', fontStyle: 'italic', color: '#94a3b8' }}>{v.contribution}</td>
                         <td style={{ padding: '1rem' }}>
                           <button onClick={() => deleteSubmission(v.id, 'volunteer')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaTrash /> Delete</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {volunteers.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No volunteers found.</p>}
              </div>
            </motion.div>
          ) : (
            filteredSubmissions.map((sub, idx) => (
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
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                      {sub.category}
                    </span>
                    <button onClick={() => deleteSubmission(sub.id, 'submission')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <FaTrash /> Delete
                    </button>
                  </div>
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
                      {sub.images.map((img, idx) => {
                        const isPdf = img.toLowerCase().includes('.pdf');
                        return isPdf ? (
                          <a key={idx} href={img} target="_blank" rel="noreferrer" className="link-btn" style={{ background: '#ef4444', color: 'white', display: 'flex', justifyContent: 'center' }}>
                            <FaExternalLinkAlt /> View & Download PDF
                          </a>
                        ) : (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img 
                              src={img} 
                              alt="submission" 
                              className="submission-img" 
                              onClick={() => setSelectedImage(img)}
                            />
                            <a href={img} download target="_blank" rel="noreferrer" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem' }}>
                              Download API
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {filter !== 'volunteers' && filteredSubmissions.length === 0 && (
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
