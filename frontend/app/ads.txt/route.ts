import { ADSENSE_CLIENT } from "@/lib/google";

// Served at /ads.txt. Required by AdSense to authorise the publisher account.
export function GET() {
  if (!ADSENSE_CLIENT) {
    return new Response("Not found", { status: 404 });
  }
  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
