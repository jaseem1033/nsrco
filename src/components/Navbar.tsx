import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let lastY = 0;
    const handleScroll = () => {
      const y = window.scrollY;
      
      // Blurred solid backdrop on scroll
      if (y > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Slide up/down menu
      if (y > lastY && y > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      lastY = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => {
      const next = !prev;
      document.body.style.overflow = next ? 'hidden' : '';
      return next;
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <>
      <header>
        <nav
          id="nav"
          className={`${isScrolled ? 'scrolled' : ''} ${isHidden ? 'hidden' : ''}`}
        >
          <Link to="/" className="nav-logo">
            <img src="/assets/LOGO-W.png" alt="NSRCO Logo" className="logo-img" />
          </Link>
          
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className={({ isActive }) => isActive ? 'active' : ''}>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className="nav-cta">
                Contact
              </NavLink>
            </li>
          </ul>

          <button
            className={`nav-mobile-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu Navigation"
          >
            <span className="hamburger-box">
              <span className="hamburger-inner"></span>
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Drawer & Overlay */}
      <div
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      />
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
          Products
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
          Services
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
          About Us
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>
          Contact
        </NavLink>
      </div>
    </>
  );
};
