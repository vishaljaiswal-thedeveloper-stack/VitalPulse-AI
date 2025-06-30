import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

function Navigation({ changeLanguage }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      return;
    }

    // Get current user from Supabase
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) && 
          !event.target.closest('.user-menu-trigger')) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    // Clear demo user
    localStorage.removeItem('demoUser');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setUser(null);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            🏥 VitalPulse
          </Link>
          
          {/* Bolt.new Badge - Moved inside nav-left for mobile */}
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bolt-badge-navbar"
          >
            <img 
              src="/black_circle_360x360.png" 
              alt="Built with Bolt.new" 
              className="bolt-badge-img-navbar"
            />
          </a>
          
          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Desktop Navigation Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} ref={mobileMenuRef}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            {t('home')}
          </Link>
          <Link 
            to="/symptoms" 
            className={`nav-link ${location.pathname === '/symptoms' ? 'active' : ''}`}
          >
            {t('symptomsChecker')}
          </Link>
          <Link 
            to="/doctor-consultation" 
            className={`nav-link ${location.pathname === '/doctor-consultation' ? 'active' : ''}`}
          >
            {t('doctorConsultation')}
          </Link>
          <Link 
            to="/mental-health" 
            className={`nav-link ${location.pathname === '/mental-health' ? 'active' : ''}`}
          >
            {t('mentalHealth')}
          </Link>
          <Link 
            to="/mythbuster" 
            className={`nav-link ${location.pathname === '/mythbuster' ? 'active' : ''}`}
          >
            {t('mythBuster')}
          </Link>
          <Link 
            to="/pricing" 
            className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
          >
            {t('pricing')}
          </Link>
          {user && user.role === 'doctor' && (
            <Link 
              to="/prescription-mint" 
              className={`nav-link ${location.pathname === '/prescription-mint' ? 'active' : ''}`}
            >
              {t('prescriptionMint')}
            </Link>
          )}
          <Link 
            to="/contact" 
            className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            {t('contact')}
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            {t('about')}
          </Link>
          
          {user ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <div className="user-menu-trigger" onClick={toggleUserMenu}>
                <span className="user-avatar">
                  {user.email?.charAt(0).toUpperCase() || '👤'}
                </span>
                <span className="user-name">{user.email?.split('@')[0]}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <span className="user-role">{user.role === 'doctor' ? 'Doctor' : 'Patient'}</span>
                  </div>
                  
                  <Link 
                    to={user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'} 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    📊 Dashboard
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 My Profile
                  </Link>
                  
                  <button 
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/patient-login" 
              className={`nav-link login-nav-link ${location.pathname === '/patient-login' ? 'active' : ''}`}
            >
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;