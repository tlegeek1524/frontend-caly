# คู่มือการ Deploy Calories Daily

## วิธีที่ 1: Deploy ผ่าน Netlify (แนะนำ)

### ขั้นตอน:

1. **สร้างบัญชี Netlify**
   - ไปที่ https://www.netlify.com/
   - สมัครสมาชิกด้วย GitHub, GitLab หรือ Email

2. **Push โค้ดขึ้น GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **เชื่อมต่อกับ Netlify**
   - ใน Netlify Dashboard คลิก "Add new site" > "Import an existing project"
   - เลือก GitHub และเลือก repository ของคุณ
   - ตั้งค่า Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - คลิก "Deploy site"

4. **ตั้งค่า Environment Variables**
   - ไปที่ Site settings > Environment variables
   - เพิ่มตัวแปรทั้งหมดจากไฟล์ `.env`:
     ```
     VITE_GEMINI_API_KEY=<your-key>
     VITE_LINE_CHANNEL_ID=2007300915
     VITE_LINE_CHANNEL_SECRET=<your-secret>
     VITE_LINE_CALLBACK_URL=https://your-site.netlify.app/auth/line/callback
     VITE_AIRTABLE_TOKEN_TDEE=<your-token>
     VITE_AIRTABLE_BASE_TDEE=<your-base>
     VITE_AIRTABLE_TABLE_TDEE=<your-table>
     VITE_AIRTABLE_TOKEN_FOOD=<your-token>
     VITE_AIRTABLE_BASE_FOOD=<your-base>
     VITE_AIRTABLE_TABLE_FOOD=<your-table>
     ```

5. **อัพเดท LINE Callback URL**
   - ไปที่ LINE Developers Console
   - อัพเดท Callback URL เป็น: `https://your-site.netlify.app/auth/line/callback`

6. **Redeploy**
   - กลับไปที่ Netlify Dashboard
   - คลิก "Trigger deploy" > "Deploy site"

---

## วิธีที่ 2: Deploy ผ่าน DirectAdmin (Hosting ของคุณ)

### ขั้นตอน:

1. **Build โปรเจค**
   ```bash
   npm run build
   ```
   - จะได้โฟลเดอร์ `dist` ที่มีไฟล์ HTML, CSS, JS

2. **อัพโหลดไฟล์**
   - เข้า DirectAdmin File Manager
   - ไปที่โฟลเดอร์ `public_html` หรือ `domains/caloriesdaily.com/public_html`
   - อัพโหลดไฟล์ทั้งหมดจากโฟลเดอร์ `dist`

3. **สร้างไฟล์ .htaccess**
   - สร้างไฟล์ `.htaccess` ในโฟลเดอร์ `public_html`
   - เพิ่มโค้ด:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

4. **อัพเดท Environment Variables**
   - แก้ไข `VITE_LINE_CALLBACK_URL` ใน `.env` เป็น:
     ```
     VITE_LINE_CALLBACK_URL=https://caloriesdaily.com/auth/line/callback
     ```
   - Build ใหม่: `npm run build`
   - อัพโหลดไฟล์ใหม่

5. **อัพเดท LINE Callback URL**
   - ไปที่ LINE Developers Console
   - อัพเดท Callback URL เป็น: `https://caloriesdaily.com/auth/line/callback`

---

## วิธีที่ 3: Deploy ผ่าน Vercel

### ขั้นตอน:

1. **สร้างบัญชี Vercel**
   - ไปที่ https://vercel.com/
   - สมัครสมาชิกด้วย GitHub

2. **Push โค้ดขึ้น GitHub** (ถ้ายังไม่ได้ทำ)

3. **Import Project**
   - ใน Vercel Dashboard คลิก "Add New" > "Project"
   - เลือก repository ของคุณ
   - Vercel จะตรวจจับ Vite โดยอัตโนมัติ
   - คลิก "Deploy"

4. **ตั้งค่า Environment Variables**
   - ไปที่ Project Settings > Environment Variables
   - เพิ่มตัวแปรทั้งหมดจากไฟล์ `.env`

5. **อัพเดท LINE Callback URL**
   - อัพเดทเป็น: `https://your-project.vercel.app/auth/line/callback`

---

## วิธีที่ 4: Deploy ผ่าน GitHub Pages

### ขั้นตอน:

1. **ติดตั้ง gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **แก้ไข vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

3. **เพิ่ม scripts ใน package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **ตั้งค่า GitHub Pages**
   - ไปที่ Repository Settings > Pages
   - เลือก branch `gh-pages`
   - Save

---

## คำแนะนำ:

- **Netlify/Vercel**: ดีที่สุดสำหรับ React/Vite apps, มี CI/CD อัตโนมัติ, SSL ฟรี
- **DirectAdmin**: ใช้ได้แต่ต้อง manual build และ upload ทุกครั้ง
- **GitHub Pages**: ฟรีแต่ไม่รองรับ environment variables ที่ซับซ้อน

**แนะนำ: ใช้ Netlify หรือ Vercel** เพราะ:
- Deploy อัตโนมัติเมื่อ push code
- SSL/HTTPS ฟรี
- CDN ทั่วโลก
- รองรับ environment variables
- มี preview สำหรับ pull requests
