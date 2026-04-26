import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NextRequest } from "next/server";

/**
 * Dev-only handler: writes the panel's current tweak values to
 * tweaks-snapshot.json at the repo root so the assistant can read them
 * when locking in defaults. Disabled in production.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Disabled in production" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const path = join(process.cwd(), "tweaks-snapshot.json");
  const json = JSON.stringify(body, null, 2);
  await writeFile(path, json + "\n", "utf8");
  return Response.json({ ok: true, path: "tweaks-snapshot.json", bytes: json.length });
}
