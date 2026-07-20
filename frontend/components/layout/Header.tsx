"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/ThemeContext";
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
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen, isMobile]);

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="240"
              height="80"
              viewBox="0 0 810 809.999993"
              preserveAspectRatio="xMidYMid meet"
              style={{ height: "60px", width: "auto" }}
            >
              <g
                fill={theme === "dark" ? "#ffffff" : "#ff0099"}
                fillOpacity="1"
              >
                <g transform="translate(0.999999, 116.114363) translate(80, 472)">
                  <path d="M 77.28125 -66.484375 L 84.328125 -51.375 L 83.328125 -8.640625 L 74.25 -0.578125 L 8.34375 0 L 2.875 -11.375 L 5.609375 -39.28125 L 30.359375 -39.140625 L 32.375 -26.328125 L 54.390625 -26.765625 L 55.109375 -44.90625 L 10.65625 -49.9375 L 4.171875 -57.28125 L 4.890625 -105.484375 L 10.5 -112.25 L 63.3125 -114.984375 L 81.875 -109.65625 L 83.171875 -82.453125 L 77.859375 -77.859375 L 57.703125 -76.84375 L 54.109375 -88.5 L 34.96875 -86.921875 L 33.390625 -70.375 Z M 77.28125 -66.484375 " />
                </g>
                <g transform="translate(86.766219, 116.114363) translate(80, 472)">
                  <path d="M 83.890625 -104.765625 L 84.046875 -36.984375 L 78 -29.9375 L 33.390625 -28.5 L 32.09375 -2.015625 L 2.875 0.4375 L 2.875 -114.6875 L 78.28125 -110.375 Z M 53.828125 -87.640625 L 34.828125 -89.515625 L 34.109375 -54.390625 L 53.671875 -55.828125 Z M 53.828125 -87.640625 " />
                </g>
                <g transform="translate(172.244623, 116.114363) translate(80, 472)">
                  <path d="M 77.28125 -115.125 L 84.046875 -107.78125 L 83.03125 -10.5 L 77.703125 -0.28125 L 13.09375 0.140625 L 3.59375 -5.46875 L 2.875 -107.5 L 7.484375 -114.6875 Z M 33.09375 -90.953125 L 33.96875 -24.46875 L 53.390625 -23.171875 L 53.671875 -89.21875 Z M 33.09375 -90.953125 " />
                </g>
                <g transform="translate(257.723027, 116.114363) translate(80, 472)">
                  <path d="M 78.421875 -32.09375 L 70.953125 -31.234375 L 81.015625 -10.65625 L 78.578125 -5.75 L 56.40625 0 L 40.4375 -29.21875 L 33.390625 -28.921875 L 32.09375 -2.875 L 2.875 -0.4375 L 2.875 -115.40625 L 78.28125 -110.8125 L 83.890625 -105.203125 L 84.046875 -41.734375 Z M 53.671875 -56.265625 L 53.828125 -88.5 L 34.828125 -90.375 L 34.109375 -54.828125 Z M 53.671875 -56.265625 " />
                </g>
                <g transform="translate(343.201432, 116.114363) translate(80, 472)">
                  <path d="M 2.875 -114.84375 L 83.75 -114.84375 L 82.453125 -86.78125 L 59.578125 -85.765625 L 56.40625 -2.453125 L 26.328125 0.4375 L 27.046875 -85.90625 L 3.015625 -87.0625 Z M 2.875 -114.84375 " />
                </g>
                <g transform="translate(428.392039, 116.114363) translate(80, 472)">
                  <path d="M 3.734375 -113.546875 L 34.96875 -114.546875 L 31.078125 -2.875 L 2.875 0.140625 Z M 3.734375 -113.546875 " />
                </g>
                <g transform="translate(464.799482, 116.114363) translate(80, 472)">
                  <path d="M 66.34375 -114.6875 L 97.5625 -108.65625 L 74.6875 -6.328125 L 68.0625 -0.578125 L 33.53125 0.28125 L 27.625 -5.46875 L 2.875 -110.8125 L 35.40625 -115.125 L 51.234375 -33.671875 Z M 66.34375 -114.6875 " />
                </g>
                <g transform="translate(559.487732, 116.114363) translate(80, 472)">
                  <path d="M 84.46875 -102.03125 L 86.625 -0.28125 L 56.703125 0.28125 L 55.828125 -35.546875 L 32.953125 -34.109375 L 30.65625 -0.4375 L 2.875 0.140625 L 7.34375 -105.484375 L 12.953125 -112.25 L 75.6875 -114.984375 Z M 55.6875 -57.421875 L 54.96875 -86.0625 L 35.984375 -84.46875 L 34.53125 -58.859375 Z M 55.6875 -57.421875 " />
                </g>
                <g transform="translate(0.999999, 303.244715) translate(80, 159)">
                  <path d="M 181.484375 -227.796875 L 85.84375 -229.3125 L 85.84375 -190.140625 L 146.84375 -186.765625 L 146.84375 -121.25 L 85.46875 -125.015625 L 84.71875 -3.765625 L 7.53125 0 L 7.53125 -301.609375 L 183.375 -295.953125 Z M 181.484375 -227.796875 " />
                </g>
                <g transform="translate(188.13279, 303.244715) translate(80, 159)">
                  <path d="M 185.625 -68.15625 L 189.765625 -0.75 L 7.53125 -0.75 L 7.53125 -301.984375 L 183.75 -296.328125 L 181.484375 -227.421875 L 84.71875 -228.546875 L 84.71875 -190.90625 L 147.21875 -187.140625 L 147.21875 -121.625 L 84.34375 -125.390625 L 83.96875 -73.796875 Z M 185.625 -68.15625 " />
                </g>
                <g transform="translate(381.666515, 303.244715) translate(80, 159)">
                  <path d="M 256.421875 -299.34375 L 259.8125 -0.75 L 180.734375 -2.640625 L 174.703125 -172.828125 L 132.921875 -110.328125 L 93.75 -170.5625 L 87.734375 -3.765625 L 7.53125 -0.75 L 11.671875 -301.984375 L 91.125 -300.84375 L 132.921875 -233.078125 L 173.203125 -300.46875 Z M 256.421875 -299.34375 " />
                </g>
              </g>
            </svg>
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
                Početna
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
                    Više
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
              placeholder="Pretraži..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              aria-label="Pretraži"
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
          <div className={styles.mobileActions}>
            <ThemeToggle />
            <motion.button
              className={styles.menuButton}
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </motion.button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mounted &&
        createPortal(
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
                        placeholder="Pretraži..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        aria-label="Pretraži"
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
                      Početna
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
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
};

export default Header;
