import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGraduationCap, FaArrowRight, FaUniversity, FaShieldAlt, FaSpinner, FaBook, FaLaptopCode, FaMicrochip } from 'react-icons/fa';
import { supabase } from './supabaseClient';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user already exists in history
    const savedEmail = localStorage.getItem('userEmail');
    const savedCampus = localStorage.getItem('userCampus');

    if (savedEmail && savedCampus) {
      navigate('/dashboard', { state: { campus: savedCampus, email: savedEmail } });
    }
  }, []);

  const handleEnter = (e) => {
    e.preventDefault();
    if (!campus) {
      alert("Please select a campus before proceeding.");
      return;
    }
    if (!email) {
      alert("Please enter an email address.");
      return;
    }
    
    // Save to history/localStorage
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userCampus', campus);

    // Pass campus and email directly to the dashboard without OTP
    navigate('/dashboard', { state: { campus, email } });
  };

  return (
    <div className="landing-container">
      <div className="overlay"></div>
      
      {/* Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <motion.div className="floating-element b-1" animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
          <FaBook />
        </motion.div>
        <motion.div className="floating-element b-2" animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}>
          <FaLaptopCode />
        </motion.div>
        <motion.div className="floating-element b-3" animate={{ y: [0, -20, 0], rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}>
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
          <a href="#">Campuses</a>
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
            Newton School of Technology
          </h1>
          <p className="hero-subtitle">
             Explore stories, achievements, and creative artworks from the brilliant minds across all our campuses. Welcome to the official NST digital magazine board.
          </p>

          <AnimatePresence mode="wait">
              <motion.form 
                key="login-form"
                className="signup-card" 
                onSubmit={handleEnter}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h3>Join the Network</h3>
                <p>Select your campus and provide your details to enter.</p>
                
                <div className="form-group campus-group">
                  <label>Select Campus</label>
                  <div className="campus-options">
                    <button 
                      type="button" 
                      className={`campus-btn ${campus === 'RU' ? 'active' : ''}`}
                      onClick={() => setCampus('RU')}
                    >RU</button>
                    <button 
                      type="button" 
                      className={`campus-btn ${campus === 'SVyasa' ? 'active' : ''}`}
                      onClick={() => setCampus('SVyasa')}
                    >SVyasa</button>
                    <button 
                      type="button" 
                      className={`campus-btn ${campus === 'ADYPU' ? 'active' : ''}`}
                      onClick={() => setCampus('ADYPU')}
                    >ADYPU</button>
                  </div>
                </div>

                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Student Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="cta-btn">
                  Enter Dashboard <FaArrowRight />
                </button>
              </motion.form>
          </AnimatePresence>

        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
