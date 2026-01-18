"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface SEOSettings {
  // Meta Tags
  siteTitle: string;
  siteTitleTemplate: string;
  defaultMetaDescription: string;
  siteKeywords: string[];

  // OpenGraph
  ogImage: string;
  ogType: string;
  ogLocale: string;

  // Twitter
  twitterHandle: string;
  twitterCardType: string;
  twitterSite: string;
  twitterCreator: string;

  // Search Engine Verification
  googleSiteVerification: string;
  bingSiteVerification: string;
  yandexVerification: string;

  // Robots & Indexing
  enableSitemap: boolean;
  enableRobotsTxt: boolean;
  noindex: boolean;
  nofollow: boolean;

  // RSS Feed
  enableRssFeed: boolean;
  rssTitle: string;
  rssDescription: string;
  rssItemCount: number;

  // Structured Data
  enableStructuredData: boolean;
  organizationName: string;
  organizationLogo: string;

  // Canonical URLs
  enableCanonical: boolean;
  canonicalBaseUrl: string;
}

export default function SEOPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/admin");
      return;
    }
    setIsAuthenticated(true);
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.data.seo) {
        setSeoSettings(data.data.seo);
      }
    } catch (error) {
      console.error("Failed to load SEO settings:", error);
    }
  };

  const handleSave = async () => {
    if (!seoSettings) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      // First get all settings
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (!data.success) {
        throw new Error("Failed to load settings");
      }

      // Update only SEO section
      const updatedSettings = {
        ...data.data,
        seo: seoSettings,
      };

      // Save back
      const saveRes = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      const saveData = await saveRes.json();

      if (saveData.success) {
        setSaveMessage("SEO settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      setSaveMessage("Error saving settings. Please try again.");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim() || !seoSettings) return;

    setSeoSettings({
      ...seoSettings,
      siteKeywords: [...seoSettings.siteKeywords, keywordInput.trim()],
    });
    setKeywordInput("");
  };

  const handleRemoveKeyword = (index: number) => {
    if (!seoSettings) return;

    setSeoSettings({
      ...seoSettings,
      siteKeywords: seoSettings.siteKeywords.filter((_, i) => i !== index),
    });
  };

  if (!isAuthenticated || !seoSettings) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading SEO settings...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>SEO Settings</h1>
        <p>Configure SEO, metadata, and search engine optimization settings</p>
      </div>

      <div className={styles.content}>
        {/* Meta Tags Section */}
        <section className={styles.section}>
          <h2>Meta Tags</h2>
          <div className={styles.formGroup}>
            <label>Site Title</label>
            <input
              type="text"
              value={seoSettings.siteTitle}
              onChange={(e) =>
                setSeoSettings({ ...seoSettings, siteTitle: e.target.value })
              }
              placeholder="My Awesome Blog"
            />
            <small>Main title for your website</small>
          </div>

          <div className={styles.formGroup}>
            <label>Title Template</label>
            <input
              type="text"
              value={seoSettings.siteTitleTemplate}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  siteTitleTemplate: e.target.value,
                })
              }
              placeholder="%s | My Awesome Blog"
            />
            <small>Use %s as placeholder for page title</small>
          </div>

          <div className={styles.formGroup}>
            <label>Default Meta Description</label>
            <textarea
              value={seoSettings.defaultMetaDescription}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  defaultMetaDescription: e.target.value,
                })
              }
              placeholder="A blog about technology, development, and life"
              rows={3}
            />
            <small>
              Default description for pages without specific meta description
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>Site Keywords</label>
            <div className={styles.keywordInput}>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddKeyword())
                }
                placeholder="Add keyword"
              />
              <button onClick={handleAddKeyword} type="button">
                Add
              </button>
            </div>
            <div className={styles.keywords}>
              {seoSettings.siteKeywords.map((keyword: string, index: number) => (
                <span key={index} className={styles.keyword}>
                  {keyword}
                  <button onClick={() => handleRemoveKeyword(index)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* OpenGraph Section */}
        <section className={styles.section}>
          <h2>OpenGraph (Social Sharing)</h2>
          <div className={styles.formGroup}>
            <label>Default OG Image URL</label>
            <input
              type="text"
              value={seoSettings.ogImage}
              onChange={(e) =>
                setSeoSettings({ ...seoSettings, ogImage: e.target.value })
              }
              placeholder="https://example.com/og-image.jpg"
            />
            <small>
              Default image for social media sharing (1200x630px recommended)
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>OG Type</label>
            <select
              value={seoSettings.ogType}
              onChange={(e) =>
                setSeoSettings({ ...seoSettings, ogType: e.target.value })
              }
            >
              <option value="website">Website</option>
              <option value="article">Article</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>OG Locale</label>
            <input
              type="text"
              value={seoSettings.ogLocale}
              onChange={(e) =>
                setSeoSettings({ ...seoSettings, ogLocale: e.target.value })
              }
              placeholder="en_US"
            />
          </div>
        </section>

        {/* Twitter Section */}
        <section className={styles.section}>
          <h2>Twitter / X</h2>
          <div className={styles.formGroup}>
            <label>Twitter Handle</label>
            <input
              type="text"
              value={seoSettings.twitterHandle}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  twitterHandle: e.target.value,
                })
              }
              placeholder="@myblog"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Twitter Card Type</label>
            <select
              value={seoSettings.twitterCardType}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  twitterCardType: e.target.value,
                })
              }
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="app">App</option>
              <option value="player">Player</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Twitter Site</label>
            <input
              type="text"
              value={seoSettings.twitterSite}
              onChange={(e) =>
                setSeoSettings({ ...seoSettings, twitterSite: e.target.value })
              }
              placeholder="@myblog"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Twitter Creator</label>
            <input
              type="text"
              value={seoSettings.twitterCreator}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  twitterCreator: e.target.value,
                })
              }
              placeholder="@author"
            />
          </div>
        </section>

        {/* Search Engine Verification */}
        <section className={styles.section}>
          <h2>Search Engine Verification</h2>
          <div className={styles.formGroup}>
            <label>Google Site Verification</label>
            <input
              type="text"
              value={seoSettings.googleSiteVerification}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  googleSiteVerification: e.target.value,
                })
              }
              placeholder="verification-code"
            />
            <small>Meta tag content from Google Search Console</small>
          </div>

          <div className={styles.formGroup}>
            <label>Bing Site Verification</label>
            <input
              type="text"
              value={seoSettings.bingSiteVerification}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  bingSiteVerification: e.target.value,
                })
              }
              placeholder="verification-code"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Yandex Verification</label>
            <input
              type="text"
              value={seoSettings.yandexVerification}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  yandexVerification: e.target.value,
                })
              }
              placeholder="verification-code"
            />
          </div>
        </section>

        {/* Robots & Indexing */}
        <section className={styles.section}>
          <h2>Robots & Indexing</h2>
          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.enableSitemap}
                onChange={(e) =>
                  setSeoSettings({
                    ...seoSettings,
                    enableSitemap: e.target.checked,
                  })
                }
              />
              <span>Enable Sitemap</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.enableRobotsTxt}
                onChange={(e) =>
                  setSeoSettings({
                    ...seoSettings,
                    enableRobotsTxt: e.target.checked,
                  })
                }
              />
              <span>Enable Robots.txt</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.noindex}
                onChange={(e) =>
                  setSeoSettings({ ...seoSettings, noindex: e.target.checked })
                }
              />
              <span>No Index (Prevent search engines from indexing)</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.nofollow}
                onChange={(e) =>
                  setSeoSettings({ ...seoSettings, nofollow: e.target.checked })
                }
              />
              <span>
                No Follow (Prevent search engines from following links)
              </span>
            </label>
          </div>
        </section>

        {/* RSS Feed */}
        <section className={styles.section}>
          <h2>RSS Feed</h2>
          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.enableRssFeed}
                onChange={(e) =>
                  setSeoSettings({
                    ...seoSettings,
                    enableRssFeed: e.target.checked,
                  })
                }
              />
              <span>Enable RSS Feed</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>RSS Title</label>
            <input
              type="text"
              value={seoSettings.rssTitle}
              onChange={(e) =>
                setSeoSettings({ ...seoSettings, rssTitle: e.target.value })
              }
              placeholder="My Awesome Blog RSS Feed"
            />
          </div>

          <div className={styles.formGroup}>
            <label>RSS Description</label>
            <textarea
              value={seoSettings.rssDescription}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  rssDescription: e.target.value,
                })
              }
              placeholder="Latest posts from My Awesome Blog"
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label>RSS Item Count</label>
            <input
              type="number"
              value={seoSettings.rssItemCount}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  rssItemCount: parseInt(e.target.value) || 20,
                })
              }
              min="1"
              max="100"
            />
            <small>Number of posts to include in RSS feed</small>
          </div>
        </section>

        {/* Structured Data */}
        <section className={styles.section}>
          <h2>Structured Data (Schema.org)</h2>
          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.enableStructuredData}
                onChange={(e) =>
                  setSeoSettings({
                    ...seoSettings,
                    enableStructuredData: e.target.checked,
                  })
                }
              />
              <span>Enable Structured Data</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Organization Name</label>
            <input
              type="text"
              value={seoSettings.organizationName}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  organizationName: e.target.value,
                })
              }
              placeholder="My Awesome Blog"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Organization Logo URL</label>
            <input
              type="text"
              value={seoSettings.organizationLogo}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  organizationLogo: e.target.value,
                })
              }
              placeholder="https://example.com/logo.png"
            />
          </div>
        </section>

        {/* Canonical URLs */}
        <section className={styles.section}>
          <h2>Canonical URLs</h2>
          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={seoSettings.enableCanonical}
                onChange={(e) =>
                  setSeoSettings({
                    ...seoSettings,
                    enableCanonical: e.target.checked,
                  })
                }
              />
              <span>Enable Canonical URLs</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Canonical Base URL</label>
            <input
              type="text"
              value={seoSettings.canonicalBaseUrl}
              onChange={(e) =>
                setSeoSettings({
                  ...seoSettings,
                  canonicalBaseUrl: e.target.value,
                })
              }
              placeholder="https://example.com"
            />
            <small>Base URL for canonical links (without trailing slash)</small>
          </div>
        </section>

        {/* Save Button */}
        <div className={styles.actions}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={styles.saveButton}
          >
            {isSaving ? "Saving..." : "Save SEO Settings"}
          </button>
          {saveMessage && <span className={styles.message}>{saveMessage}</span>}
        </div>
      </div>
    </div>
  );
}
