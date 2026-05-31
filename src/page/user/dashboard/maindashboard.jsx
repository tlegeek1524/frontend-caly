import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import OpenAI from "openai";
import BottomNav from "../../../components/BottomNav/BottomNav";

ChartJS.register(ArcElement, Tooltip, Legend);

// Airtable Functions
const fetchUserTDEE = async (lineUid) => {
  const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_TDEE;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_TDEE;
  const tableId = import.meta.env.VITE_AIRTABLE_TABLE_TDEE;

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula=${encodeURIComponent(`line_uid='${lineUid}'`)}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const data = await response.json();
    if (data.records && data.records.length > 0) {
      return data.records[0].fields.Cal || 2000;
    }
    return 2000;
  } catch (error) {
    console.error("Error fetching TDEE:", error);
    return 2000;
  }
};

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
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.records) {
        allRecords = allRecords.concat(data.records);
      }

      offset = data.offset;
    } while (offset);

    if (!allRecords.length) return [];

    const records = allRecords
      .filter((record) => {
        const fields = record.fields;
        if (fields.line_uid !== lineUid) return false;
        const recordDate = fields.date || "2000-01-01T00:00:00.000Z";
        const recordDateTime = new Date(recordDate);
        const recordDateStr = recordDateTime.toISOString().split("T")[0];
        return recordDateStr === selectedDate;
      })
      .map((record) => ({
        id: record.id,
        menu: record.fields.menu || "ไม่ระบุเมนู",
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
    console.error("Error fetching food records:", error);
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
    
    // กรองเฉพาะ line_uid เท่านั้น
    const records = allRecords
      .filter(record => record.fields.line_uid === lineUid)
      .map(record => ({
        id: record.id,
        mash: record.fields.mash || null,
        cal: record.fields.cal || 0,
        protein: record.fields.protine || 0,
        carb: record.fields.carb || 0,
        fat: record.fields.fat || 0
      }));
    
    return records;
  } catch (error) {
    console.error('❌ Error fetching food after records:', error);
    return [];
  }
};

// ฟังก์ชันอัพโหลดรูปไป ImgBB
const uploadImageToImgBB = async (imageFile) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (data.success) {
      return data.data.url; // URL ของรูปที่อัพโหลด
    } else {
      throw new Error("Failed to upload image");
    }
  } catch (error) {
    console.error("ImgBB upload error:", error);
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
        const canvas = document.createElement("canvas");
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

        const ctx = canvas.getContext("2d");
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
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            quality,
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
      console.log(
        "ขนาดรูปต้นฉบับ:",
        (imageFile.size / 1024 / 1024).toFixed(2),
        "MB",
      );

      const compressedFile = await compressImage(imageFile, 1, 1920);
      console.log(
        "ขนาดรูปหลัง compress:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB",
      );

      // อัพโหลดไป ImgBB
      const imageUrl = await uploadImageToImgBB(compressedFile);
      console.log("Image URL:", imageUrl);

      // Airtable รับ attachment ในรูปแบบ URL
      imageAttachment = [
        {
          url: imageUrl,
        },
      ];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
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
          ...(imageAttachment && { image: imageAttachment }),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Airtable Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to save record");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding food record:", error);
    return null;
  }
};

// OpenAI GPT Function
const analyzeFoodImage = async (imageFile) => {
  try {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true, // สำหรับใช้ใน browser
    });

    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
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
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("ไม่สามารถแปลง response เป็น JSON ได้");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const MainDashboard = () => {
  const navigate = useNavigate();

  // ดึงข้อมูล user จาก localStorage (จาก LINE Login)
  const user = React.useMemo(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }, []);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [displayDate, setDisplayDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedCal, setAnimatedCal] = useState(0);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userTDEE, setUserTDEE] = useState(null);
  const [foodRecords, setFoodRecords] = useState([]);
  const [foodAfterRecords, setFoodAfterRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showNoDataModal, setShowNoDataModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFoodData, setPendingFoodData] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState(null);
  const [showPDPA, setShowPDPA] = useState(false);

  // เช็คความยินยอม PDPA จาก API
  useEffect(() => {
    const checkPDPA = async () => {
      if (!user || !user.id) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";
        const response = await fetch(
          `${apiUrl.replace(/\/$/, "")}/api/pdpa-consent/check?user_id=${user.id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // เช็คฟิลด์ความยินยอม
          if (data.consented || data.status === true || data.status === "approved" || data.exists || data.hasConsented || data.approved) {
            setShowPDPA(false);
            localStorage.setItem("gps_consent", "true");
          } else {
            setShowPDPA(true);
          }
        } else {
          // ถ้า 404 หรือ response ไม่ ok แสดงว่ายังไม่เคยยินยอม
          setShowPDPA(true);
        }
      } catch (error) {
        console.error("Error checking PDPA consent:", error);
        // Fallback: แสดงโมเดลเพื่อความปลอดภัยในการคุ้มครองข้อมูล
        setShowPDPA(true);
      }
    };

    checkPDPA();
  }, [user?.id]);

  // ล็อคการเลื่อนหน้าเมื่อ PDPA popup เปิด
  useEffect(() => {
    if (showPDPA) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPDPA]);

  const handleAcceptPDPA = async () => {
    if (!user?.id) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3333";
      await fetch(`${apiUrl.replace(/\/$/, "")}/api/pdpa-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id.toString() }),
      }).catch((e) => console.error("PDPA consent upload failed", e));
    } catch (e) {
      console.error(e);
    }

    localStorage.setItem("gps_consent", "true");
    setShowPDPA(false);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => console.log("GPS initialized successfully"),
        (err) => console.warn("GPS initialization rejected/failed", err),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  };

  // ถ้าไม่มี user ให้กลับไปหน้า login
  useEffect(() => {
    if (!user) {
      navigate("/linelogin");
    }
  }, [user, navigate]);

  // ดึงข้อมูล TDEE และรายการอาหารครั้งแรก
  useEffect(() => {
    if (!user || !user.id) return;

    const loadData = async () => {
      setInitialLoading(true);
      try {
        // ดึง TDEE
        const tdee = await fetchUserTDEE(user.id);
        setUserTDEE(tdee);

        // ดึงรายการอาหาร
        const [records, afterRecords] = await Promise.all([
          fetchFoodRecords(user.id, displayDate),
          fetchFoodAfterRecords(user.id)
        ]);
        setFoodRecords(records);
        setFoodAfterRecords(afterRecords);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user?.id, displayDate]);

  // ฟังก์ชันสำหรับกดปุ่ม "ดู"
  const handleViewDate = async () => {
    if (!user || !user.id) return;

    setLoading(true);
    try {
      const records = await fetchFoodRecords(user.id, selectedDate);
      setFoodRecords(records);
      setDisplayDate(selectedDate);

      // ถ้าไม่มีข้อมูล แสดง popup
      if (records.length === 0) {
        setShowNoDataModal(true);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const mockUser = {
    name: user?.name || "ผู้ใช้งาน",
    profilePic: user?.picture || "https://via.placeholder.com/60",
    tdee: userTDEE || 0,
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

  // คำนวณแคลอรี่จากโภชนาการ (สำหรับแสดงในกราฟ)
  const proteinCal = totalProtein * 4;
  const carbCal = totalCarb * 4;
  const fatCal = totalFat * 9;
  const totalNutritionCal = proteinCal + carbCal + fatCal;

  // แคลอรี่ที่เหลือจาก TDEE
  const remainingTDEE = Math.max(0, mockUser.tdee - totalNutritionCal);

  // Chart.js data
  const chartData = {
    labels: ["โปรตีน", "คาร์บ", "ไขมัน", "เหลือ"],
    datasets: [
      {
        data: [proteinCal, carbCal, fatCal, remainingTDEE],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // blue - โปรตีน
          "rgba(249, 115, 22, 0.8)", // orange - คาร์บ
          "rgba(239, 68, 68, 0.8)", // red - ไขมัน
          "rgba(229, 229, 234, 0.5)", // gray - เหลือ
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(249, 115, 22)",
          "rgb(239, 68, 68)",
          "rgb(229, 229, 234)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
          family:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        bodyFont: {
          size: 13,
          family:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${Math.round(value)} kcal`;
          },
        },
      },
    },
    cutout: "70%",
  };

  // คำนวณเปอร์เซ็นต์
  const caloriePercentage = (totalCal / mockUser.tdee) * 100;
  const remainingCalories = mockUser.tdee - totalCal;

  // Animation effect
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedPercentage(caloriePercentage * easeOut);
      setAnimatedCal(Math.round(totalCal * easeOut));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedPercentage(caloriePercentage);
        setAnimatedCal(totalCal);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [totalCal, caloriePercentage]);

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบรายการนี้หรือไม่?")) {
      console.log("Delete item:", id);
    }
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleCameraCapture = async () => {
    // ขออนุญาตใช้กล้องก่อน
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      // ปิด stream ทันทีหลังได้รับอนุญาต
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.warn("ไม่สามารถเข้าถึงกล้องได้:", error);
      alert("กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าเบราว์เซอร์");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // ใช้กล้องหลัง
    
    // เพิ่ม attributes เพื่อบังคับให้ใช้กล้อง
    input.setAttribute("capture", "environment");

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setShowCameraModal(false);
        setIsAnalyzing(true);

        try {
          const previewUrl = URL.createObjectURL(file);

          console.log("กำลังวิเคราะห์รูปภาพ...");
          const foodData = await analyzeFoodImage(file);
          console.log("✅ ผลการวิเคราะห์:", foodData);

          setPendingFoodData(foodData);
          setPendingImageFile(file);
          setPendingImagePreview(previewUrl);
          setShowConfirmModal(true);
        } catch (error) {
          console.error("❌ เกิดข้อผิดพลาด:", error);
          alert("ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่");
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    input.click();
  };

  const handleGallerySelect = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    // ไม่ใส่ capture attribute เพื่อให้เลือกจากไฟล์ได้
    input.multiple = false;

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setShowCameraModal(false);
        setIsAnalyzing(true);

        try {
          const previewUrl = URL.createObjectURL(file);

          console.log("กำลังวิเคราะห์รูปภาพ...");
          const foodData = await analyzeFoodImage(file);
          console.log("✅ ผลการวิเคราะห์:", foodData);

          setPendingFoodData(foodData);
          setPendingImageFile(file);
          setPendingImagePreview(previewUrl);
          setShowConfirmModal(true);
        } catch (error) {
          console.error("❌ เกิดข้อผิดพลาด:", error);
          alert("ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่");
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
              maximumAge: 0,
            });
          });

          const payload = {
            user_id: user.id.toString(),
            source_type: "web",
            latitude: parseFloat(position.coords.latitude),
            longitude: parseFloat(position.coords.longitude),
          };

          const apiUrl =
            import.meta.env.VITE_API_URL || "http://localhost:3333";
          fetch(`${apiUrl.replace(/\/$/, "")}/api/upload-location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).catch((e) => console.error("Location upload failed", e));
        } catch (gpsError) {
          console.warn("ไม่สามารถดึงพิกัด GPS ได้:", gpsError);
        }
      }

      // บันทึกข้อมูลพร้อมรูปภาพลง Airtable
      const result = await addFoodRecord(
        user.id,
        pendingFoodData,
        pendingImageFile,
      );

      if (result) {
        // แสดง URL ของรูปที่อัพโหลด
        const uploadedImageUrl = result.fields?.image?.[0]?.url;
        if (uploadedImageUrl) {
          alert(`บันทึกข้อมูลสำเร็จ!\n\nURL รูปภาพ:\n${uploadedImageUrl}`);
        } else {
          alert("บันทึกข้อมูลสำเร็จ!");
        }

        // รีโหลดข้อมูล
        const records = await fetchFoodRecords(user.id, displayDate);
        setFoodRecords(records);
      } else {
        alert("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
      setPendingFoodData(null);
      setPendingImageFile(null);
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
    document.body.style.overflow = 'unset';
  };

  // ล็อคการเลื่อนหน้าเมื่อ popup เปิด
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showConfirmModal]);

  const getProgressColor = () => {
    if (caloriePercentage < 70) return "from-green-400 to-green-500";
    if (caloriePercentage < 100) return "from-blue-400 to-blue-500";
    if (caloriePercentage < 120) return "from-orange-400 to-orange-500";
    return "from-red-400 to-red-500";
  };

  const getProgressBadgeColor = () => {
    if (caloriePercentage < 70) return "bg-green-500";
    if (caloriePercentage < 100) return "bg-blue-500";
    if (caloriePercentage < 120) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      className="min-h-screen bg-[#f2f2f7] pb-20"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Navbar */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-6 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-[28px] font-bold text-white tracking-tight">
            Calories Daily
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard">
          <div className="flex items-center gap-3">
            <img
              src={mockUser.profilePic}
              alt="profile"
              className="w-14 h-14 rounded-full border-2 border-green-400"
            />
            <div>
              <h3 className="text-[17px] font-semibold text-black">
                {mockUser.name}
              </h3>
              <p className="text-[13px] text-[#8e8e93]">
                เป้าหมาย: {userTDEE ? userTDEE.toLocaleString() : "-"} kcal/วัน
              </p>
            </div>
          </div>
        </div>

        {/* Calorie Progress */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-100">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-[17px] font-semibold text-black">
              พลังงานวันนี้
            </h5>
            <span
              className={`${getProgressBadgeColor()} text-white text-[13px] font-semibold px-3 py-1 rounded-full transition-all duration-300`}
            >
              {Math.round(animatedPercentage)}%
            </span>
          </div>

          <div className="relative h-8 bg-[#e5e5ea] rounded-full overflow-hidden mb-3">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${getProgressColor()} transition-all duration-300 ease-out`}
              style={{ width: `${Math.min(animatedPercentage, 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[#8e8e93] text-[13px] font-semibold opacity-50">
              {animatedCal} / {userTDEE || "-"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[20px] font-bold text-red-500 transition-all duration-300">
                {animatedCal.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#8e8e93]">บริโภคแล้ว</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-black">
                {userTDEE ? userTDEE.toLocaleString() : "-"}
              </div>
              <div className="text-[11px] text-[#8e8e93]">เป้าหมาย</div>
            </div>
            <div>
              <div
                className={`text-[20px] font-bold transition-all duration-300 ${remainingCalories >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {userTDEE
                  ? remainingCalories >= 0
                    ? (mockUser.tdee - animatedCal).toLocaleString()
                    : `+${Math.abs(mockUser.tdee - animatedCal).toLocaleString()}`
                  : "-"}
              </div>
              <div className="text-[11px] text-[#8e8e93]">
                {remainingCalories >= 0 ? "เหลือ" : "เกิน"}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Summary with Chart */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-200">
          <div className="text-center mb-4">
            <p className="text-[13px] text-[#8e8e93]">สรุปโภชนาการวันนี้</p>
          </div>

          <div className="flex items-center justify-center mb-4 relative">
            <div className="w-48 h-48">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[24px] font-bold text-black">{Math.round(totalCal)}</div>
              <div className="text-[11px] text-[#8e8e93]">/ {userTDEE || '-'} kcal</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">
                  {totalProtein}g
                </div>
                <div className="text-[11px] text-[#8e8e93]">
                  โปรตีน ({proteinCal} kcal)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">
                  {totalCarb}g
                </div>
                <div className="text-[11px] text-[#8e8e93]">
                  คาร์บ ({carbCal} kcal)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">
                  {totalFat}g
                </div>
                <div className="text-[11px] text-[#8e8e93]">
                  ไขมัน ({fatCal} kcal)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e5e5ea]"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">
                  {Math.round(remainingTDEE)}
                </div>
                <div className="text-[11px] text-[#8e8e93]">เหลือ (kcal)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-300">
          <label className="block text-[13px] text-black mb-2">
            เลือกวันที่
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 text-[15px] bg-[#f2f2f7] rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none transition-all duration-200"
            />
            <button
              onClick={handleViewDate}
              disabled={loading}
              className="px-4 py-2 text-[15px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังโหลด..." : "ดู"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCameraClick={handleOpenCamera} />

      {/* Camera Modal */}
      {showCameraModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fadeIn"
          onClick={() => setShowCameraModal(false)}
        >
          <div
            className="bg-white rounded-t-[20px] w-full max-w-md pb-safe animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="w-12 h-1 bg-[#e5e5ea] rounded-full mx-auto mb-4"></div>
              <h3 className="text-[20px] font-semibold text-black text-center mb-2">
                เพิ่มรูปอาหาร
              </h3>
              <p className="text-[13px] text-[#8e8e93] text-center mb-4">
                เลือกวิธีการเพิ่มรูปภาพอาหาร
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleCameraCapture}
                  className="w-full py-4 text-[17px] font-semibold text-black bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  ถ่ายรูป
                </button>

                <button
                  onClick={handleGallerySelect}
                  className="w-full py-4 text-[17px] font-semibold text-black bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
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

              {/* คำแนะนำ */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-[12px]">
                <p className="text-[12px] text-blue-800 leading-relaxed">
                  <span className="font-bold">💡 หมายเหตุ:</span> หากปุ่ม "เลือกจากแกลเลอรี่" เปิด Google Photos 
                  กรุณาเลือก "Files" หรือ "เครื่องของฉัน" จากเมนูด้านบน 
                  หรือตั้งค่าแอปเปิดไฟล์เริ่มต้นในการตั้งค่ามือถือของคุณ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal - แสดงเฉพาะตอนกดปุ่ม "ดู" */}
      {loading && !isAnalyzing && !initialLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[17px] font-semibold text-black">
                กำลังโหลดข้อมูล...
              </p>
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
              <p className="text-[17px] font-semibold text-black">
                กำลังวิเคราะห์รูปภาพ...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Data Modal */}
      {showNoDataModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowNoDataModal(false)}
        >
          <div
            className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3">
              <svg
                className="w-16 h-16 text-[#8e8e93]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-[17px] font-semibold text-black text-center">
                ไม่มีข้อมูล
              </p>
              <p className="text-[13px] text-[#8e8e93] text-center">
                ไม่พบรายการอาหารในวันที่เลือก
              </p>
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

      {/* Confirm Food Data Modal */}
      {showConfirmModal && pendingFoodData && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4 overflow-y-auto"
          onClick={handleCancelSave}
        >
          <div
            className="bg-white rounded-[20px] max-w-sm w-full shadow-2xl animate-slideUp my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="px-6 pt-6 pb-4 flex-shrink-0">
              <h3 className="text-[20px] font-semibold text-black text-center">
                ตรวจสอบข้อมูล
              </h3>
            </div>

            {/* Content - Scrollable */}
            <div className="px-6 overflow-y-auto flex-1">
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
                <div className="flex flex-col gap-2">
                  <span className="text-[15px] text-[#8e8e93]">เมนู:</span>
                  <textarea
                    value={pendingFoodData.menu}
                    onChange={(e) =>
                      setPendingFoodData({
                        ...pendingFoodData,
                        menu: e.target.value,
                      })
                    }
                    className="text-[15px] font-semibold text-black bg-[#f2f2f7] px-3 py-2 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none w-full resize-none"
                    rows="2"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[15px] text-[#8e8e93]">แคลอรี่:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={pendingFoodData.cal}
                      onChange={(e) =>
                        setPendingFoodData({
                          ...pendingFoodData,
                          cal: Number(e.target.value),
                        })
                      }
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
                      onChange={(e) =>
                        setPendingFoodData({
                          ...pendingFoodData,
                          protein: Number(e.target.value),
                        })
                      }
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
                      onChange={(e) =>
                        setPendingFoodData({
                          ...pendingFoodData,
                          carb: Number(e.target.value),
                        })
                      }
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
                      onChange={(e) =>
                        setPendingFoodData({
                          ...pendingFoodData,
                          fat: Number(e.target.value),
                        })
                      }
                      className="text-[15px] font-semibold text-black text-right bg-[#f2f2f7] px-3 py-1 rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none w-24"
                    />
                    <span className="text-[13px] text-[#8e8e93]">g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Fixed */}
            <div className="px-6 pb-6 flex gap-2 flex-shrink-0 border-t border-[#e5e5ea] pt-4">
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

      {/* PDPA Consent Modal for GPS */}
      {showPDPA && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[999] animate-fadeIn p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-sm w-full shadow-2xl border border-slate-100/50 my-auto max-h-[90vh] flex flex-col">
            {/* Content - Scrollable */}
            <div className="p-6 flex flex-col gap-5 text-center overflow-y-auto">
              {/* Pulsing GPS Premium Icon Container */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-400 to-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/20 relative animate-pulse flex-shrink-0">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-bold text-slate-800 tracking-tight">
                  นโยบายความเป็นส่วนตัว (PDPA)
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  ระบบแอปพลิเคชัน Calories Daily
                  มีความจำเป็นต้องเข้าถึงข้อมูลพิกัดตำแหน่งที่ตั้ง (GPS) ของท่าน
                  เพื่อความแม่นยำในการให้บริการและวิเคราะห์ข้อมูลสถานที่สำหรับการใช้งานฟีเจอร์รายงานตัว
                </p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-500/10 rounded-xl p-3.5 flex gap-2.5 text-left">
                <svg
                  className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div className="flex flex-col gap-0.5 text-xs text-emerald-800 leading-relaxed font-semibold">
                  <span>การคุ้มครองข้อมูลส่วนบุคคล:</span>
                  <p className="font-normal text-emerald-700">
                    พิกัด GPS
                    ของท่านจะถูกนำไปใช้ในเซิร์ฟเวอร์ระบบรายงานตัวเท่านั้น
                    และจะไม่มีการนำไปเผยแพร่หรือใช้งานในวัตถุประสงค์อื่นนอกเหนือจากที่กำหนด
                  </p>
                </div>
              </div>
            </div>

            {/* Actions - Fixed */}
            <div className="flex flex-col gap-2.5 p-6 pt-0 flex-shrink-0 border-t border-slate-100">
              <button
                onClick={handleAcceptPDPA}
                className="w-full py-3.5 text-[15px] font-bold text-white bg-gradient-to-r from-emerald-400 to-green-500 rounded-[14px] hover:brightness-105 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-500/15"
              >
                ยอมรับ และเปิดสิทธิ์พิกัด (GPS)
              </button>
              <button
                onClick={() => setShowPDPA(false)}
                className="w-full py-3 text-[14px] font-semibold text-slate-400 hover:text-slate-600 bg-transparent rounded-[12px] transition-colors"
              >
                ปฏิเสธ (ปิดหน้าต่างนี้)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
