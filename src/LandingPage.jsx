import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaArrowRight, FaUniversity, FaTimes, FaSpinner, FaBook, FaLaptopCode, FaMicrochip, FaHandHoldingHeart, FaUserAstronaut, FaCode, FaTerminal, FaDatabase, FaGoogle, FaHeart } from 'react-icons/fa';
import './LandingPage.css';

const API_BASE_URL = 'https://nst-magazine-backend.rameezrahman17.workers.dev/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('');
  const [userName, setUserName] = useState(''); // State for manual name entry
  const [email, setEmail] = useState('');
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [isSubmittingVolunteer, setIsSubmittingVolunteer] = useState(false);
  
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    campus: '',
    year: '',
    contribution: ''
  });

  // Refs to avoid stale closures in Google callback
  const campusRef = React.useRef(campus);
  const nameRef = React.useRef(userName);

  React.useEffect(() => {
    campusRef.current = campus;
  }, [campus]);

  React.useEffect(() => {
    nameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    // Auto-redirect if already logged in!
    const storedEmail = localStorage.getItem('userEmail');
    const storedCampus = localStorage.getItem('userCampus');
    const storedName = localStorage.getItem('userName');
    
    if (storedEmail && storedEmail !== 'Unknown' && storedCampus && storedCampus !== 'Unknown') {
      navigate('/dashboard', { state: { campus: storedCampus, email: storedEmail, name: storedName } });
      return;
    }

    /* Initialize Google Identity Services */
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log("Initializing Google Auth with ID prefix:", clientId ? clientId.substring(0, 10) + "..." : "MISSING");
      
      if (window.google && clientId && clientId !== 'your-google-client-id.apps.googleusercontent.com') {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false, // Don't auto-sign-in
          cancel_on_tap_outside: true
        });

        // Render the visible "Continue with Google" button
        window.google.accounts.id.renderButton(
          document.getElementById("google-button-v2"),
          { 
            theme: "filled_blue", 
            size: "large", 
            width: "280", // Decreased width
            shape: "rectangular", // Slightly rounded edges
            text: "continue_with"
          }
        );
      } else if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
        console.warn("Google Client ID is missing or using placeholder in .env");
      } else {
        // Retry in 1s if script hasn't loaded yet
        setTimeout(initGoogle, 1000);
      }
    };
    
    initGoogle();
    fetchVolunteers();
  }, []);

  const handleGoogleResponse = async (response) => {
    const currentCampus = campusRef.current;
    const currentName = nameRef.current;

    console.log("Processing Google response for:", currentName, "@", currentCampus);

    if (!currentCampus || !currentName) {
      alert("Please enter your name and select your campus first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();

      if (data.success) {
        console.log("Backend Auth Successful:", data.user);
        localStorage.setItem('userCampus', currentCampus);
        localStorage.setItem('userName', currentName);
        localStorage.setItem('userEmail', data.user.email);
        
        navigate('/dashboard', { state: { campus: currentCampus, email: data.user.email, name: currentName } });
      } else {
        console.error("Backend Auth Failed:", data);
        alert(`Authentication failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert(`Login failed: ${err.message}. Please try again or contact support.`);

    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/volunteers`);
      const data = await res.json();
      setVolunteers(data || []);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      setVolunteers([]); // Fallback to empty array
    }
  };

  const triggerGoogleLogin = () => {
    if (!campus || !userName) {
      alert("Please enter your name and select your campus first.");
      return;
    }
    window.google.accounts.id.prompt(); 
  };



  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingVolunteer(true);
    try {
      const res = await fetch(`${API_BASE_URL}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteerForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      alert("Thank you for volunteering!");
      setShowJoinModal(false);
      setVolunteerForm({ name: '', email: '', campus: '', year: '', contribution: '' });
      fetchVolunteers();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmittingVolunteer(false);
    }
  };

  return (
    <div className="landing-container">
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            className="laptop-intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
            transition={{ duration: 0.8 }}
          >
            <div className="laptop-container">
              <div className="laptop">
                <div className="laptop-lid">
                  <div className="laptop-screen">
                    <div className="laptop-logo">NST</div>
                  </div>
                </div>
                <div className="laptop-base"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Tech Elements */}
      <div className="bg-shapes">
        <div className="tech-grid"></div>
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <motion.div className="floating-element" style={{ top: '15%', left: '8%' }} animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}>
          <FaCode />
        </motion.div>
        <motion.div className="floating-element" style={{ bottom: '15%', right: '12%' }} animate={{ y: [0, 40, 0], rotate: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}>
          <FaLaptopCode />
        </motion.div>
        <motion.div className="floating-element" style={{ top: '35%', right: '8%' }} animate={{ y: [0, -25, 0], rotate: [0, 25, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}>
          <FaMicrochip />
        </motion.div>
        <motion.div className="floating-element" style={{ top: '55%', left: '5%' }} animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}>
          <FaTerminal />
        </motion.div>
        <motion.div className="floating-element" style={{ top: '75%', right: '18%' }} animate={{ y: [0, -35, 0], rotate: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}>
          <FaDatabase />
        </motion.div>
        <motion.div className="floating-element" style={{ top: '10%', right: '25%' }} animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}>
          <FaCode />
        </motion.div>
        <motion.div className="floating-element" style={{ bottom: '10%', left: '20%' }} animate={{ y: [0, -45, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 13, ease: "easeInOut" }}>
          <FaTerminal />
        </motion.div>
        <motion.div className="floating-element" style={{ top: '45%', left: '15%' }} animate={{ y: [0, 50, 0], rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}>
          <FaMicrochip />
        </motion.div>
      </div>

      <nav className="navbar">
        <div className="logo-container">
          <FaUniversity className="logo-icon" />
          <span className="logo-text">NST Magazine</span>
        </div>
        <div className="nav-links">
          <a href="#">About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); fetchVolunteers(); setShowVolunteers(true); }}>Volunteers</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Admin</a>
        </div>
      </nav>

      <main className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="badge">
            <FaGraduationCap />
            <span>The New-Age Tech Magazine</span>
          </div>
          <h1 className="hero-title">
            Newton School <br /> of Technology
          </h1>
          <p className="hero-subtitle">
             Exploring the frontiers of technology and innovation. The official voice of NST across all campuses.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
                <motion.div 
                  key="login-form"
                  className="signup-card" 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3 style={{ marginTop: 0 }}>Verified Student Entry</h3>
                  <p>Enter your details and verify with Google.</p>
                  
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="signup-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Select Campus</label>
                    <div className="campus-options">
                      {['RU', 'SVyasa', 'ADYPU'].map(c => (
                        <button 
                          key={c}
                          type="button" 
                          className={`campus-btn ${campus === c ? 'active' : ''}`}
                          onClick={() => setCampus(c)}
                        >{c}</button>
                      ))}
                    </div>
                  </div>

                  {/* New V2 Google Button Placeholder */}
                  <div className="google-v2-container">
                    <div id="google-button-v2"></div>
                  </div>

                  <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button type="button" className="secondary-btn" style={{ width: '100%' }} onClick={() => setShowJoinModal(true)}>
                      <FaHandHoldingHeart style={{ marginRight: '8px' }} /> Become a Volunteer
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

      {/* Volunteers List Modal */}
      {showVolunteers && (
        <div className="modal-overlay" onClick={() => setShowVolunteers(false)}>
          <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <button className="close-btn" onClick={() => setShowVolunteers(false)}><FaTimes /></button>
            
            {volunteers.length === 0 ? (
              <div className="empty-state-content">
                <FaHeart className="empty-state-icon" />
                <h2>Our Community of Change-Makers</h2>
                <p>Be the first to join our network of innovators and contributors. Your impact starts here.</p>
                <button className="join-btn" onClick={() => { setShowVolunteers(false); setShowJoinModal(true); }}>
                  Join them now
                </button>
              </div>
            ) : (
              <>
                <h2><FaUserAstronaut style={{ color: 'var(--electric-blue)' }} /> Our Volunteers</h2>
                <p>The brilliant minds helping us create this magazine.</p>
                <div className="volunteer-list">
                  {Array.isArray(volunteers) && volunteers.length > 0 ? volunteers.map((v, i) => (
                    <div key={i} className="volunteer-card">
                      <div className="volunteer-avatar">
                        {v.name ? v.name[0] : '?'}
                      </div>
                      <h4>{v.name || 'Anonymous'}</h4>
                      <p>{v.campus || 'N/A'} • {v.year || '?' } Yr</p>
                    </div>
                  )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#8892b0' }}>
                      No volunteers found.
                    </div>
                  )}
                </div>
                <button className="join-btn" style={{ marginTop: '2.5rem' }} onClick={() => { setShowVolunteers(false); setShowJoinModal(true); }}>
                  Become a Volunteer
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Become Volunteer Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <button className="close-btn" onClick={() => setShowJoinModal(false)}><FaTimes /></button>
            <h2>Become a Volunteer</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Help us grow the NST Magazine community.</p>
            
            <form onSubmit={handleVolunteerSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" value={volunteerForm.name} onChange={e => setVolunteerForm({...volunteerForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email ID</label>
                <input type="email" placeholder="john@student.nst.edu" value={volunteerForm.email} onChange={e => setVolunteerForm({...volunteerForm, email: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Campus</label>
                  <select value={volunteerForm.campus} onChange={e => setVolunteerForm({...volunteerForm, campus: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="RU">RU</option>
                    <option value="SVyasa">SVyasa</option>
                    <option value="ADYPU">ADYPU</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Year</label>
                  <select value={volunteerForm.year} onChange={e => setVolunteerForm({...volunteerForm, year: e.target.value})} required>
                    <option value="">Select</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>How can you contribute?</label>
                <textarea placeholder="e.g. Content Writing, Design, Social Media..." value={volunteerForm.contribution} onChange={e => setVolunteerForm({...volunteerForm, contribution: e.target.value})} rows="3" required></textarea>
              </div>
              
              <button type="submit" className="cta-btn" disabled={isSubmittingVolunteer}>
                {isSubmittingVolunteer ? <FaSpinner className="icon-spin" /> : 'Apply to Volunteer'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
