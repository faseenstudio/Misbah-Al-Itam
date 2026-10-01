/**
 * One-command local setup (Windows / macOS / Linux): `npm run setup`
 *   1. creates .env from .env.example (with a random AUTH_SECRET) if it doesn't exist
 *   2. waits for the database in DATABASE_URL
 *   3. applies all migrations and seeds funds, the Baan Takiang project and the dev admin
 */
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import pg from "pg";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
const step = (msg) => console.log(`\n▶ ${msg}`);

const [major] = process.versions.node.split(".").map(Number);
if (major < 20) {
  console.error(`ต้องใช้ Node.js 20 ขึ้นไป (ตอนนี้ ${process.versions.node}) — Node.js 20+ is required.`);
  process.exit(1);
}

step("ตรวจไฟล์ .env");
if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  const env = readFileSync(".env", "utf8").replace(/^AUTH_SECRET=""/m, `AUTH_SECRET="${randomBytes(32).toString("base64")}"`);
  writeFileSync(".env", env);
  console.log("  สร้าง .env จาก .env.example แล้ว (สุ่ม AUTH_SECRET ให้)");
} else {
  console.log("  มี .env อยู่แล้ว — ไม่แก้ไข");
}

// Load .env after it exists.
const { config } = await import("dotenv");
config();

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "\n⚠  .env มี SUPABASE_SERVICE_ROLE_KEY — สลิปและรูปจากเครื่องนี้จะถูกอัปโหลดขึ้น Supabase ตัวจริง\n" +
      "   ถ้าต้องการเก็บไฟล์ไว้ในเครื่อง (.data/) ให้ลบค่านี้ออกจาก .env",
  );
}

step("รอฐานข้อมูล");
const url = process.env.DATABASE_URL;
let connected = false;
for (let i = 0; i < 30 && !connected; i++) {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    connected = true;
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
  } finally {
    await client.end().catch(() => {});
  }
}
if (!connected) {
  console.error(
    `\n✖ เชื่อมต่อฐานข้อมูลไม่ได้: ${url?.replace(/:[^:@/]+@/, ":****@")}\n` +
      "  • ถ้าใช้ Docker: เปิด Docker Desktop แล้วรัน  npm run db:up\n" +
      "  • ถ้าติดตั้ง PostgreSQL เอง: สร้างฐานข้อมูลชื่อ misbah แล้วแก้ DATABASE_URL ใน .env",
  );
  process.exit(1);
}
console.log("  เชื่อมต่อได้แล้ว");

step("สร้างตารางในฐานข้อมูล (prisma migrate deploy)");
run("npx prisma migrate deploy");

step("เพิ่มข้อมูลตั้งต้น (กองทุน 5 กองทุน, โครงการบ้านตะเกียง, ผู้ดูแลระบบ)");
run("npx prisma db seed");

console.log(`
✔ พร้อมใช้งาน

  npm run dev          → http://localhost:3000
  หน้าผู้ดูแล           → http://localhost:3000/admin
  อีเมล / รหัสผ่าน      → ${process.env.SEED_ADMIN_EMAIL} / ${process.env.SEED_ADMIN_PASSWORD}
`);
