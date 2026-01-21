"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaSearch,
} from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.css";

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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Sort categories by post count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

  // Show first 4 categories in nav, rest in dropdown
  const visibleCategories = sortedCategories.slice(0, 4);
  const dropdownCategories = sortedCategories.slice(4);

  // Sticky header scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at top
      // Hide header when scrolling down past threshold
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  const socialLinks = [
    { icon: FaFacebookF, url: "https://facebook.com", label: "Facebook" },
    { icon: FaTwitter, url: "https://twitter.com", label: "Twitter" },
    { icon: FaInstagram, url: "https://instagram.com", label: "Instagram" },
    { icon: FaLinkedinIn, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: FaYoutube, url: "https://youtube.com", label: "YouTube" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query.length >= 3) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchTerm("");
      closeMenu();
    }
  };

  return (
    <header
      className={`${styles.header} ${!isHeaderVisible ? styles.hidden : ""}`}
    >
      <div className={styles.container}>
        {/* Logo/Brand */}
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            My Blog
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              <motion.span
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
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
                  transition={{ type: "spring", stiffness: 300 }}
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
                    transition={{ type: "spring", stiffness: 300 }}
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

        {/* Search Form */}
        {!isMobile && (
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              aria-label="Search"
            />
            <button
              type="submit"
              className={styles.searchButton}
              disabled={searchTerm.trim().length < 3}
              aria-label="Search"
            >
              <FaSearch />
            </button>
          </form>
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

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <>
            <ThemeToggle />
            <motion.button
              className={styles.menuButton}
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </motion.button>
          </>
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              {/* Mobile Search Form */}
              <div className={styles.mobileSearchContainer}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    aria-label="Search"
                  />
                  <button
                    type="submit"
                    className={styles.searchButton}
                    disabled={searchTerm.trim().length < 3}
                    aria-label="Search"
                  >
                    <FaSearch />
                  </button>
                </form>
              </div>

              <nav className={styles.mobileNav}>
                <Link
                  href="/"
                  className={styles.mobileNavLink}
                  onClick={closeMenu}
                >
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
