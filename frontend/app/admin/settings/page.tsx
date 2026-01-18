"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteSettings } from "@/types/settings";
import styles from "./settings.module.css";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("features");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth !== "true") {
      router.push("/admin");
      return;
    }
    setIsAuthenticated(true);
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (
    key: keyof SiteSettings["features"],
    value: boolean,
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      features: { ...settings.features, [key]: value },
    });
  };

  const updateHomepage = (key: keyof SiteSettings["homepage"], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      homepage: { ...settings.homepage, [key]: value },
    });
  };

  const updateLayout = (key: keyof SiteSettings["layout"], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      layout: { ...settings.layout, [key]: value },
    });
  };

  const updateGeneral = (key: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!isAuthenticated || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!settings) {
    return <div className={styles.error}>Failed to load settings</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles.nav}>
          <a href="/admin" className={styles.navLink}>
            <span className={styles.icon}>📊</span>Dashboard
          </a>
          <a
            href="/admin/settings"
            className={`${styles.navLink} ${styles.active}`}
          >
            <span className={styles.icon}>⚙️</span>Settings
          </a>
          <a href="/" className={styles.navLink}>
            <span className={styles.icon}>🏠</span>View Site
          </a>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1>Site Settings</h1>
            <p>Configure your blog features, layout, and content</p>
          </div>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {saveMessage && <div className={styles.saveMessage}>{saveMessage}</div>}

        <div className={styles.tabs}>
          <button
            className={activeTab === "general" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={activeTab === "features" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("features")}
          >
            Features
          </button>
          <button
            className={activeTab === "homepage" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("homepage")}
          >
            Homepage
          </button>
          <button
            className={activeTab === "layout" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("layout")}
          >
            Layout
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "general" && (
            <div className={styles.section}>
              <h2>General Settings</h2>

              <div className={styles.formGroup}>
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateGeneral("siteName", e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Site Tagline</label>
                <input
                  type="text"
                  value={settings.siteTagline}
                  onChange={(e) => updateGeneral("siteTagline", e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) =>
                    updateGeneral("siteDescription", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    updateGeneral("contactEmail", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className={styles.section}>
              <h2>Feature Toggles</h2>
              <p className={styles.sectionDesc}>
                Enable or disable features on your blog
              </p>

              <div className={styles.toggleList}>
                <div className={styles.toggleItem}>
                  <div>
                    <h3>Authors Page</h3>
                    <p>Display a page listing all blog authors</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.authorsPage}
                      onChange={(e) =>
                        updateFeature("authorsPage", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Comments</h3>
                    <p>Allow readers to comment on posts</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.comments}
                      onChange={(e) =>
                        updateFeature("comments", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Search</h3>
                    <p>Enable search functionality</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.search}
                      onChange={(e) =>
                        updateFeature("search", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Tags</h3>
                    <p>Show tags on posts and tag pages</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.tags}
                      onChange={(e) => updateFeature("tags", e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Categories</h3>
                    <p>Show categories on posts and category pages</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.categories}
                      onChange={(e) =>
                        updateFeature("categories", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Related Posts</h3>
                    <p>Show related posts at the end of articles</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.relatedPosts}
                      onChange={(e) =>
                        updateFeature("relatedPosts", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Newsletter</h3>
                    <p>Show newsletter subscription form</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.newsletter}
                      onChange={(e) =>
                        updateFeature("newsletter", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div>
                    <h3>Dark Mode</h3>
                    <p>Enable dark mode toggle for users</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.features.darkMode}
                      onChange={(e) =>
                        updateFeature("darkMode", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "homepage" && (
            <div className={styles.section}>
              <h2>Homepage Settings</h2>

              <div className={styles.subsection}>
                <h3>Announcement Ticker</h3>
                <div className={styles.toggleItem}>
                  <div>
                    <h4>Show Ticker</h4>
                    <p>Display an announcement bar at the top</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.homepage.showTicker}
                      onChange={(e) =>
                        updateHomepage("showTicker", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {settings.homepage.showTicker && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Ticker Text</label>
                      <input
                        type="text"
                        value={settings.homepage.tickerText}
                        onChange={(e) =>
                          updateHomepage("tickerText", e.target.value)
                        }
                        placeholder="🎉 New blog post every week!"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Ticker Link (optional)</label>
                      <input
                        type="text"
                        value={settings.homepage.tickerLink}
                        onChange={(e) =>
                          updateHomepage("tickerLink", e.target.value)
                        }
                        placeholder="/latest-post"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className={styles.subsection}>
                <h3>Hero Section</h3>
                <div className={styles.toggleItem}>
                  <div>
                    <h4>Show Hero</h4>
                    <p>Display hero section on homepage</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.homepage.showHero}
                      onChange={(e) =>
                        updateHomepage("showHero", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {settings.homepage.showHero && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Hero Title</label>
                      <input
                        type="text"
                        value={settings.homepage.heroTitle}
                        onChange={(e) =>
                          updateHomepage("heroTitle", e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Hero Subtitle</label>
                      <input
                        type="text"
                        value={settings.homepage.heroSubtitle}
                        onChange={(e) =>
                          updateHomepage("heroSubtitle", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              <div className={styles.subsection}>
                <h3>Featured Posts</h3>
                <div className={styles.toggleItem}>
                  <div>
                    <h4>Show Featured Posts</h4>
                    <p>Display featured posts section</p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.homepage.showFeaturedPosts}
                      onChange={(e) =>
                        updateHomepage("showFeaturedPosts", e.target.checked)
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {settings.homepage.showFeaturedPosts && (
                  <div className={styles.formGroup}>
                    <label>Number of Featured Posts</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={settings.homepage.featuredPostsCount}
                      onChange={(e) =>
                        updateHomepage(
                          "featuredPostsCount",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className={styles.section}>
              <h2>Layout Settings</h2>

              <div className={styles.formGroup}>
                <label>Posts Per Page</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.layout.postsPerPage}
                  onChange={(e) =>
                    updateLayout("postsPerPage", parseInt(e.target.value))
                  }
                />
                <small>Number of posts to display on blog listing pages</small>
              </div>

              <div className={styles.formGroup}>
                <label>Header Style</label>
                <select
                  value={settings.layout.headerStyle}
                  onChange={(e) => updateLayout("headerStyle", e.target.value)}
                >
                  <option value="minimal">Minimal</option>
                  <option value="standard">Standard</option>
                  <option value="expanded">Expanded</option>
                </select>
              </div>

              <div className={styles.toggleItem}>
                <div>
                  <h3>Show Sidebar</h3>
                  <p>Display sidebar on post pages</p>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.layout.showSidebar}
                    onChange={(e) =>
                      updateLayout("showSidebar", e.target.checked)
                    }
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              {settings.layout.showSidebar && (
                <div className={styles.formGroup}>
                  <label>Sidebar Position</label>
                  <select
                    value={settings.layout.sidebarPosition}
                    onChange={(e) =>
                      updateLayout("sidebarPosition", e.target.value)
                    }
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Footer Columns</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={settings.layout.footerColumns}
                  onChange={(e) =>
                    updateLayout("footerColumns", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
