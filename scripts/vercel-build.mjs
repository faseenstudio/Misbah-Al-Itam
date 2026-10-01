// Vercel build: apply database migrations only for the PRODUCTION deployment, so preview
// builds of unfinished branches can never change the live database schema.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (process.env.VERCEL_ENV === "production") {
  console.log("[vercel-build] production: applying migrations");
  run("prisma migrate deploy");
} else {
  console.log(`[vercel-build] ${process.env.VERCEL_ENV ?? "local"}: skipping migrations`);
}
run("next build");
