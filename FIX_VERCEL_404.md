# 🔧 แก้ปัญหา 404 NOT_FOUND ใน Vercel

## ปัญหา:
เมื่อเข้าเว็บไซต์แล้วเจอ error:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: sin1:sin1::rn9qt-1770972115199-01fb498d2c3a
```

## สาเหตุ:
Vercel ไม่รู้ว่าต้อง redirect ทุก route ไปที่ `index.html` (สำหรับ React Router)

## วิธีแก้:

### ขั้นตอนที่ 1: เพิ่มไฟล์ vercel.json

ผมได้สร้างไฟล์ `vercel.json` ให้แล้ว ตอนนี้ต้อง push ขึ้น GitHub:

```bash
# 1. Add ไฟล์ใหม่
git add vercel.json

# 2. Commit
git commit -m "Add vercel.json to fix 404 routing"

# 3. Push
git push
```

### ขั้นตอนที่ 2: รอ Vercel Deploy

Vercel จะ auto deploy เมื่อคุณ push code ขึ้น GitHub
- รอประมาณ 1-2 นาที
- ดูสถานะได้ที่ Vercel Dashboard > Deployments

### ขั้นตอนที่ 3: ทดสอบ

เปิด `https://frontend-caly.vercel.app` อีกครั้ง
- ควรเห็นหน้า LINE Login
- ไม่ควรเจอ 404 อีกต่อไป

---

## ถ้ายังเจอ 404 อยู่:

### วิธีที่ 1: ตรวจสอบว่า Build สำเร็จหรือไม่

1. ไปที่ Vercel Dashboard > Deployments
2. คลิกที่ deployment ล่าสุด
3. ดูว่า Build สำเร็จหรือไม่
4. ถ้า Build ล้มเหลว ดู error log

### วิธีที่ 2: ตรวจสอบ Build Settings

1. ไปที่ Vercel Dashboard > Settings > General
2. ตรวจสอบ:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` หรือ `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. ถ้าไม่ถูกต้อง แก้ไขแล้วคลิก Save

### วิธีที่ 3: Manual Redeploy

1. ไปที่ Deployments tab
2. คลิกที่ deployment ล่าสุด
3. คลิก **⋯** (three dots)
4. เลือก **Redeploy**
5. คลิก **Redeploy** อีกครั้งเพื่อยืนยัน

---

## ตรวจสอบไฟล์ที่สำคัญ:

### 1. vercel.json (ต้องมี)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. vite.config.js (ตรวจสอบ)
```javascript
export default defineConfig({
  plugins: [react()],
  // ไม่ต้องมี base: '/...' สำหรับ Vercel
})
```

### 3. package.json (ตรวจสอบ scripts)
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

---

## Debug เพิ่มเติม:

### ดู Build Logs:
1. Vercel Dashboard > Deployments
2. คลิกที่ deployment
3. ดู **Build Logs** tab
4. หา error (ถ้ามี)

### ดู Function Logs:
1. Vercel Dashboard > Deployments
2. คลิกที่ deployment
3. ดู **Functions** tab
4. หา error (ถ้ามี)

---

## คำสั่งที่ต้องรัน:

```bash
# Push vercel.json ขึ้น GitHub
git add vercel.json
git commit -m "Add vercel.json to fix 404 routing"
git push

# รอ Vercel auto deploy (1-2 นาที)
# จากนั้นทดสอบอีกครั้ง
```

---

## ถ้ายังไม่ได้:

ลองสร้างโปรเจคใหม่ใน Vercel:
1. ลบโปรเจคเก่า (ถ้าต้องการ)
2. Import project ใหม่
3. ตั้งค่า Environment Variables
4. Deploy

หรือติดต่อ Vercel Support: https://vercel.com/support
