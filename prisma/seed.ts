import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { FUNDS, FOUNDATION } from "../src/lib/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const fund of FUNDS) {
    await prisma.fund.upsert({
      where: { slug: fund.slug },
      update: {
        nameTh: fund.nameTh,
        nameEn: fund.nameEn,
        description: fund.description,
        accountNumber: fund.accountNumber,
        sortOrder: fund.sortOrder,
      },
      create: {
        slug: fund.slug,
        nameTh: fund.nameTh,
        nameEn: fund.nameEn,
        description: fund.description,
        bankName: FOUNDATION.bankName,
        accountNumber: fund.accountNumber,
        accountName: FOUNDATION.accountName,
        sortOrder: fund.sortOrder,
      },
    });
  }

  const waqfFund = await prisma.fund.findUniqueOrThrow({ where: { slug: "waqf" } });
  await prisma.project.upsert({
    where: { slug: "baan-takiang" },
    update: {},
    create: {
      slug: "baan-takiang",
      title: "โครงการวะกัฟ บ้านตะเกียง",
      summary: "ร่วมสร้างบ้านพักและศูนย์การเรียนรู้สำหรับเด็กกำพร้า เป็นวะกัฟที่ผลบุญไหลต่อเนื่องไม่สิ้นสุด",
      isFeatured: true,
      fundId: waqfFund.id,
    },
  });

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Administrator",
        passwordHash: await bcrypt.hash(password, 12),
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Seeded admin user: ${email}`);
  } else {
    console.warn("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user.");
  }

  console.log(`Seeded ${FUNDS.length} funds and the Baan Takiang project.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
