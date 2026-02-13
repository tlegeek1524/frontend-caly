# 🚀 Setup Vercel - Calories Daily

## ขั้นตอนที่ 1: หา Production URL

1. เข้า Vercel Dashboard: https://vercel.com/dashboard
2. เลือกโปรเจค "frontend-caly" (หรือชื่อที่คุณตั้ง)
3. ดูที่ส่วน **Domains** จะเห็น URL แบบ:
   ```
   https://frontend-caly.vercel.app
   ```
   หรือ
   ```
   https://calories-daily.vercel.app
   ```

⚠️ **อย่าใช้ URL ที่มี hash ยาวๆ** (เช่น `-j0q5opf81-tee-topuns-projects-94e3785c`) เพราะนั่นเป็น preview URL ชั่วคราว

---

## ขั้นตอนที่ 2: ตั้งค่า Environment Variables

1. ใน Vercel Dashboard > เลือกโปรเจค
2. ไปที่ **Settings** > **Environment Variables**
3. เพิ่มตัวแปรทั้งหมด:

### ตัวแปรที่ต้องเพิ่ม:

```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyDsMQ-nAaWbTRqj7AzVXRw64tXUCAHoo4A
Environment: Production, Preview, Development
```

```
Name: VITE_LINE_CHANNEL_ID
Value: 2007300915
Environment: Production, Preview, Development
```

```
Name: VITE_LINE_CHANNEL_SECRET
Value: e1d4489a71e28052b3d24ee4df81e381
Environment: Production, Preview, Development
```

```
Name: VITE_LINE_CALLBACK_URL
Value: https://YOUR-PROJECT-NAME.vercel.app/auth/line/callback
Environment: Production, Preview, Development
```
⚠️ **แทนที่ YOUR-PROJECT-NAME ด้วย URL จริงของคุณ!**

```
Name: VITE_AIRTABLE_TOKEN_TDEE
Value: patgf99zx29tmipxN.72f442c525fdeedf77828eb6789086cf79485113ce28098d3d8d4889c200ac06
Environment: Production, Preview, Development
```

```
Name: VITE_AIRTABLE_BASE_TDEE
Value: appyFkvl0Ml2jErM4
Environment: Production, Preview, Development
```

```
Name: VITE_AIRTABLE_TABLE_TDEE
Value: tbl9o23OiTayMB6KG
Environment: Production, Preview, Development
```

```
Name: VITE_AIRTABLE_TOKEN_FOOD
Value: patCLgwTI8L0PQNRU.e5422b1e60a8fab480cb97be49510ff0b372696275583e1f835d9369420d4eb6
Environment: Production, Preview, Development
```

```
Name: VITE_AIRTABLE_BASE_FOOD
Value: apphjExT9DgOFbvbs
Environment: Production, Preview, Development
```

```
Name: VITE_AIRTABLE_TABLE_FOOD
Value: tbl1SM7S0Khioak11
Environment: Production, Preview, Development
```

4. คลิก **Save** หลังจากเพิ่มแต่ละตัว

---

## ขั้นตอนที่ 3: Redeploy

1. ไปที่ **Deployments** tab
2. คลิกที่ deployment ล่าสุด
3. คลิก **⋯** (three dots) > **Redeploy**
4. เลือก **Use existing Build Cache** (ไม่เลือกก็ได้)
5. คลิก **Redeploy**

---

## ขั้นตอนที่ 4: อัพเดท LINE Callback URL

1. ไปที่ LINE Developers Console: https://developers.line.biz/console/
2. เลือก Channel ของคุณ (Channel ID: 2007300915)
3. ไปที่ **LINE Login** tab
4. ที่ **Callback URL** ใส่:
   ```
   https://YOUR-PROJECT-NAME.vercel.app/auth/line/callback
   ```
   ⚠️ **ใช้ URL จริงของคุณ!**

5. คลิก **Update**

---

## ขั้นตอนที่ 5: ทดสอบ

1. เปิด `https://YOUR-PROJECT-NAME.vercel.app`
2. คลิก "เข้าสู่ระบบด้วย LINE"
3. ควรจะ redirect ไป LINE Login
4. หลังจาก login สำเร็จ ควรกลับมาที่เว็บไซต์

---

## 🎯 ตัวอย่าง URL ที่ถูกต้อง:

### ถ้าโปรเจคชื่อ "frontend-caly":
```
Production URL: https://frontend-caly.vercel.app
Callback URL: https://frontend-caly.vercel.app/auth/line/callback
```

### ถ้าโปรเจคชื่อ "calories-daily":
```
Production URL: https://calories-daily.vercel.app
Callback URL: https://calories-daily.vercel.app/auth/line/callback
```

---

## 🔧 แก้ปัญหา

### ปัญหา: ไม่เห็น Environment Variables
- ตรวจสอบว่าอยู่ใน Project Settings (ไม่ใช่ Team Settings)
- URL: `https://vercel.com/YOUR-USERNAME/YOUR-PROJECT/settings/environment-variables`

### ปัญหา: LINE Login ไม่ทำงาน
- ตรวจสอบว่า Callback URL ใน LINE Console ตรงกับ Vercel URL
- ตรวจสอบว่า Redeploy แล้วหลังจากเพิ่ม Environment Variables
- เปิด Console (F12) ดู error

### ปัญหา: หน้าเว็บขาว
- ตรวจสอบ Console (F12)
- ตรวจสอบว่า Environment Variables ถูกต้อง
- Redeploy อีกครั้ง

---

## 📱 Custom Domain (ถ้าต้องการ)

ถ้าต้องการใช้ `caloriesdaily.com`:

1. ใน Vercel > Settings > Domains
2. เพิ่ม `caloriesdaily.com`
3. ตั้งค่า DNS ตามที่ Vercel บอก
4. อัพเดท LINE Callback URL เป็น:
   ```
   https://caloriesdaily.com/auth/line/callback
   ```
5. อัพเดท `VITE_LINE_CALLBACK_URL` ใน Environment Variables
6. Redeploy

---

## ✅ Checklist

- [ ] หา Production URL ของ Vercel
- [ ] เพิ่ม Environment Variables ทั้งหมด (10 ตัว)
- [ ] Redeploy โปรเจค
- [ ] อัพเดท LINE Callback URL
- [ ] ทดสอบ LINE Login
- [ ] ตรวจสอบว่าข้อมูลแสดงผลถูกต้อง
