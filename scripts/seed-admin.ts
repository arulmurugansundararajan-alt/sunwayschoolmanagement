/**
 * Seed script — creates the default admin (and demo staff/parent) users.
 *
 * Run:   npm run seed:admin
 *
 * Passwords are taken from env vars so they are never hardcoded:
 *   ADMIN_EMAIL       (default: admin@sunwayglobalschool.edu)
 *   ADMIN_PASSWORD    (REQUIRED — no default for security)
 *   STAFF_EMAIL       (default: staff@sunwayglobalschool.edu)
 *   STAFF_PASSWORD    (default: randomly generated if omitted)
 *   PARENT_EMAIL      (default: parent@sunwayglobalschool.edu)
 *   PARENT_PASSWORD   (default: randomly generated if omitted)
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// ─── Load .env.local (same pattern as lib/seed.ts) ────────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/praba-school";

// ─── Minimal User schema (avoids Next.js module issues in tsx context) ────────
const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["admin", "staff", "parent"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model("User", UserSchema);

// ─── Helper ───────────────────────────────────────────────────────────────────
function randomPassword(len = 16): string {
  return crypto.randomBytes(len).toString("base64url").slice(0, len);
}

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff" | "parent";
}

async function upsertUser(user: SeedUser): Promise<void> {
  const existing = await User.findOne({ email: user.email });
  if (existing) {
    console.log(`  ⤷ ${user.role.padEnd(7)} ${user.email}  — already exists, skipping`);
    return;
  }

  const hash = await bcrypt.hash(user.password, 12);
  await User.create({ ...user, password: hash });
  console.log(`  ✔  ${user.role.padEnd(7)} ${user.email}  — created`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    console.error(
      "\n[seed-admin] ERROR: ADMIN_PASSWORD env var is required.\n" +
        "  Add it to .env.local or pass it inline:\n" +
        "  ADMIN_PASSWORD=<secret> npm run seed:admin\n"
    );
    process.exit(1);
  }

  const staffPassword  = process.env.STAFF_PASSWORD  ?? randomPassword();
  const parentPassword = process.env.PARENT_PASSWORD ?? randomPassword();

  const users: SeedUser[] = [
    {
      name:     "School Admin",
      email:    process.env.ADMIN_EMAIL  ?? "admin@sunwayglobalschool.edu",
      password: process.env.ADMIN_PASSWORD,
      role:     "admin",
    },
    {
      name:     "Demo Staff",
      email:    process.env.STAFF_EMAIL  ?? "staff@sunwayglobalschool.edu",
      password: staffPassword,
      role:     "staff",
    },
    {
      name:     "Demo Parent",
      email:    process.env.PARENT_EMAIL ?? "parent@sunwayglobalschool.edu",
      password: parentPassword,
      role:     "parent",
    },
  ];

  console.log(`\n[seed-admin] Connecting to MongoDB…`);
  await mongoose.connect(MONGODB_URI);
  console.log("[seed-admin] Connected.\n");

  console.log("[seed-admin] Seeding users:");
  for (const u of users) await upsertUser(u);

  // Print generated passwords for staff/parent only when they were auto-generated
  if (!process.env.STAFF_PASSWORD) {
    console.log(`\n  ! STAFF_PASSWORD not set — generated: ${staffPassword}`);
    console.log("    Save this to .env.local as STAFF_PASSWORD=<value>\n");
  }
  if (!process.env.PARENT_PASSWORD) {
    console.log(`  ! PARENT_PASSWORD not set — generated: ${parentPassword}`);
    console.log("    Save this to .env.local as PARENT_PASSWORD=<value>\n");
  }

  await mongoose.disconnect();
  console.log("[seed-admin] Done.\n");
}

main().catch((err) => {
  console.error("[seed-admin] Fatal:", err);
  process.exit(1);
});
