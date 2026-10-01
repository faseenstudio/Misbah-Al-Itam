/**
 * One-time Supabase Storage setup: `npm run storage:setup`
 * Creates (or updates) the private e-Slip bucket and the public media bucket.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const BUCKETS = [
  {
    // Donor e-Slips contain personal bank details: never public.
    name: process.env.SUPABASE_SLIP_BUCKET || "slips",
    options: { public: false, fileSizeLimit: "5MB", allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] },
  },
  {
    // Activity / project photos shown on the public site.
    name: process.env.SUPABASE_MEDIA_BUCKET || "media",
    options: { public: true, fileSizeLimit: "10MB", allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] },
  },
];

async function main() {
  const { data: existing, error } = await supabase.storage.listBuckets();
  if (error) throw error;

  for (const { name, options } of BUCKETS) {
    const found = existing.find((b) => b.name === name);
    const result = found
      ? await supabase.storage.updateBucket(name, options)
      : await supabase.storage.createBucket(name, options);
    if (result.error) throw result.error;
    console.log(`${found ? "Updated" : "Created"} bucket "${name}" (${options.public ? "public" : "PRIVATE"})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
