import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  UploadCloud, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ChevronLeft, 
  RefreshCw, 
  Settings, 
  Image as ImageIcon, 
  Send, 
  Smartphone, 
  Info,
  Clock,
  Compass
} from 'lucide-react';

const CheckInPage = () => {
  const navigate = useNavigate();
  
  // State for image handling
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  
  // State for background process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0); 
  // Steps: 
  // 0: Preparing & Compressing Image
  // 1: Fetching HTML5 Geolocation (GPS)
  // 2: Constructing FormData & POST Request
  
  // GPS & Location Coordinates
  const [coords, setCoords] = useState(null);
  
  // Configuration
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3333');
  const [apiEndpoint, setApiEndpoint] = useState('/api/upload-location');
  const [showConfig, setShowConfig] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true); // Default to true for smooth mock GPS fallbacks in local testing
  const [compressOption, setCompressOption] = useState(false); // Default to false to preserve photo EXIF GPS metadata!
  
  // Error handling states
  const [gpsError, setGpsError] = useState(null); // { code, message, title, instruction }
  const [submitError, setSubmitError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  
  const fileInputRef = useRef(null);

  // Clean up object URLs to prevent memory leak
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Image compress logic (HTML5 Canvas approach)
  const compressImage = (file, maxSizeMB = 1, maxWidthOrHeight = 1600) => {
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

          // Aspect ratio scaling
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

          let quality = 0.85;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Image compression failed"));
                  return;
                }
                if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
                  quality -= 0.05;
                  tryCompress();
                } else {
                  const compressed = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressed);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Image Selection Handler
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setSubmitError(null);
    setSuccessData(null);
    setGpsError(null);
    
    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    setCompressedFile(null); // Will compress during background process
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setCompressedFile(null);
    setSuccessData(null);
    setSubmitError(null);
  };

  // HTML5 Geolocation Core with Config (enableHighAccuracy: true, timeout: 10000)
  const getHTML5Location = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          title: "เบราว์เซอร์ไม่รองรับ",
          message: "อุปกรณ์หรือแอปเบราว์เซอร์นี้ไม่รองรับ HTML5 Geolocation API",
          instruction: "กรุณาเปิดลิงก์นี้บนเว็บเบราว์เซอร์หลักของระบบ เช่น Safari (iOS) หรือ Chrome (Android)"
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          // Map browser geolocation errors to tailored LINE/OS instructions
          let errorTitle = "เกิดข้อผิดพลาดในการดึงตำแหน่ง";
          let errorMsg = "ไม่สามารถระบุตำแหน่งพิกัดของคุณได้";
          let instructionText = "กรุณาตรวจสอบว่าคุณได้อนุญาตสิทธิ์เข้าถึงพิกัดสำหรับ LINE หรือเบราว์เซอร์ของคุณแล้ว";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorTitle = "สิทธิ์การเข้าถึงพิกัดถูกปฏิเสธ (GPS OFF)";
              errorMsg = "ผู้ใช้งานหรือระบบเบราว์เซอร์ปฏิเสธการเข้าถึงพิกัด GPS";
              instructionText = "กรุณาตั้งค่าเพื่อเปิดสิทธิ์การเข้าถึงพิกัดสำหรับแอป LINE หรือเบราว์เซอร์ของคุณ:\n\n" +
                "📱 สำหรับ iOS (iPhone/iPad):\n" +
                "1. ไปที่การตั้งค่าระบบ (Settings) > ความเป็นส่วนตัวและความปลอดภัย (Privacy & Security)\n" +
                "2. เลือก บริการหาตำแหน่งที่ตั้ง (Location Services) > เปิดสวิตช์ใช้งาน\n" +
                "3. เลื่อนลงมาที่แอป 'LINE' > เลือก 'ระหว่างใช้แอป' (While Using the App) และเปิดสวิตช์ 'ตำแหน่งที่ตั้งที่แน่นอน' (Precise Location)\n\n" +
                "🤖 สำหรับ Android:\n" +
                "1. กดค้างที่ไอคอนแอป LINE > เลือก ข้อมูลแอป (App Info)\n" +
                "2. ไปที่ สิทธิ์การเข้าถึง (Permissions) > ตำแหน่งที่ตั้ง (Location)\n" +
                "3. เลือก อนุญาตเฉพาะขณะใช้แอปเท่านั้น (Allow only while using the app)";
              break;
            case error.POSITION_UNAVAILABLE:
              errorTitle = "พิกัดไม่พร้อมใช้งาน";
              errorMsg = "สัญญาณ GPS จากอุปกรณ์ของคุณไม่ชัดเจนหรือไม่สามารถรับข้อมูลตำแหน่งได้";
              instructionText = "กรุณาตรวจสอบว่าคุณเปิดใช้งานระบบหาตำแหน่ง (GPS) บนอุปกรณ์แล้ว หรือลองย้ายไปอยู่ในที่โล่งแจ้ง ใกล้หน้าต่าง และตรวจสอบความเสถียรของสัญญาณอินเทอร์เน็ต";
              break;
            case error.TIMEOUT:
              errorTitle = "หมดเวลาการค้นหาพิกัด (Timeout)";
              errorMsg = "ระบบใช้เวลาดึงข้อมูล GPS นานเกินกว่ากำหนด (10 วินาที)";
              instructionText = "เกิดจากการค้นหาสัญญาณดาวเทียม GPS ล่าช้าบน LINE Browser กรุณากดลองใหม่อีกครั้ง หรือขยับออกจากอาคาร หรือจุดอับสัญญาณเพื่อให้ดึงพิกัดได้ง่ายขึ้น";
              break;
            default:
              break;
          }

          reject({
            code: error.code,
            title: errorTitle,
            message: errorMsg,
            instruction: instructionText
          });
        },
        {
          enableHighAccuracy: true, // Request GPS for premium precision
          timeout: 10000,           // 10 seconds limit as requested for stability
          maximumAge: 0             // Bypass cache to get fresh real-time coordinates
        }
      );
    });
  };

  // Main Background Submit Process
  const handleFormSubmit = async () => {

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessData(null);
    setGpsError(null);

    let activeImage = imageFile;

    try {
      // STEP 1: Process and Compress Image (optional)
      setActiveStep(0);
      
      if (compressOption && imageFile.size > 0.8 * 1024 * 1024) {
        console.log("Starting client-side image compression...");
        await new Promise(resolve => setTimeout(resolve, 800));
        try {
          const compressed = await compressImage(imageFile, 1, 1600);
          activeImage = compressed;
          setCompressedFile(compressed);
          console.log(`Image compressed successfully: ${(imageFile.size/1024/1024).toFixed(2)}MB -> ${(compressed.size/1024/1024).toFixed(2)}MB`);
        } catch (compressErr) {
          console.warn("Compression failed, using original file instead:", compressErr);
        }
      } else {
        console.log("Skipping image compression to preserve EXIF GPS metadata.");
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // STEP 2: HTML5 Geolocation background fetch
      setActiveStep(1);
      console.log("Retrieving Geolocation position...");
      await new Promise(resolve => setTimeout(resolve, 800)); // Visual spacing
      
      const locationData = await getHTML5Location();
      setCoords(locationData);
      console.log("Location obtained:", locationData);

      // STEP 3: Construct FormData & POST Request
      setActiveStep(2);
      console.log("Constructing FormData and dispatching POST request...");
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get user from localStorage (consistent with user session context)
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || user?.line_uid || 'usr_line_caly';

      const payload = {
        user_id: userId.toString(),
        source_type: 'web',
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude)
      };

      // Read auth token from localStorage if available
      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Execute POST request to Backend API (with optional sandbox parameter)
      const requestUrl = `${apiUrl.replace(/\/$/, '')}${apiEndpoint.startsWith('/') ? '' : '/'}${apiEndpoint}${sandboxMode ? '?sandbox=true' : ''}`;
      console.log(`Submitting to: ${requestUrl}`);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้";
        try {
          const jsonErr = JSON.parse(errorText);
          parsedError = jsonErr.message || jsonErr.error || parsedError;
        } catch {
          if (errorText) parsedError = errorText.substring(0, 100);
        }
        throw new Error(`เซิร์ฟเวอร์ตอบกลับรหัส ${response.status}: ${parsedError}`);
      }

      const resData = await response.json();
      console.log("Post response success:", resData);
      setSuccessData(resData);
      
    } catch (err) {
      console.error("Submission failed at step:", activeStep, err);
      // Differentiate GPS errors from API errors
      if (err.instruction) {
        setGpsError(err);
      } else {
        setSubmitError(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง API หลังบ้าน");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col font-['Sarabun'] antialiased">
      
      {/* Immersive Gradient Glow Background (Premium Aesthetics) */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-[#10b981]/20 via-[#059669]/5 to-transparent pointer-events-none" />

      {/* Top Header Panel */}
      <header className="relative z-10 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-4 sticky top-0 flex items-center justify-between shadow-sm">
        <button 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-[#059669] transition-all bg-transparent hover:bg-slate-100/80 px-2.5 py-1.5 rounded-lg border-0"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">หน้าแรก</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
            GEO REPORT SYSTEM
          </span>
        </div>

        <button 
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center justify-center p-2 rounded-lg transition-all border-0 bg-transparent text-slate-400 hover:text-slate-700 ${showConfig ? 'text-[#059669] bg-emerald-50' : 'hover:bg-slate-100'}`}
          title="ตั้งค่า API"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow w-full max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* Dynamic API Config Accordion */}
        {showConfig && (
          <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-4 shadow-md animate-fadeIn flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              กำหนดเป้าหมาย API (สำหรับนักพัฒนา)
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">BASE API URL</label>
                <input 
                  type="text" 
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="เช่น http://localhost:3333"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#059669] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">ENDPOINT PATH</label>
                <input 
                  type="text" 
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="เช่น /api/upload-location"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#059669] outline-none transition-all"
                />
              </div>

              {/* Advanced Dev Toggles */}
              <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={sandboxMode}
                    onChange={(e) => setSandboxMode(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 animate-none"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">เปิดโหมดทดสอบ (Sandbox Mode)</span>
                    <span className="text-[10px] text-slate-400">สุ่มพิกัดจำลองในไทยแทนหากรูปภาพไม่มีพิกัด EXIF GPS ในตัว</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={compressOption}
                    onChange={(e) => setCompressOption(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 animate-none"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">บีบอัดรูปภาพก่อนนำส่ง (Compress Image)</span>
                    <span className="text-[10px] text-slate-400">ลดพิกเซล/บีบอัดภาพเพื่อประหยัดเน็ต (*หมายเหตุ: EXIF GPS จะหายไป)</span>
                  </div>
                </label>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-50 pt-2">
              * ข้อมูลภาพและพิกัด GPS จะถูกบรรจุลงใน <code>FormData</code> ส่งด้วยวิธี <code>POST</code> ไปที่ URL ด้านบนนี้
            </p>
          </div>
        )}

        {/* Intro Info Card for LINE Browser Users */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 rounded-2xl p-5 shadow-lg shadow-emerald-900/10 text-white relative overflow-hidden animate-slideUp">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
            <Compass className="w-40 h-40" />
          </div>
          
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded-full w-max">
              LINE IN-APP BROWSER READY
            </span>
            <h2 className="text-xl font-bold tracking-tight">รายงานตัวพร้อมพิกัดถ่ายภาพ</h2>
            <p className="text-slate-200 text-xs leading-relaxed font-light mt-1">
              เพิ่มความแม่นยำและความถูกต้องของข้อมูล ระบบจะขอพิกัดละติจูด/ลองจิจูดแบบดาวเทียมเบื้องหลังโดยอัตโนมัติเมื่อกดบันทึกรายงาน
            </p>
            
            <div className="flex gap-4 mt-3 pt-3 border-t border-emerald-700/50">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Clock className="w-3.5 h-3.5" />
                <span>ใช้เวลาดึงพิกัด &lt; 10 วิ</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                <Info className="w-3.5 h-3.5" />
                <span>รองรับ iOS & Android</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Container Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col gap-4 animate-slideUp animate-delay-100">
          
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              อัปโหลดหรือถ่ายรูปภาพ
            </h3>
            {imageFile && (
              <span className="text-xs text-slate-400 font-semibold">
                ขนาดไฟล์: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>

          {/* Input Element (hidden) */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            capture="environment" // Auto opens back camera on mobile devices!
            className="hidden"
          />

          {/* Interactive Dashed Dropzone */}
          {!imagePreview ? (
            <div 
              onClick={triggerFileInput}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl py-12 px-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-emerald-50/20 group active:scale-[0.99]"
            >
              <div className="w-14 h-14 bg-emerald-50 text-[#059669] flex items-center justify-center rounded-full border border-emerald-100 group-hover:scale-110 transition-transform shadow-inner">
                <Camera className="w-6 h-6" />
              </div>
              
              <div className="text-center flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-700">กดเพื่อถ่ายรูป หรือ เลือกรูปภาพ</p>
                <p className="text-xs text-slate-400">รองรับไฟล์ JPG, PNG, HEIC (บีบอัดให้อัตโนมัติ)</p>
              </div>

              <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#059669] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>แตะหน้าจอตรงนี้</span>
              </div>
            </div>
          ) : (
            /* Selected Image Showcase Container */
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
              <img 
                src={imagePreview} 
                alt="Selected preview" 
                className="w-full h-72 object-cover transition-transform group-hover:scale-[1.02] duration-300"
              />
              
              {/* Glassmorphic overlay controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="text-white text-xs font-semibold truncate max-w-[200px]" title={imageFile.name}>
                    {imageFile.name}
                  </p>
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold mt-0.5">
                    รูปภาพได้รับการเตรียมพร้อมแล้ว
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={triggerFileInput}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border-0 transition-all flex items-center gap-1 text-xs font-bold backdrop-blur-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>เปลี่ยนรูป</span>
                  </button>
                  <button
                    onClick={removeImage}
                    className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg border-0 transition-all text-xs font-bold backdrop-blur-md"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines Details */}
          <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">คู่มือแนะนำความถูกต้องของพิกัด:</span>
              <p>ระบบจะขออนุญาตระบุตำแหน่งดาวเทียม เมื่อท่านกดปุ่มยื่นรายงานด้านล่าง กรุณาตรวจสอบให้แน่ใจว่าอุปกรณ์ของท่านไม่ได้ปิดระบบระบุตำแหน่ง GPS เผื่อความถูกต้องในการตรวจสอบ</p>
            </div>
          </div>
        </div>

        {/* API Error Box */}
        {submitError && (
          <div className="bg-red-50 border-2 border-red-500/10 rounded-2xl p-4 flex gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-red-900">เกิดข้อผิดพลาดในการส่งข้อมูล</span>
              <p className="text-xs text-red-800 leading-relaxed font-semibold">{submitError}</p>
              <button 
                onClick={handleFormSubmit}
                className="mt-2 w-max px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg border-0 transition-all"
              >
                ลองส่งใหม่อีกครั้ง
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirm Trigger Button */}
        <button
          onClick={handleFormSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 text-base font-bold text-white rounded-xl shadow-lg border-0 transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 group active:scale-[0.98] bg-gradient-to-r from-emerald-500 via-[#059669] to-emerald-600 shadow-emerald-500/20 hover:brightness-105 cursor-pointer ${
            isSubmitting ? 'opacity-70 pointer-events-none' : ''
          }`}
        >
          {/* Subtle button glare reflection effect */}
          {!isSubmitting && (
            <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" style={{
              backgroundImage: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15) 50%, transparent)',
            }} />
          )}
          <Send className="w-4 h-4" />
          <span>ยืนยันพิกัดและส่งข้อมูล</span>
        </button>

        {/* Success Modal / Display Card */}
        {successData && (
          <div className="bg-emerald-50 border-2 border-emerald-500/20 rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-fadeIn">
            
            <div className="flex items-center gap-3 border-b border-emerald-500/10 pb-3">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md animate-none">
                <CheckCircle2 className="w-6 h-6 animate-none" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-emerald-950">บันทึกตำแหน่งเรียบร้อย!</h4>
                <p className="text-xs text-emerald-800">แกะพิกัดภาพถ่ายและส่งเข้าฐานข้อมูลสำเร็จ</p>
              </div>
            </div>

            {/* Backend reverse-geocoded address display (Highly Interactive) */}
            <div className="bg-white border border-emerald-500/15 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden shadow-sm">
              <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
                <MapPin className="w-4 h-4 animate-bounce" />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ตำแหน่งที่ตั้งที่ระบุได้:</span>
                <h5 className="text-sm font-bold text-slate-850 flex items-center gap-1 mt-0.5">
                  📍 {successData.data?.province || 'ไม่ทราบจังหวัด'}
                </h5>
                {successData.data?.full_address && (
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {successData.data.full_address}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">รายละเอียดพิกัดภาพถ่าย (EXIF GPS):</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium block">Latitude:</span>
                    <span className="font-mono font-bold text-slate-850">{successData.data?.coordinates?.latitude || coords?.latitude?.toFixed(7)}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-medium block">Longitude:</span>
                    <span className="font-mono font-bold text-slate-850">{successData.data?.coordinates?.longitude || coords?.longitude?.toFixed(7)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-2.5">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  แหล่งที่มา: {successData.data?.coordinates?.is_mock_fallback ? 'จำลองพิกัด (Sandbox)' : 'แกะข้อมูลจากกล้อง (EXIF)'}
                </span>
                <span>DB: {successData.data?.database_sync?.engine || 'Airtable'}</span>
              </div>
            </div>

            {/* Display Response JSON summary */}
            <div className="bg-slate-900 rounded-xl p-3 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-40 scrollbar-hide">
              <span className="text-slate-500 block mb-1 font-bold border-b border-slate-800 pb-1 uppercase tracking-widest text-[9px]">API Backend Response:</span>
              {JSON.stringify(successData, null, 2)}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={removeImage}
                className="flex-1 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold rounded-lg border-0 transition-all shadow-md active:scale-[0.98]"
              >
                ทำรายการใหม่
              </button>
              <button 
                onClick={() => navigate('/portal')}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg border-0 transition-all active:scale-[0.98]"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-auto">
        <div className="max-w-lg mx-auto text-center flex flex-col gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em]">
          <span>CALY DIGITAL LOCATION REPORT &bull; LINE SYSTEM V2</span>
          <span>&copy; {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
        </div>
      </footer>

      {/* 
        SILENT / BACKGROUND STEP OVERLAY 
        Using backdrop blur and state-controlled animation steps to WOW the user!
      */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-2xl flex flex-col gap-5 border border-slate-100 text-center animate-slideUp">
            
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-full border border-emerald-100">
                <Loader2 className="w-8 h-8 text-[#059669] animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">กำลังดำเนินการเบื้องหลัง</h3>
              <p className="text-xs text-slate-400">ระบบกำลังมัดรวมข้อมูลภาพถ่ายและพิกัด GPS</p>
            </div>

            {/* Silent process status pipeline */}
            <div className="flex flex-col gap-3 text-left">
              
              {/* Step 1: Compressing Image */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  activeStep === 0 
                    ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse' 
                    : activeStep > 0 
                      ? 'bg-emerald-100 border-emerald-200 text-[#059669]' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  {activeStep > 0 ? '✓' : '1'}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${activeStep === 0 ? 'text-[#059669]' : 'text-slate-500'}`}>บีบอัดไฟล์และเตรียมภาพถ่าย</span>
                  <span className="text-[10px] text-slate-400 font-medium">ย่อขนาดภาพเพื่อลดภาระการส่งข้อมูล</span>
                </div>
              </div>

              {/* Step 2: HTML5 Geolocation */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  activeStep === 1 
                    ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse' 
                    : activeStep > 1 
                      ? 'bg-emerald-100 border-emerald-200 text-[#059669]' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  {activeStep > 1 ? '✓' : '2'}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${activeStep === 1 ? 'text-[#059669]' : 'text-slate-500'}`}>ค้นหาพิกัดดาวเทียม (GPS)</span>
                  <span className="text-[10px] text-slate-400 font-medium">เรียกขอพิกัดความแม่นยำสูง (High Accuracy)</span>
                </div>
              </div>

              {/* Step 3: FormData Posting */}
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  activeStep === 2 
                    ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  3
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${activeStep === 2 ? 'text-[#059669]' : 'text-slate-500'}`}>นำส่งข้อมูลไปยังเซิร์ฟเวอร์</span>
                  <span className="text-[10px] text-slate-400 font-medium">จัดรูปแบบ FormData ส่ง POST API</span>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-slate-400 italic bg-slate-50 py-2 rounded-lg">
              * กรุณาอย่าปิดหน้าต่างเบราว์เซอร์หรือปิดแอปพลิเคชัน LINE
            </div>

          </div>
        </div>
      )}

      {/* 
        GPS ERROR OVERLAY MODAL (ROBUST & INSTRUCTIVE)
        A beautiful responsive popup showing tailored system instructions to guide users 
        who blocked geolocation permissions or turned off their cellular GPS on iOS/Android LINE Browser.
      */}
      {gpsError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md my-auto shadow-2xl flex flex-col border border-slate-100 overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="bg-red-500 p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm leading-tight">{gpsError.title}</h3>
                <span className="text-[11px] text-red-100 font-medium mt-0.5">LINE In-App Browser GPS Blocked</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="bg-red-50 border border-red-200 text-xs font-semibold text-red-900 p-3.5 rounded-xl leading-relaxed">
                {gpsError.message}
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  วิธีการแก้ไขเพื่อเปิดสิทธิ์ (คู่มือแนะนำ):
                </span>
                
                {/* Scrollable instructions formatting with code styles */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-[11px] text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                  {gpsError.instruction}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  <strong>เคล็ดลับเพิ่มเติม:</strong> หากแก้ไขตามสิทธิ์แล้วยังเข้าใช้งานไม่ได้ ให้แตะปุ่ม "แชร์ลิงก์" หรือ "เปิดด้วยเบราว์เซอร์อื่น" ที่มุมบนขวาของหน้าต่าง LINE เพื่อนำลิงก์ไปเปิดบนแอป Safari หรือ Google Chrome หลักของท่าน
                </p>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3">
              <button 
                onClick={() => {
                  setGpsError(null);
                  handleFormSubmit(); // Instantly retry geolocation retrieval
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl border-0 transition-all shadow-md active:scale-[0.98]"
              >
                ลองดึงพิกัดอีกครั้ง (Retry)
              </button>
              <button 
                onClick={() => setGpsError(null)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl border-0 transition-all active:scale-[0.98]"
              >
                ยกเลิก (Cancel)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CheckInPage;
