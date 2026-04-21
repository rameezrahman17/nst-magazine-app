import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaBookOpen, FaUserFriends, FaPalette, FaUpload, FaArrowLeft, FaSpinner, FaUsers, FaRocket } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const API_BASE_URL = 'https://nst-magazine-backend.rameezrahman17.workers.dev/api';

const sections = [
  { id: 'achievement', title: 'Student Achievement', icon: <FaTrophy /> },
  { id: 'team', title: 'Team Achievement', icon: <FaUsers /> },
  { id: 'startup', title: 'Startup Pitch', icon: <FaRocket /> },
  { id: 'stories', title: 'Student Stories', icon: <FaBookOpen /> },
  { id: 'parents', title: 'Parents Review', icon: <FaUserFriends /> },
  { id: 'creative', title: 'Creative Input', icon: <FaPalette /> },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const campus = location.state?.campus || 'Unknown';
  const email = location.state?.email || 'Unknown';
  const name = location.state?.name || email;

  const [activeTab, setActiveTab] = useState('achievement');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    year: '',
    description: '',
    projectLink: '',
    githubLink: '',
    images: null,
    // Team Specific
    teamName: '',
    teamSize: 0,
    teamMembers: [],
    // Startup Specific
    startupName: '',
    startupAchievement: '',
    startupMembers: '',
    startupDescription: '',
    startupFuture: '',
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
      // Consolidate specific category data into description if needed
      let finalDescription = formData.description;
      let finalName = formData.name;

      if (activeTab === 'team') {
        const teamInfo = `Team: ${formData.teamName}\nMembers (${formData.teamSize}): ${formData.teamMembers.map(m => `${m.name} (${m.email})`).join(', ')}\n\nHighlight: ${formData.description}`;
        finalDescription = teamInfo;
        finalName = `${formData.name} (Team ${formData.teamName})`;
      } else if (activeTab === 'startup') {
        const startupInfo = `Startup: ${formData.startupName}\nMembers: ${formData.startupMembers}\n\nAchievement: ${formData.startupAchievement}\n\nDescription: ${formData.startupDescription}\n\nFuture Scope: ${formData.startupFuture}`;
        finalDescription = startupInfo;
        finalName = `${formData.name} (${formData.startupName})`;
      }

      // Create FormData for Multi-part submission (Images + Data)
      const submitData = new FormData();
      submitData.append('campus', campus);
      submitData.append('email', email);
      submitData.append('category', activeTab);
      submitData.append('name', finalName);
      submitData.append('year', formData.year);
      submitData.append('description', finalDescription);
      submitData.append('project_link', formData.projectLink || '');
      submitData.append('github_link', formData.githubLink || '');
      
      if (formData.images) {
        formData.images.forEach(file => {
          submitData.append('images', file);
        });
      }

      const res = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        body: submitData // No headers needed, browser sets boundary
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      alert(`Successfully submitted for ${sections.find(s => s.id === activeTab).title}!`);
      
      setFormData({
        name: '', year: '', description: '', projectLink: '', githubLink: '', images: null,
        teamName: '', teamSize: 0, teamMembers: [],
        startupName: '', startupAchievement: '', startupMembers: '', startupDescription: '', startupFuture: ''
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
        {/* Common Fields */}
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

        {/* NEW: Team Achievement Section */}
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-fields">
            <div className="form-row">
              <div className="input-group">
                <label>Team Name</label>
                <input type="text" name="teamName" value={formData.teamName} onChange={handleInputChange} placeholder="Enter team name" required />
              </div>
              <div className="input-group">
                <label>Number of Team Members</label>
                <input type="number" name="teamSize" value={formData.teamSize || ''} onChange={handleInputChange} placeholder="0" min="1" max="10" required />
              </div>
            </div>

            {formData.teamMembers.length > 0 && (
              <div className="dynamic-members" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Member Details</h4>
                {formData.teamMembers.map((member, idx) => (
                  <div key={idx} className="form-row" style={{ paddingBottom: '1rem', borderBottom: idx !== formData.teamMembers.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div className="input-group">
                      <label>Member {idx + 1} Name</label>
                      <input type="text" name={`teamMember-name-${idx}`} value={member.name} onChange={handleInputChange} placeholder="Name" required />
                    </div>
                    <div className="input-group">
                      <label>Member {idx + 1} Email</label>
                      <input type="email" name={`teamMember-email-${idx}`} value={member.email} onChange={handleInputChange} placeholder="Email" required />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="input-group" style={{ marginTop: '1.5rem' }}>
              <label>Highlight of the Team Achievement</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Detail the event, competition, or hackathon..." required></textarea>
            </div>
            
            <div className="input-group file-group">
              <label>Memories (Upload Group Photos)</label>
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

        {/* NEW: Startup Section */}
        {activeTab === 'startup' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-fields">
            <div className="form-row">
              <div className="input-group">
                <label>Startup Name</label>
                <input type="text" name="startupName" value={formData.startupName} onChange={handleInputChange} placeholder="Company Name" required />
              </div>
              <div className="input-group">
                <label>Number of Members</label>
                <input type="text" name="startupMembers" value={formData.startupMembers} onChange={handleInputChange} placeholder="e.g., 4" required />
              </div>
            </div>

            <div className="input-group">
              <label>What is the startup about?</label>
              <textarea name="startupDescription" value={formData.startupDescription} onChange={handleInputChange} rows="3" placeholder="Core concept..." required></textarea>
            </div>

            <div className="input-group">
              <label>Main Achievement so far</label>
              <textarea name="startupAchievement" value={formData.startupAchievement} onChange={handleInputChange} rows="3" placeholder="Major milestones, funding, or product launches..." required></textarea>
            </div>

            <div className="input-group">
              <label>Future Scope</label>
              <textarea name="startupFuture" value={formData.startupFuture} onChange={handleInputChange} rows="3" placeholder="Where do you see it in 2 years?" required></textarea>
            </div>

            <div className="input-group file-group">
              <label>Startup Photos (Logo/Team/Product)</label>
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
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Verified Name</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0ea5e9', wordBreak: 'break-all', marginBottom: '0.25rem' }}>{name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>{email}</div>
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
            onClick={async () => {
              try {
                await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
              } catch (e) {}
              localStorage.removeItem('userCampus');
              localStorage.removeItem('userName');
              navigate('/');
            }}
          >
            Sign Out
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
