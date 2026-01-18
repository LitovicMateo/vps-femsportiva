"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Replace with actual WordPress authentication
    // For now, use dummy credentials
    if (username === "admin" && password === "admin") {
      localStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid credentials. Use admin/admin for demo.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h1>Admin Login</h1>
          <p className={styles.subtitle}>
            Login with your WordPress credentials
          </p>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.loginButton}>
              Sign In
            </button>
          </form>

          <div className={styles.demoNote}>
            <strong>Demo Credentials:</strong> admin / admin
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>

        <nav className={styles.nav}>
          <a href="/admin/dashboard" className={styles.navLink}>
            <span className={styles.icon}>📊</span>
            Dashboard
          </a>
          <a
            href="/admin/settings"
            className={styles.navLink + " " + styles.active}
          >
            <span className={styles.icon}>⚙️</span>
            Settings
          </a>
          <a href="/admin/seo" className={styles.navLink}>
            <span className={styles.icon}>🔍</span>
            SEO
          </a>
          <a href="/admin/posts" className={styles.navLink}>
            <span className={styles.icon}>📝</span>
            Posts
          </a>
          <a href="/admin/pages" className={styles.navLink}>
            <span className={styles.icon}>📄</span>
            Pages
          </a>
          <a href="/admin/media" className={styles.navLink}>
            <span className={styles.icon}>🖼️</span>
            Media
          </a>
          <a href="/admin/users" className={styles.navLink}>
            <span className={styles.icon}>👥</span>
            Users
          </a>
          <a href="/" className={styles.navLink}>
            <span className={styles.icon}>🏠</span>
            View Site
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.icon}>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Welcome to Admin Panel</h1>
          <p>Manage your blog settings, content, and more from here.</p>
        </div>

        <div className={styles.cards}>
          <a href="/admin/settings" className={styles.card}>
            <div className={styles.cardIcon}>⚙️</div>
            <h3>Site Settings</h3>
            <p>Configure site name, features, and layout</p>
          </a>

          <a href="/admin/seo" className={styles.card}>
            <div className={styles.cardIcon}>🔍</div>
            <h3>SEO Settings</h3>
            <p>Optimize search engine visibility</p>
          </a>

          <a href="/admin/posts" className={styles.card}>
            <div className={styles.cardIcon}>📝</div>
            <h3>Posts</h3>
            <p>Create and manage blog posts</p>
          </a>

          <a href="/admin/media" className={styles.card}>
            <div className={styles.cardIcon}>🖼️</div>
            <h3>Media Library</h3>
            <p>Upload and manage images</p>
          </a>

          <a href="/admin/users" className={styles.card}>
            <div className={styles.cardIcon}>👥</div>
            <h3>Users</h3>
            <p>Manage authors and permissions</p>
          </a>
        </div>

        <div className={styles.quickStats}>
          <h2>Quick Stats</h2>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statValue}>--</div>
              <div className={styles.statLabel}>Total Posts</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>--</div>
              <div className={styles.statLabel}>Total Views</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>--</div>
              <div className={styles.statLabel}>Comments</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>--</div>
              <div className={styles.statLabel}>Authors</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
