import { Hono } from "hono";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { requireInternalKey } from "../middleware/auth";

const trialRouter = new Hono();

// All trial routes require the internal API key
trialRouter.use("*", requireInternalKey);

// Simple JSON file store — persists between restarts
const DATA_DIR = join(process.cwd(), "data");
const TRIAL_FILE = join(DATA_DIR, "trial-claims.json");

// user_id must be a non-empty alphanumeric/dash/underscore string, max 128 chars
const USER_ID_REGEX = /^[a-zA-Z0-9_\-@.]{1,128}$/;

interface TrialRecord {
  userId: string;
  ip: string;
  claimedAt: string;
}

interface TrialStore {
  byUserId: Record<string, TrialRecord>;
  byIp: Record<string, TrialRecord>;
}

function loadStore(): TrialStore {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(TRIAL_FILE)) return { byUserId: {}, byIp: {} };
  try {
    return JSON.parse(readFileSync(TRIAL_FILE, "utf-8"));
  } catch {
    return { byUserId: {}, byIp: {} };
  }
}

function saveStore(store: TrialStore): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(TRIAL_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function getClientIp(c: any): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown"
  );
}

// POST /api/trial/check
// Body: { user_id?: string }
// Returns: { eligible: boolean, reason?: string }
trialRouter.post("/check", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const userId: unknown = body?.user_id;
  const ip = getClientIp(c);

  // Validate user_id format if provided
  if (userId !== undefined && (typeof userId !== "string" || !USER_ID_REGEX.test(userId))) {
    return c.json({ eligible: false, reason: "Invalid user_id format" });
  }

  const store = loadStore();

  // Check by user ID
  if (typeof userId === "string" && store.byUserId[userId]) {
    return c.json({ eligible: false, reason: "Trial already used for this account" });
  }

  // Check by IP (blocks same device/network abuse)
  if (ip !== "unknown" && store.byIp[ip]) {
    return c.json({ eligible: false, reason: "Trial already used from this device" });
  }

  return c.json({ eligible: true });
});

// POST /api/trial/claim
// Body: { user_id: string }
// Returns: { success: boolean, error?: string }
trialRouter.post("/claim", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const userId: unknown = body?.user_id;
  const ip = getClientIp(c);

  if (!userId || typeof userId !== "string") {
    return c.json({ success: false, error: "user_id required" }, 400);
  }

  // Validate format to prevent oversized keys or injection
  if (!USER_ID_REGEX.test(userId)) {
    return c.json({ success: false, error: "Invalid user_id format" }, 400);
  }

  const store = loadStore();

  // Reject if already claimed
  if (store.byUserId[userId]) {
    return c.json({ success: false, error: "Trial already claimed for this account" }, 409);
  }
  if (ip !== "unknown" && store.byIp[ip]) {
    return c.json({ success: false, error: "Trial already claimed from this device" }, 409);
  }

  const record: TrialRecord = { userId, ip, claimedAt: new Date().toISOString() };
  store.byUserId[userId] = record;
  if (ip !== "unknown") store.byIp[ip] = record;

  saveStore(store);
  console.log(`[Trial] Claimed: userId=${userId} ip=${ip}`);

  return c.json({ success: true });
});

export { trialRouter };
