import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_SETTINGS } from "@/types/settings";

const SETTINGS_FILE = path.join(process.cwd(), "data", "site-settings.json");

// POST /api/admin/settings/reset - Reset to defaults
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getSession(request);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const dataDir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
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
