import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaBookOpen, FaUserFriends, FaPalette, FaUpload, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Dashboard.css';

const sections = [
  { id: 'achievement', title: 'Student Achievement', icon: <FaTrophy /> },
  { id: 'stories', title: 'Student Stories', icon: <FaBookOpen /> },
  { id: 'parents', title: 'Parents Review', icon: <FaUserFriends /> },
  { id: 'creative', title: 'Creative Input', icon: <FaPalette /> },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const campus = location.state?.campus || 'Unknown';
  const email = location.state?.email || 'Unknown';

  const [activeTab, setActiveTab] = useState('achievement');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    year: '',
    description: '',
    projectLink: '',
    githubLink: '',
    images: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrls = [];
      
      // Handle file uploads to Supabase Storage
      if (formData.images && formData.images.length > 0) {
        for (const file of formData.images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `${activeTab}/${fileName}`;
          
          let { error: uploadError } = await supabase.storage
            .from('magazine_uploads')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('magazine_uploads')
            .getPublicUrl(filePath);
            
          imageUrls.push(publicUrlData.publicUrl);
        }
      }
      
      // Insert into Supabase Table
      const { error: dbError } = await supabase
        .from('magazine_submissions')
        .insert([
          {
            campus: campus,
            email: email,
            category: activeTab,
            name: formData.name,
            year: formData.year,
            description: formData.description,
            project_link: formData.projectLink,
            github_link: formData.githubLink,
            images: imageUrls,
          }
        ]);
        
      if (dbError) throw dbError;
      
      alert(`Successfully submitted for ${sections.find(s => s.id === activeTab).title}!`);
      
      setFormData({
        name: '', year: '', description: '', projectLink: '', githubLink: '', images: null
      });
      // reset file inputs visually
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
    } catch (error) {
      console.error(error);
      alert('Error submitting your entry: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormFields = () => {
    return (
      <div className="form-content">
        <div className="form-row">
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" required />
          </div>
          <div className="input-group">
            <label>Year of College</label>
            <select name="year" value={formData.year} onChange={handleInputChange} required>
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        {activeTab === 'achievement' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-fields">
            <div className="input-group">
              <label>What achievement do you want to add?</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Detail your achievement..." required></textarea>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Deployed Project Link</label>
                <input type="url" name="projectLink" value={formData.projectLink} onChange={handleInputChange} placeholder="https://..." />
              </div>
              <div className="input-group">
                <label>GitHub Link</label>
                <input type="url" name="githubLink" value={formData.githubLink} onChange={handleInputChange} placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="input-group file-group">
              <label>Memories (Upload Multiple Images)</label>
              <div className="file-upload">
                <FaUpload />
                <input type="file" name="images" multiple onChange={handleInputChange} accept="image/*" />
                {formData.images?.length ? (
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{formData.images.length} file(s) selected</span>
                ) : (
                  <span>Drag & Drop or Click to Upload</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'stories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-fields">
            <div className="input-group">
              <label>Share your Memory / Story</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" placeholder="Write your campus stories here..." required></textarea>
            </div>
            <div className="input-group file-group">
              <label>Memory Image</label>
              <div className="file-upload">
                <FaUpload />
                <input type="file" name="images" onChange={handleInputChange} accept="image/*" />
                {formData.images?.length ? (
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{formData.images.length} file(s) selected</span>
                ) : (
                  <span>Upload an image for this memory</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'parents' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-fields">
            <div className="input-group">
              <label>Parent's Review</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" placeholder="Share your parents' review or feedback..." required></textarea>
            </div>
          </motion.div>
        )}

        {activeTab === 'creative' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-fields">
            <div className="input-group">
              <label>Describe your Artwork / Comic</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Tell us about the creativity you're sharing..." required></textarea>
            </div>
            <div className="input-group file-group">
              <label>Upload Artwork (Images/Pdfs)</label>
              <div className="file-upload">
                <FaUpload />
                <input type="file" name="images" accept="image/*,application/pdf" multiple onChange={handleInputChange} required />
                {formData.images?.length ? (
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{formData.images.length} file(s) selected</span>
                ) : (
                  <span>Upload your creative piece</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>NST Magazine</h2>
          <p>Student Portal</p>
          <div className="user-profile-badge" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Profile</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-all' }}>{email}</div>
            <div className="campus-badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{campus}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeTab === section.id ? 'active' : ''}`}
              onClick={() => setActiveTab(section.id)}
            >
              <span className="icon">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </button>
          <button 
            className="back-btn" 
            style={{ borderColor: '#ef4444', color: '#ef4444' }} 
            onClick={() => {
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userCampus');
              navigate('/');
            }}
          >
            Switch Profile
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Submit to {sections.find(s => s.id === activeTab)?.title}</h1>
          <p>Share your voice with the Newton School of Technology community.</p>
        </header>

        <section className="form-section">
          <form className="dashboard-form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderFormFields()}
              </motion.div>
            </AnimatePresence>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="icon-spin" style={{ marginRight: '8px' }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Entry'
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
