# พัฒนาบนเครื่องตัวเอง (Local Development)

คู่มือนี้เขียนสำหรับ **Windows (PowerShell)** แต่คำสั่ง `npm` ใช้ได้เหมือนกันบน macOS / Linux

## 1. สิ่งที่ต้องติดตั้งก่อน (ครั้งเดียว)

| โปรแกรม | ใช้ทำอะไร | ดาวน์โหลด |
| --- | --- | --- |
| **Node.js 22 LTS** (หรือ 20 ขึ้นไป) | รันเว็บไซต์ | https://nodejs.org |
| **Git** | จัดการโค้ด | https://git-scm.com |
| **Docker Desktop** | รันฐานข้อมูล PostgreSQL ในเครื่อง | https://www.docker.com/products/docker-desktop |
| VS Code (แนะนำ) | แก้โค้ด | https://code.visualstudio.com |

ถ้าไม่อยากใช้ Docker ให้ติดตั้ง **PostgreSQL 16** จาก https://www.postgresql.org/download/windows/ แทน
แล้วสร้างฐานข้อมูลชื่อ `misbah` (user `postgres` รหัสผ่าน `postgres` หรือแก้ `DATABASE_URL` ใน `.env` ให้ตรง)

## 2. เอาโค้ดลงเครื่อง

**วิธี A — จาก GitHub** (เมื่อ push ขึ้น GitHub ได้แล้ว)

```powershell
cd "C:\Users\Windows 10\Documents\GitHub"
git clone https://github.com/faseenstudio/Misbah-Al-Itam.git
cd Misbah-Al-Itam
git checkout claude/admiring-ramanujan-6btnh3
```

**วิธี B — จากไฟล์ `misbah-al-itam.bundle`** (มีประวัติ commit ครบ)

```powershell
cd "C:\Users\Windows 10\Documents\GitHub"
git clone -b claude/admiring-ramanujan-6btnh3 "$HOME\Downloads\misbah-al-itam.bundle" Misbah-Al-Itam
cd Misbah-Al-Itam
git remote set-url origin https://github.com/faseenstudio/Misbah-Al-Itam.git
```

> ถ้าในโฟลเดอร์ `Misbah-Al-Itam` เดิมมีไฟล์อยู่แล้ว (เช่น zip ดีไซน์ / PDF) ให้ clone ไปชื่อโฟลเดอร์อื่น
> เช่น `Misbah-Al-Itam-web` แล้วค่อยย้ายไฟล์เหล่านั้นเข้าไปในโฟลเดอร์ `docs/`

## 3. ตั้งค่าครั้งแรก

```powershell
npm install        # ติดตั้งแพ็กเกจ (ครั้งแรกใช้เวลาสักครู่)
npm run db:up      # เปิด PostgreSQL ใน Docker (ต้องเปิด Docker Desktop ก่อน)
npm run setup      # สร้าง .env, สร้างตาราง, ใส่ข้อมูลตั้งต้น
```

`npm run setup` จะ

- สร้างไฟล์ `.env` จาก `.env.example` และสุ่ม `AUTH_SECRET` ให้ (ถ้ามี `.env` อยู่แล้วจะไม่แตะ)
- รอจนฐานข้อมูลพร้อม แล้วสร้างตารางทั้งหมด
- เพิ่ม 5 กองทุน, โครงการบ้านตะเกียง และบัญชีผู้ดูแล `admin@example.com` / `change-me-please`

## 4. เริ่มพัฒนา

```powershell
npm run dev
```

- เว็บไซต์: http://localhost:3000
- ระบบผู้ดูแล: http://localhost:3000/admin
- แก้ไฟล์ใน `src/` แล้วหน้าเว็บจะอัปเดตเอง (ครั้งแรกที่เปิดแต่ละหน้าอาจช้าเพราะกำลัง compile)

สลิปและรูปที่อัปโหลดตอนพัฒนาจะถูกเก็บในโฟลเดอร์ `.data/` ในเครื่อง **ไม่ขึ้น Supabase**
(ตราบใดที่ `SUPABASE_SERVICE_ROLE_KEY` ใน `.env` ยังว่าง — อย่าใส่ key ของเว็บจริงในเครื่องพัฒนา)

## คำสั่งที่ใช้บ่อย

| คำสั่ง | ทำอะไร |
| --- | --- |
| `npm run dev` | รันเว็บโหมดพัฒนา |
| `npm run db:up` / `npm run db:down` | เปิด / ปิดฐานข้อมูลใน Docker (ข้อมูลยังอยู่) |
| `npm run db:studio` | เปิดดู/แก้ข้อมูลในฐานข้อมูลผ่านเบราว์เซอร์ (Prisma Studio) |
| `npm run db:migrate -- --name ชื่อการเปลี่ยนแปลง` | หลังแก้ `prisma/schema.prisma` → สร้างและใช้ migration ใหม่ |
| `npm run db:reset` | **ล้างฐานข้อมูลในเครื่องทั้งหมด** แล้วสร้างใหม่พร้อมข้อมูลตั้งต้น |
| `npm run lint` / `npm run typecheck` | ตรวจโค้ดก่อน commit |
| `npm run build` | ทดลอง build แบบ production |

## ส่งงานขึ้น GitHub / Vercel

```powershell
git add -A
git commit -m "อธิบายสิ่งที่แก้"
git push
```

Vercel จะ deploy ให้อัตโนมัติเมื่อ push (ดูการตั้งค่าใน [DEPLOY.md](DEPLOY.md))
migration ใหม่จะถูกใช้กับฐานข้อมูลจริงเฉพาะตอน deploy production เท่านั้น

## แก้ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
| --- | --- |
| `npm run db:up` แจ้งว่าหา docker ไม่เจอ | เปิด Docker Desktop ให้ขึ้นสถานะ *Running* ก่อน |
| พอร์ต 5432 ถูกใช้อยู่ (มี PostgreSQL ติดตั้งในเครื่องแล้ว) | ใน `docker-compose.yml` เปลี่ยน `"5432:5432"` เป็น `"5433:5432"` และแก้ `DATABASE_URL` ใน `.env` เป็น `localhost:5433` |
| พอร์ต 3000 ถูกใช้อยู่ | `npm run dev -- -p 3001` แล้วแก้ `AUTH_URL` ใน `.env` เป็น `http://localhost:3001` (ไม่งั้นล็อกอินแล้วจะเด้งไปพอร์ตผิด) |
| ล็อกอินผิดหลายครั้งจนถูกล็อก 15 นาที | รอ 15 นาที หรือ `npm run db:studio` → ตาราง `RateLimit` → ลบทุกแถว |
| แก้ `schema.prisma` แล้ว TypeScript ฟ้องว่าไม่มีฟิลด์ใหม่ | รัน `npm run db:migrate -- --name ...` (จะ generate client ให้ด้วย) หรือ `npm run db:generate` |
| PowerShell ไม่ยอมรัน `npm` (execution policy) | เปิด PowerShell แล้วรัน `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
