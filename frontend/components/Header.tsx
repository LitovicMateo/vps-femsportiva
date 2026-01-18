'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import styles from './Header.module.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface HeaderProps {
  categories?: Category[];
}

const Header: React.FC<HeaderProps> = ({ categories = [] }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sort categories by post count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
  
  // Show first 4 categories in nav, rest in dropdown
  const visibleCategories = sortedCategories.slice(0, 4);
  const dropdownCategories = sortedCategories.slice(4);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const socialLinks = [
    { icon: FaFacebookF, url: 'https://facebook.com', label: 'Facebook' },
    { icon: FaTwitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: FaInstagram, url: 'https://instagram.com', label: 'Instagram' },
    { icon: FaLinkedinIn, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FaYoutube, url: 'https://youtube.com', label: 'YouTube' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo/Brand */}
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            My Blog
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              <motion.span
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Home
              </motion.span>
            </Link>
            
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className={styles.navLink}
              >
                <motion.span
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {category.name}
                </motion.span>
              </Link>
            ))}
            
            {dropdownCategories.length > 0 && (
              <div 
                className={styles.dropdown}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button className={styles.dropdownToggle}>
                  <motion.span
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    More
                  </motion.span>
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className={styles.dropdownMenu}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {dropdownCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/${category.slug}`}
                          className={styles.dropdownItem}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>
        )}

        {/* Social Icons */}
        {!isMobile && (
          <div className={styles.socialIcons}>
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label={social.label}
              >
                <social.icon />
              </motion.a>
            ))}
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <motion.button
            className={styles.menuButton}
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </motion.button>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <nav className={styles.mobileNav}>
                <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>
                  Home
                </Link>
                
                {sortedCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    className={styles.mobileNavLink}
                    onClick={closeMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>

              <div className={styles.mobileSocial}>
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mobileSocialIcon}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
