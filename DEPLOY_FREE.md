# 🆓 Deploy ฟรีโดยไม่ต้องตั้งค่า Environment Variables

## วิธีที่ 1: Netlify (ฟรี 100% - แนะนำ)

### ⚠️ หมายเหตุ: Netlify Free Tier รองรับ Environment Variables!

ถ้าคุณไม่เห็นเมนู Environment Variables ใน Netlify:

1. **ตรวจสอบว่าอยู่ที่ไหน:**
   - ไปที่ Site settings (ไม่ใช่ Team settings)
   - คลิก "Build & deploy" > "Environment"
   - หรือไปที่ URL: `https://app.netlify.com/sites/YOUR-SITE-NAME/settings/deploys#environment`

2. **ถ้ายังไม่เจอ ใช้วิธีนี้:**

### ขั้นตอน Deploy แบบ Build ค่าเข้าไปเลย:

```bash
# 1. ตรวจสอบไฟล์ .env.production
cat .env.production

# 2. Build โปรเจค (จะใช้ค่าจาก .env.production)
npm run build

# 3. Push ขึ้น GitHub
git add .
git commit -m "Add production build"
git push

# 4. Deploy ผ่าน Netlify
# Netlify จะ build และ deploy อัตโนมัติ
```

---

## วิธีที่ 2: Vercel (ฟรี 100%)

Vercel Free Tier รองรับ Environment Variables เต็มรูปแบบ!

### ขั้นตอน:

1. **สมัคร Vercel**
   - ไปที่ https://vercel.com/
   - Sign up ด้วย GitHub (ฟรี)

2. **Import Project**
   - คลิก "Add New" > "Project"
   - เลือก repository
   - Vercel จะตรวจจับ Vite อัตโนมัติ

3. **ตั้งค่า Environment Variables**
   - ใน Project Settings > Environment Variables
   - เพิ่มทีละตัว:
     ```
     VITE_GEMINI_API_KEY = AIzaSyDsMQ-nAaWbTRqj7AzVXRw64tXUCAHoo4A
     VITE_LINE_CHANNEL_ID = 2007300915
     VITE_LINE_CHANNEL_SECRET = e1d4489a71e28052b3d24ee4df81e381
     VITE_LINE_CALLBACK_URL = https://your-project.vercel.app/auth/line/callback
     ... (เพิ่มตัวอื่นๆ)
     ```

4. **Deploy**
   - คลิก "Deploy"
   - รอสักครู่จะได้ URL

5. **อัพเดท LINE Callback**
   - ไปที่ LINE Developers Console
   - เปลี่ยน Callback URL เป็น: `https://your-project.vercel.app/auth/line/callback`

---

## วิธีที่ 3: GitHub Pages (ฟรี แต่ต้อง Build เอง)

### ขั้นตอน:

1. **แก้ไข vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/calories-daily/', // ชื่อ repo ของคุณ
     plugins: [react()],
     // ... rest
   })
   ```

2. **Build และ Deploy**
   ```bash
   # Build
   npm run build
   
   # Install gh-pages
   npm install --save-dev gh-pages
   
   # เพิ่ม script ใน package.json
   # "deploy": "gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

3. **ตั้งค่า GitHub Pages**
   - ไปที่ Repository Settings > Pages
   - เลือก branch `gh-pages`
   - Save

4. **อัพเดท Callback URL**
   - `https://your-username.github.io/calories-daily/auth/line/callback`

---

## วิธีที่ 4: DirectAdmin (ที่คุณมีอยู่แล้ว)

### ขั้นตอน:

1. **Build โปรเจค**
   ```bash
   npm run build
   ```

2. **อัพโหลดผ่าน DirectAdmin**
   - เข้า File Manager
   - ไปที่ `public_html` หรือ `domains/caloriesdaily.com/public_html`
   - อัพโหลดไฟล์ทั้งหมดจาก `dist/`
   - อัพโหลด `.htaccess` จาก `public/`

3. **ตั้งค่า LINE Callback**
   - `https://caloriesdaily.com/auth/line/callback`

---

## 🎯 แนะนำ: Vercel

**ทำไมต้อง Vercel:**
- ✅ ฟรี 100%
- ✅ รองรับ Environment Variables
- ✅ Auto deploy เมื่อ push
- ✅ SSL/HTTPS ฟรี
- ✅ CDN เร็ว
- ✅ ไม่ต้อง manual upload

---

## 📝 Checklist

### สำหรับ Vercel/Netlify:
- [ ] Push code ขึ้น GitHub
- [ ] สร้าง account Vercel/Netlify
- [ ] Import project
- [ ] ตั้งค่า Environment Variables (ใน Vercel/Netlify Dashboard)
- [ ] Deploy
- [ ] อัพเดท LINE Callback URL
- [ ] ทดสอบ

### สำหรับ DirectAdmin:
- [ ] แก้ไข `.env.production` ให้ถูกต้อง
- [ ] รัน `npm run build`
- [ ] อัพโหลดไฟล์จาก `dist/`
- [ ] อัพโหลด `.htaccess`
- [ ] อัพเดท LINE Callback URL
- [ ] ทดสอบ

---

## ⚠️ คำเตือนด้านความปลอดภัย

เมื่อใช้ `.env.production` และ push ขึ้น GitHub:
- API Keys จะเห็นได้ใน GitHub
- ควรใช้ API Keys ที่จำกัด permissions
- ควร rotate keys เป็นระยะ
- พิจารณาใช้ Vercel/Netlify ที่รองรับ Environment Variables แทน

---

## 🆘 ต้องการความช่วยเหลือ?

ถ้ายังติดปัญหา ลอง:
1. ใช้ Vercel แทน Netlify (ง่ายกว่า)
2. หรือใช้ DirectAdmin ที่มีอยู่แล้ว
3. ติดต่อ support ของ Netlify/Vercel
