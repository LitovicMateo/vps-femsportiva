import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { SiteSettings, DEFAULT_SETTINGS } from "@/types/settings";

// For now, store settings in a JSON file
// Later: integrate with WordPress Options API
const SETTINGS_FILE = path.join(process.cwd(), "data", "site-settings.json");

async function ensureSettingsFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    // File doesn't exist, create it with defaults
    const dataDir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(DEFAULT_SETTINGS, null, 2),
    );
  }
}

// GET /api/admin/settings - Fetch current settings
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getSession(request);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await ensureSettingsFile();
    const settingsData = await fs.readFile(SETTINGS_FILE, "utf-8");
    const settings: SiteSettings = JSON.parse(settingsData);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getSession(request);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();

    await ensureSettingsFile();

    // Read current settings
    const currentSettingsData = await fs.readFile(SETTINGS_FILE, "utf-8");
    const currentSettings: SiteSettings = JSON.parse(currentSettingsData);

    // Merge with new settings (deep merge for nested objects)
    const updatedSettings: SiteSettings = {
      ...currentSettings,
      ...body,
      features: { ...currentSettings.features, ...body.features },
      layout: { ...currentSettings.layout, ...body.layout },
      homepage: { ...currentSettings.homepage, ...body.homepage },
      navigation: { ...currentSettings.navigation, ...body.navigation },
      seo: { ...currentSettings.seo, ...body.seo },
      advanced: { ...currentSettings.advanced, ...body.advanced },
    };

    // Save updated settings
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

// POST /api/admin/settings/reset - Reset to defaults
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check

    await ensureSettingsFile();
    await fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(DEFAULT_SETTINGS, null, 2),
    );

    return NextResponse.json({
      success: true,
      message: "Settings reset to defaults",
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 },
    );
  }
}
