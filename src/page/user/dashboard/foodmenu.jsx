import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAI from 'openai';
import BottomNav from '../../../components/BottomNav/BottomNav';

// Airtable Functions
const fetchFoodRecords = async (lineUid, selectedDate) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_FOOD;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_FOOD;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_FOOD;
  
  try {
    let allRecords = [];
    let offset = null;
    
    // ดึงข้อมูลทั้งหมดด้วย pagination
    do {
      const url = offset 
        ? `https://api.airtable.com/v0/${baseId}/${tableId}?offset=${offset}`
        : `https://api.airtable.com/v0/${baseId}/${tableId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.records) {
        allRecords = allRecords.concat(data.records);
      }
      
      offset = data.offset;
    } while (offset);
    
    if (!allRecords.length) return [];
    
    const records = allRecords
      .filter(record => {
        const fields = record.fields;
        if (fields.line_uid !== lineUid) return false;
        const recordDate = fields.date || '2000-01-01T00:00:00.000Z';
        const recordDateTime = new Date(recordDate);
        const recordDateStr = recordDateTime.toISOString().split('T')[0];
        return recordDateStr === selectedDate;
      })
      .map(record => ({
        id: record.id,
        menu: record.fields.menu || 'ไม่ระบุเมนู',
        date: record.fields.date,
        cal: record.fields.cal || 0,
        protein: record.fields.protine || 0,
        carb: record.fields.carb || 0,
        fat: record.fields.fat || 0,
        image: record.fields.image?.[0]?.url || null,
        runnum: record.fields.runnum || null
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return records;
  } catch (error) {
    console.error('Error fetching food records:', error);
    return [];
  }
};

// ดึงข้อมูลอาหารหลังกินจาก Table2
const fetchFoodAfterRecords = async (lineUid) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_FOOD;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_FOOD;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_FOOD_AFTER;
  
  try {
    let allRecords = [];
    let offset = null;
    
    do {
      const url = offset 
        ? `https://api.airtable.com/v0/${baseId}/${tableId}?offset=${offset}`
        : `https://api.airtable.com/v0/${baseId}/${tableId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.records) {
        allRecords = allRecords.concat(data.records);
      }
      
      offset = data.offset;
    } while (offset);
    
    if (!allRecords.length) return [];
    
    // กรองเฉพาะ line_uid เท่านั้น (ไม่กรองวันที่)
    const records = allRecords
      .filter(record => record.fields.line_uid === lineUid)
      .map(record => ({
        id: record.id,
        menu: record.fields.menu || 'ไม่ระบุเมนู',
        date: record.fields.date,
        cal: record.fields.cal || 0,
        protein: record.fields.protine || 0,
        carb: record.fields.carb || 0,
        fat: record.fields.fat || 0,
        image: record.fields.image?.[0]?.url || null,
        runnum: record.fields.runnum || null,
        mash: record.fields.mash || null,
        eatPercent: record.fields.EatPercent || 0
      }));
    
    return records;
  } catch (error) {
    console.error('❌ Error fetching food after records:', error);
    return [];
  }
};

const deleteFoodRecord = async (recordId) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_FOOD;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_FOOD;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_FOOD;
  
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting record:', error);
    return false;
  }
};

// ลบรายการหลังกินจาก Table2
const deleteFoodAfterRecord = async (recordId) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_FOOD;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_FOOD;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_FOOD_AFTER;
  
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting after record:', error);
    return false;
  }
};

// ฟังก์ชันอัพโหลดรูปไป ImgBB
const uploadImageToImgBB = async (imageFile) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url; // URL ของรูปที่อัพโหลด
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};

// ฟังก์ชัน compress รูปภาพ
const compressImage = async (file, maxSizeMB = 1, maxWidthOrHeight = 1920) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // คำนวณขนาดใหม่โดยรักษา aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height *= maxWidthOrHeight / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width *= maxWidthOrHeight / height;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // ลด quality จนกว่าจะได้ขนาดที่ต้องการ
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                // แปลง blob เป็น file
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const addFoodRecord = async (lineUid, foodData, imageFile) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_FOOD;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_FOOD;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_FOOD;
  
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  
  try {
    // Compress และอัพโหลดรูปภาพ
    let imageAttachment = null;
    if (imageFile) {
      const compressedFile = await compressImage(imageFile, 1, 1920);
      
      // อัพโหลดไป ImgBB
      const imageUrl = await uploadImageToImgBB(compressedFile);
      
      // Airtable รับ attachment ในรูปแบบ URL
      imageAttachment = [{
        url: imageUrl
      }];
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          line_uid: lineUid,
          menu: foodData.menu,
          cal: foodData.cal,
          protine: foodData.protein,
          carb: foodData.carb,
          fat: foodData.fat,
          date: new Date().toISOString(),
          ...(imageAttachment && { image: imageAttachment })
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to save record');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding food record:', error);
    return null;
  }
};

// ฟังก์ชันบันทึกข้อมูลหลังกินลง Table2
const addFoodAfterRecord = async (lineUid, foodData, imageFile, originalRunnum, eatPercent) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_FOOD;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_FOOD;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_FOOD_AFTER; // Table2
  
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  
  try {
    // Compress และอัพโหลดรูปภาพหลังกิน
    let imageAttachment = null;
    if (imageFile) {
      const compressedFile = await compressImage(imageFile, 1, 1920);
      
      // อัพโหลดไป ImgBB
      const imageUrl = await uploadImageToImgBB(compressedFile);
      
      // Airtable รับ attachment ในรูปแบบ URL
      imageAttachment = [{
        url: imageUrl
      }];
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          line_uid: lineUid,
          menu: foodData.menu,
          cal: foodData.cal,
          protine: foodData.protein,
          carb: foodData.carb,
          fat: foodData.fat,
          date: new Date().toISOString().split('T')[0], // รูปแบบ "2026-05-13"
          mash: originalRunnum, // เลข runnum จากรูปก่อนกิน
          EatPercent: Math.round(eatPercent), // % ที่กิน (เลขจำนวนเต็ม)
          ...(imageAttachment && { image: imageAttachment })
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Airtable Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to save after food record');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error adding food after record:', error);
    return null;
  }
};

// OpenAI GPT Function
const analyzeFoodImage = async (imageFile) => {
  try {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true // สำหรับใช้ใน browser
    });
    
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
    
    const prompt = `วิเคราะห์รูปอาหารนี้และส่งข้อมูลกลับมาในรูปแบบ JSON เท่านั้น:
{
  "menu": "ชื่ออาหาร (ภาษาไทย)",
  "cal": จำนวนแคลอรี่ (ตัวเลข),
  "protein": จำนวนโปรตีน (กรัม, ตัวเลข),
  "carb": จำนวนคาร์โบไฮเดรต (กรัม, ตัวเลข),
  "fat": จำนวนไขมัน (กรัม, ตัวเลข)
}
ส่งเฉพาะ JSON เท่านั้น`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });
    
    const text = response.choices[0].message.content;
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('ไม่สามารถแปลง response เป็น JSON ได้');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const FoodMenu = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayDate, setDisplayDate] = useState(new Date().toISOString().split('T')[0]);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodRecords, setFoodRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFoodData, setPendingFoodData] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [selectedFoodForCompare, setSelectedFoodForCompare] = useState(null);
  const [foodAfterRecords, setFoodAfterRecords] = useState([]);
  const [showManualPercentModal, setShowManualPercentModal] = useState(false);
  const [manualPercent, setManualPercent] = useState(50);
  const [aiSuggestedPercent, setAiSuggestedPercent] = useState(0);
  const [pendingAfterImage, setPendingAfterImage] = useState(null);
  const containerRef = useRef(null);

  // ดึงข้อมูล user
  const user = React.useMemo(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }, []);

  // ถ้าไม่มี user ให้กลับไปหน้า login
  useEffect(() => {
    if (!user) {
      navigate('/linelogin');
    }
  }, [user, navigate]);

  // ดึงรายการอาหารครั้งแรก
  useEffect(() => {
    if (!user || !user.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [records, afterRecords] = await Promise.all([
          fetchFoodRecords(user.id, displayDate),
          fetchFoodAfterRecords(user.id) // ไม่ส่ง selectedDate
        ]);
        setFoodRecords(records);
        setFoodAfterRecords(afterRecords);
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, displayDate]);

  // ฟังก์ชันสำหรับกดปุ่ม "ดู"
  const handleViewDate = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      const [records, afterRecords] = await Promise.all([
        fetchFoodRecords(user.id, selectedDate),
        fetchFoodAfterRecords(user.id) // ไม่ส่ง selectedDate
      ]);
      setFoodRecords(records);
      setFoodAfterRecords(afterRecords);
      setDisplayDate(selectedDate);
      
      // ถ้าไม่มีข้อมูล แสดง popup
      if (records.length === 0) {
        setShowNoDataModal(true);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -100) {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [touchStart, touchEnd]);
  
  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      const success = await deleteFoodRecord(id);
      if (success) {
        alert('ลบข้อมูลเรียบร้อย');
        // รีโหลดข้อมูล
        const [records, afterRecords] = await Promise.all([
          fetchFoodRecords(user.id, displayDate),
          fetchFoodAfterRecords(user.id)
        ]);
        setFoodRecords(records);
        setFoodAfterRecords(afterRecords);
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleDeleteAfter = async (afterId) => {
    if (window.confirm('คุณต้องการลบรูปหลังกินหรือไม่?')) {
      const success = await deleteFoodAfterRecord(afterId);
      if (success) {
        alert('ลบรูปหลังกินเรียบร้อย');
        // รีโหลดข้อมูล
        const afterRecords = await fetchFoodAfterRecords(user.id);
        setFoodAfterRecords(afterRecords);
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleDeleteBoth = async (beforeId, afterId) => {
    if (window.confirm('⚠️ คุณต้องการลบรูปทั้งก่อนกินและหลังกินหรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้')) {
      const [successBefore, successAfter] = await Promise.all([
        deleteFoodRecord(beforeId),
        deleteFoodAfterRecord(afterId)
      ]);
      
      if (successBefore && successAfter) {
        alert('ลบข้อมูลทั้งหมดเรียบร้อย');
      } else if (successBefore) {
        alert('ลบรูปก่อนกินสำเร็จ แต่ลบรูปหลังกินไม่สำเร็จ');
      } else if (successAfter) {
        alert('ลบรูปหลังกินสำเร็จ แต่ลบรูปก่อนกินไม่สำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
      
      // รีโหลดข้อมูล
      const [records, afterRecords] = await Promise.all([
        fetchFoodRecords(user.id, displayDate),
        fetchFoodAfterRecords(user.id)
      ]);
      setFoodRecords(records);
      setFoodAfterRecords(afterRecords);
    }
  };

  const handleCompareFood = (item) => {
    // เก็บข้อมูลอาหารที่เลือก
    setSelectedFoodForCompare(item);
    // แสดง modal ให้เลือกถ่ายรูป/อัปโหลด
    setShowCompareModal(true);
  };

  const handleCompareCameraCapture = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // ใช้ capture="environment" สำหรับกล้องหลัง
    input.setAttribute('capture', 'environment');
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setShowCompareModal(false);
        await processCompareImage(file);
      }
    };
    
    input.click();
  };

  const handleCompareGallerySelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setShowCompareModal(false);
        await processCompareImage(file);
      }
    };
    
    input.click();
  };

  const processCompareImage = async (afterImageFile) => {
    if (!selectedFoodForCompare) return;
    
    setIsComparing(true);
    
    try {
      console.log('🔄 กำลังเปรียบเทียบรูปภาพ...');
      
      // แปลงรูปหลังกินเป็น base64
      const afterImageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(afterImageFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      
      // ดึงรูปก่อนกินจาก URL
      const beforeImageUrl = selectedFoodForCompare.image;
      
      const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true
      });
      
      const prompt = `เปรียบเทียบรูปอาหาร 2 รูป:

รูปที่ 1 (ก่อนกิน): อาหารจานเต็ม
รูปที่ 2 (หลังกิน): อาหารที่เหลือในจาน

ข้อมูลอาหารเดิม:
- เมนู: ${selectedFoodForCompare.menu}
- แคลอรี่: ${selectedFoodForCompare.cal} kcal
- โปรตีน: ${selectedFoodForCompare.protein} g
- คาร์โบไฮเดรต: ${selectedFoodForCompare.carb} g
- ไขมัน: ${selectedFoodForCompare.fat} g

วิเคราะห์และส่งข้อมูลกลับมาในรูปแบบ JSON เท่านั้น:
{
  "percentEaten": เปอร์เซ็นต์ที่กินไป (0-100, ตัวเลข),
  "caloriesConsumed": แคลอรี่ที่กินไปจริง (ตัวเลข),
  "proteinConsumed": โปรตีนที่กินไป (กรัม, ตัวเลข),
  "carbConsumed": คาร์โบไฮเดรตที่กินไป (กรัม, ตัวเลข),
  "fatConsumed": ไขมันที่กินไป (กรัม, ตัวเลข),
  "analysis": "คำอธิบายสั้นๆ ภาษาไทย"
}

ส่งเฉพาะ JSON เท่านั้น`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: beforeImageUrl,
                  detail: "high"
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: afterImageBase64,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });
      
      const text = response.choices[0].message.content;
      console.log('📊 Response:', text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // เก็บข้อมูลไว้ชั่วคราว
        setAiSuggestedPercent(Math.round(result.percentEaten));
        setManualPercent(Math.round(result.percentEaten));
        setPendingAfterImage(afterImageFile);
        
        // ปิด loading modal ก่อน
        setIsComparing(false);
        
        // แสดง modal ให้ผู้ใช้ปรับ % เอง
        setShowManualPercentModal(true);
      } else {
        throw new Error('ไม่สามารถแปลง response เป็น JSON ได้');
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาด:', error);
      alert('ไม่สามารถเปรียบเทียบรูปภาพได้ กรุณาลองใหม่');
      setIsComparing(false);
      setSelectedFoodForCompare(null);
    }
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleCameraCapture = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // ใช้ capture="environment" สำหรับกล้องหลัง (ทำงานได้ดีกว่าในทุกอุปกรณ์)
    input.setAttribute('capture', 'environment');
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setShowCameraModal(false);
        setIsAnalyzing(true);
        
        try {
          // สร้าง preview URL
          const previewUrl = URL.createObjectURL(file);
          
          console.log('กำลังวิเคราะห์รูปภาพ...');
          const foodData = await analyzeFoodImage(file);
          console.log('✅ ผลการวิเคราะห์:', foodData);
          
          // แสดง modal ให้ user ตรวจสอบข้อมูล
          setPendingFoodData(foodData);
          setPendingImageFile(file);
          setPendingImagePreview(previewUrl);
          setShowConfirmModal(true);
        } catch (error) {
          console.error('❌ เกิดข้อผิดพลาด:', error);
          alert('ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่');
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    
    input.click();
  };

  const handleGallerySelect = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setShowCameraModal(false);
        setIsAnalyzing(true);
        
        try {
          // สร้าง preview URL
          const previewUrl = URL.createObjectURL(file);
          
          console.log('กำลังวิเคราะห์รูปภาพ...');
          const foodData = await analyzeFoodImage(file);
          console.log('✅ ผลการวิเคราะห์:', foodData);
          
          // แสดง modal ให้ user ตรวจสอบข้อมูล
          setPendingFoodData(foodData);
          setPendingImageFile(file);
          setPendingImagePreview(previewUrl);
          setShowConfirmModal(true);
        } catch (error) {
          console.error('❌ เกิดข้อผิดพลาด:', error);
          alert('ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่');
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
    
    input.click();
  };

  const handleConfirmSave = async () => {
    if (!pendingFoodData || !user?.id) return;
    
    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      // ส่งพิกัด GPS ไปที่ backend แบบเบื้องหลัง (ถ้าดึงได้)
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          
          const payload = {
            user_id: user.id.toString(),
            source_type: 'web',
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude)
          };
          
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
          fetch(`${apiUrl.replace(/\/$/, '')}/api/upload-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(e => console.error("Location upload failed", e));
        } catch (gpsError) {
          console.warn("ไม่สามารถดึงพิกัด GPS ได้:", gpsError);
        }
      }

      // บันทึกข้อมูลพร้อมรูปภาพลง Airtable
      const result = await addFoodRecord(user.id, pendingFoodData, pendingImageFile);
      
      if (result) {
        // รีโหลดข้อมูล
        const records = await fetchFoodRecords(user.id, displayDate);
        setFoodRecords(records);
      } else {
        alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
      setPendingFoodData(null);
      setPendingImageFile(null);
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
        setPendingImagePreview(null);
      }
    }
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
    setPendingFoodData(null);
    setPendingImageFile(null);
    // ลบ preview URL เพื่อป้องกัน memory leak
    if (pendingImagePreview) {
      URL.revokeObjectURL(pendingImagePreview);
      setPendingImagePreview(null);
    }
  };

  const handleConfirmManualPercent = async () => {
    if (!selectedFoodForCompare || !pendingAfterImage || !user?.id) return;
    
    setShowManualPercentModal(false);
    setLoading(true);
    
    try {
      // คำนวณสารอาหารตาม % ที่ผู้ใช้เลือก
      const percentDecimal = manualPercent / 100;
      const afterFoodData = {
        menu: selectedFoodForCompare.menu,
        cal: Math.round(selectedFoodForCompare.cal * percentDecimal),
        protein: Math.round(selectedFoodForCompare.protein * percentDecimal),
        carb: Math.round(selectedFoodForCompare.carb * percentDecimal),
        fat: Math.round(selectedFoodForCompare.fat * percentDecimal)
      };
      
      const saveResult = await addFoodAfterRecord(
        user.id,
        afterFoodData,
        pendingAfterImage,
        selectedFoodForCompare.runnum,
        manualPercent
      );
      
      if (saveResult) {
        // รีโหลดข้อมูล
        const [records, afterRecords] = await Promise.all([
          fetchFoodRecords(user.id, displayDate),
          fetchFoodAfterRecords(user.id)
        ]);
        setFoodRecords(records);
        setFoodAfterRecords(afterRecords);
      } else {
        throw new Error('ไม่สามารถบันทึกข้อมูลได้');
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาด:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
      setSelectedFoodForCompare(null);
      setPendingAfterImage(null);
      setManualPercent(50);
      setAiSuggestedPercent(0);
    }
  };

  const handleCancelManualPercent = () => {
    setShowManualPercentModal(false);
    setSelectedFoodForCompare(null);
    setPendingAfterImage(null);
    setManualPercent(50);
    setAiSuggestedPercent(0);
  };

  // คำนวณสรุปโภชนาการ - ใช้ค่าจริงที่กินไป
  // ถ้ามีรูปหลังกิน (Table2) ให้ใช้ค่าจาก Table2
  // ถ้าไม่มีรูปหลังกิน ให้ใช้ค่าจาก Table1 (ก่อนกิน)
  let totalCal = 0;
  let totalProtein = 0;
  let totalCarb = 0;
  let totalFat = 0;

  foodRecords.forEach(record => {
    // หาข้อมูลหลังกินที่ตรงกับ runnum
    const afterData = foodAfterRecords.find(after => after.mash === record.runnum);
    
    if (afterData) {
      // ถ้ามีรูปหลังกิน ใช้ค่าจาก Table2
      totalCal += afterData.cal || 0;
      totalProtein += afterData.protein || 0;
      totalCarb += afterData.carb || 0;
      totalFat += afterData.fat || 0;
    } else {
      // ถ้าไม่มีรูปหลังกิน ใช้ค่าจาก Table1
      totalCal += record.cal || 0;
      totalProtein += record.protein || 0;
      totalCarb += record.carb || 0;
      totalFat += record.fat || 0;
    }
  });

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#f2f2f7] pb-20" 
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {/* Navbar */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-3 sm:px-4 py-4 sm:py-6 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight">
            Calories Daily
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {/* Date Filter */}
        <div className="bg-white rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 shadow-sm animate-slideUpCard">
          <label htmlFor="dateSelectFood" className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">เลือกวันที่</label>
          <div className="flex gap-2">
            <input 
              id="dateSelectFood"
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-2.5 sm:px-3 py-2 text-[14px] sm:text-[15px] bg-[#f2f2f7] rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none transition-all duration-200 cursor-pointer"
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none'
              }}
            />
            <button 
              onClick={handleViewDate}
              disabled={loading}
              className="px-3 sm:px-4 py-2 text-[14px] sm:text-[15px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังโหลด...' : 'ดู'}
            </button>
          </div>
        </div>

        {/* Food List */}
        <div className="animate-slideUpCard animate-delay-100">
          <h5 className="text-[15px] sm:text-[17px] font-semibold text-black mb-2.5 sm:mb-3 px-1">
            รายการอาหารวันที่ {new Date(displayDate).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h5>
          <div className="space-y-2.5 sm:space-y-3">
            {foodRecords.map((item, index) => {
              // หาข้อมูลหลังกินที่ตรงกับ runnum (Table1) = mash (Table2)
              const afterData = foodAfterRecords.find(after => {
                return after.mash == item.runnum || String(after.mash) === String(item.runnum);
              });
              
              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[10px] sm:rounded-[12px] overflow-hidden shadow-sm animate-slideUpCard" 
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="bg-[#f2f2f7] px-3 sm:px-4 py-2 flex justify-between items-center border-b border-[#e5e5ea]">
                    <span className="text-[14px] sm:text-[15px] font-semibold text-black truncate flex-1 mr-2">{item.menu}</span>
                    <span className="text-[12px] sm:text-[13px] text-[#8e8e93] shrink-0">
                      {new Date(item.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                <div className="p-3 sm:p-4">
                  {/* ข้อมูลก่อนกิน */}
                  <div className="mb-3 sm:mb-4">
                    <div className="text-[12px] sm:text-[13px] font-semibold text-green-600 mb-1.5 sm:mb-2">🍽️ ก่อนกิน</div>
                    <div className="flex gap-2.5 sm:gap-3 items-start">
                      <img 
                        src={item.image} 
                        alt={item.menu}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-[#f2f2f7] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 shrink-0"></div>
                            <span className="text-[12px] sm:text-[13px] text-[#8e8e93] truncate">{item.cal} kcal</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shrink-0"></div>
                            <span className="text-[12px] sm:text-[13px] text-[#8e8e93] truncate">{item.protein}g โปรตีน</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 shrink-0"></div>
                            <span className="text-[12px] sm:text-[13px] text-[#8e8e93] truncate">{item.carb}g คาร์บ</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shrink-0"></div>
                            <span className="text-[12px] sm:text-[13px] text-[#8e8e93] truncate">{item.fat}g ไขมัน</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ข้อมูลหลังกิน (ถ้ามี) */}
                  {afterData && (
                    <div className="mb-2.5 sm:mb-3 pt-2.5 sm:pt-3 border-t border-[#e5e5ea]">
                      <div className="text-[12px] sm:text-[13px] font-semibold text-blue-600 mb-1.5 sm:mb-2">
                         หลังกิน (กินไป {afterData.eatPercent}%)
                      </div>
                      <div className="flex gap-2.5 sm:gap-3 items-start">
                        <img 
                          src={afterData.image} 
                          alt={`${item.menu} - หลังกิน`}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-[#f2f2f7] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 shrink-0"></div>
                              <span className="text-[12px] sm:text-[13px] text-blue-600 font-medium truncate">{afterData.cal} kcal</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 shrink-0"></div>
                              <span className="text-[12px] sm:text-[13px] text-blue-600 font-medium truncate">{afterData.protein}g โปรตีน</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 shrink-0"></div>
                              <span className="text-[12px] sm:text-[13px] text-blue-600 font-medium truncate">{afterData.carb}g คาร์บ</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 shrink-0"></div>
                              <span className="text-[12px] sm:text-[13px] text-blue-600 font-medium truncate">{afterData.fat}g ไขมัน</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ปุ่มต่างๆ */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* ปุ่มเปรียบเทียบ - แสดงเฉพาะเมื่อยังไม่มีรูปหลังกิน */}
                    {!afterData && (
                      <button
                        onClick={() => handleCompareFood(item)}
                        className="w-full text-[12px] sm:text-[13px] text-blue-500 font-medium hover:text-blue-600 transition-colors text-left"
                      >
                        เปรียบเทียบอาหารหลังกิน
                      </button>
                    )}
                    
                    {/* ปุ่มลบ - แสดงตามเงื่อนไข */}
                    {afterData ? (
                      // มีรูปหลังกิน - แสดง 2 ปุ่ม
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteAfter(afterData.id)}
                          className="flex-1 text-[12px] sm:text-[13px] text-orange-500 font-medium hover:text-orange-600 transition-colors"
                        >
                          ลบรูปหลังกิน
                        </button>
                        <button
                          onClick={() => handleDeleteBoth(item.id, afterData.id)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[13px] text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 active:scale-[0.98] transition-all duration-200"
                        >
                          ลบทั้งหมด
                        </button>
                      </div>
                    ) : (
                      // ไม่มีรูปหลังกิน - แสดงปุ่มลบปกติ
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[12px] sm:text-[13px] text-red-500 font-medium hover:text-red-600 transition-colors text-left"
                      >
                        ลบรายการ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 shadow-sm animate-slideUpCard animate-delay-300">
          <h5 className="text-[14px] sm:text-[15px] font-semibold text-black mb-2.5 sm:mb-3">สรุปรวม</h5>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div className="text-center">
              <div className="text-[16px] sm:text-[18px] font-bold text-green-500">
                {totalCal}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#8e8e93]">แคลอรี่</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] sm:text-[18px] font-bold text-blue-500">
                {totalProtein}g
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#8e8e93]">โปรตีน</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] sm:text-[18px] font-bold text-orange-500">
                {totalCarb}g
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#8e8e93]">คาร์บ</div>
            </div>
            <div className="text-center">
              <div className="text-[16px] sm:text-[18px] font-bold text-red-500">
                {totalFat}g
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#8e8e93]">ไขมัน</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCameraClick={handleOpenCamera} />

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fadeIn" onClick={() => setShowCameraModal(false)}>
          <div className="bg-white rounded-t-[20px] w-full max-w-md pb-safe animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="w-12 h-1 bg-[#e5e5ea] rounded-full mx-auto mb-4"></div>
              <h3 className="text-[20px] font-semibold text-black text-center mb-4">เพิ่มรูปอาหาร</h3>
              
              <div className="space-y-2">
                <button
                  onClick={handleCameraCapture}
                  className="w-full py-4 text-[17px] font-semibold text-black bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ถ่ายรูป
                </button>

                <button
                  onClick={handleGallerySelect}
                  className="w-full py-4 text-[17px] font-semibold text-black bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  เลือกจากแกลเลอรี่
                </button>

                <button
                  onClick={() => setShowCameraModal(false)}
                  className="w-full py-4 text-[17px] font-semibold text-red-500 bg-white rounded-[12px] hover:bg-[#f2f2f7] active:scale-[0.98] transition-all duration-200"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[17px] font-semibold text-black">กำลังวิเคราะห์รูปภาพ...</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {loading && !isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[17px] font-semibold text-black">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      )}

      {/* No Data Modal */}
      {showNoDataModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowNoDataModal(false)}>
          <div className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3">
              <svg className="w-16 h-16 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-[17px] font-semibold text-black text-center">ไม่มีข้อมูล</p>
              <p className="text-[13px] text-[#8e8e93] text-center">ไม่พบรายการอาหารในวันที่เลือก</p>
              <button
                onClick={() => setShowNoDataModal(false)}
                className="w-full mt-2 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Food Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fadeIn" onClick={() => setShowCompareModal(false)}>
          <div className="bg-white rounded-t-[20px] w-full max-w-md pb-safe animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="w-12 h-1 bg-[#e5e5ea] rounded-full mx-auto mb-4"></div>
              <h3 className="text-[20px] font-semibold text-black text-center mb-2">เปรียบเทียบอาหารหลังกิน</h3>
              <p className="text-[13px] text-[#8e8e93] text-center mb-4">
                ถ่ายรูปอาหารที่เหลือในจานเดิม
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={handleCompareCameraCapture}
                  className="w-full py-4 text-[17px] font-semibold text-black bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ถ่ายรูป
                </button>

                <button
                  onClick={handleCompareGallerySelect}
                  className="w-full py-4 text-[17px] font-semibold text-black bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  เลือกจากแกลเลอรี่
                </button>

                <button
                  onClick={() => setShowCompareModal(false)}
                  className="w-full py-4 text-[17px] font-semibold text-red-500 bg-white rounded-[12px] hover:bg-[#f2f2f7] active:scale-[0.98] transition-all duration-200"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparing Modal */}
      {isComparing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[17px] font-semibold text-black">กำลังเปรียบเทียบรูปภาพ...</p>
              <p className="text-[13px] text-[#8e8e93] text-center">กรุณารอสักครู่</p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Percent Modal */}
      {showManualPercentModal && selectedFoodForCompare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={handleCancelManualPercent}>
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[20px] font-semibold text-black text-center mb-2">ปรับเปอร์เซ็นต์ที่กิน</h3>
            <p className="text-[13px] text-[#8e8e93] text-center mb-4">
              AI แนะนำ: {aiSuggestedPercent}%
            </p>
            
            {/* Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[15px] text-black font-semibold">กินไป</span>
                <span className="text-[24px] font-bold text-blue-500">{manualPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={manualPercent}
                onChange={(e) => setManualPercent(Number(e.target.value))}
                className="w-full h-2 bg-[#e5e5ea] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${manualPercent}%, #e5e5ea ${manualPercent}%, #e5e5ea 100%)`
                }}
              />
              <div className="flex justify-between text-[11px] text-[#8e8e93] mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* ข้อมูลอาหารก่อนกิน */}
            <div className="bg-[#f2f2f7] rounded-[12px] p-4 mb-4">
              <div className="text-[13px] font-semibold text-black mb-3">🍽️ {selectedFoodForCompare.menu}</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#8e8e93]">แคลอรี่:</span>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-blue-500">
                      {Math.round(selectedFoodForCompare.cal * manualPercent / 100)}
                    </span>
                    <span className="text-[13px] text-[#8e8e93]"> / {selectedFoodForCompare.cal} kcal</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#8e8e93]">โปรตีน:</span>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-blue-500">
                      {Math.round(selectedFoodForCompare.protein * manualPercent / 100)}
                    </span>
                    <span className="text-[13px] text-[#8e8e93]"> / {selectedFoodForCompare.protein}g</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#8e8e93]">คาร์โบไฮเดรต:</span>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-blue-500">
                      {Math.round(selectedFoodForCompare.carb * manualPercent / 100)}
                    </span>
                    <span className="text-[13px] text-[#8e8e93]"> / {selectedFoodForCompare.carb}g</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#8e8e93]">ไขมัน:</span>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-blue-500">
                      {Math.round(selectedFoodForCompare.fat * manualPercent / 100)}
                    </span>
                    <span className="text-[13px] text-[#8e8e93]"> / {selectedFoodForCompare.fat}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่ม */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelManualPercent}
                className="flex-1 py-3 text-[15px] font-semibold text-[#8e8e93] bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmManualPercent}
                className="flex-1 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-[12px] hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all duration-200"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Food Data Modal */}
      {showConfirmModal && pendingFoodData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4" onClick={handleCancelSave}>
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[20px] font-semibold text-black text-center mb-4">ตรวจสอบข้อมูล</h3>
            
            {/* แสดงรูปภาพ */}
            {pendingImagePreview && (
              <div className="mb-4">
                <img 
                  src={pendingImagePreview} 
                  alt="Food preview" 
                  className="w-full h-48 object-cover rounded-[12px]"
                />
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-[#8e8e93]">เมนู:</span>
                <input
                  type="text"
                  value={pendingFoodData.menu}
                  onChange={(e) => setPendingFoodData({...pendingFoodData, menu: e.target.value})}
                  className="text-[15px] font-semibold text-black text-right bg-[#f2f2f7] px-3 py-1 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none flex-1 ml-2"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-[#8e8e93]">แคลอรี่:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={pendingFoodData.cal}
                    onChange={(e) => setPendingFoodData({...pendingFoodData, cal: Number(e.target.value)})}
                    className="text-[15px] font-semibold text-black text-right bg-[#f2f2f7] px-3 py-1 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none w-24"
                  />
                  <span className="text-[13px] text-[#8e8e93]">kcal</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-[#8e8e93]">โปรตีน:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={pendingFoodData.protein}
                    onChange={(e) => setPendingFoodData({...pendingFoodData, protein: Number(e.target.value)})}
                    className="text-[15px] font-semibold text-black text-right bg-[#f2f2f7] px-3 py-1 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none w-24"
                  />
                  <span className="text-[13px] text-[#8e8e93]">g</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-[#8e8e93]">คาร์บ:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={pendingFoodData.carb}
                    onChange={(e) => setPendingFoodData({...pendingFoodData, carb: Number(e.target.value)})}
                    className="text-[15px] font-semibold text-black text-right bg-[#f2f2f7] px-3 py-1 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none w-24"
                  />
                  <span className="text-[13px] text-[#8e8e93]">g</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[15px] text-[#8e8e93]">ไขมัน:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={pendingFoodData.fat}
                    onChange={(e) => setPendingFoodData({...pendingFoodData, fat: Number(e.target.value)})}
                    className="text-[15px] font-semibold text-black text-right bg-[#f2f2f7] px-3 py-1 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none w-24"
                  />
                  <span className="text-[13px] text-[#8e8e93]">g</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancelSave}
                className="flex-1 py-3 text-[15px] font-semibold text-red-500 bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenu;
