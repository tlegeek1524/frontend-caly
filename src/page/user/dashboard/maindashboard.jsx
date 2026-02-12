import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const MainDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [animatedCal, setAnimatedCal] = useState(0);
  const [showCameraModal, setShowCameraModal] = useState(false);
  
  // Mock data
  const mockUser = {
    name: 'สมชาย ใจดี',
    profilePic: 'https://via.placeholder.com/60',
    tdee: 2000
  };

  const mockFoodRecords = [
    {
      id: 1,
      menu: 'ข้าวผัดกุ้ง',
      date: new Date().toISOString(),
      cal: 450,
      protein: 25,
      carb: 60,
      fat: 12,
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 2,
      menu: 'ส้มตำไทย',
      date: new Date().toISOString(),
      cal: 120,
      protein: 5,
      carb: 20,
      fat: 3,
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 3,
      menu: 'ไก่ย่าง',
      date: new Date().toISOString(),
      cal: 280,
      protein: 35,
      carb: 5,
      fat: 15,
      image: 'https://via.placeholder.com/60'
    }
  ];

  // คำนวณสรุปโภชนาการ
  const totalCal = mockFoodRecords.reduce((sum, item) => sum + item.cal, 0);
  const totalProtein = mockFoodRecords.reduce((sum, item) => sum + item.protein, 0);
  const totalCarb = mockFoodRecords.reduce((sum, item) => sum + item.carb, 0);
  const totalFat = mockFoodRecords.reduce((sum, item) => sum + item.fat, 0);

  // คำนวณแคลอรี่จากโภชนาการ (มาตรฐาน: โปรตีน 4 kcal/g, คาร์บ 4 kcal/g, ไขมัน 9 kcal/g)
  const proteinCal = totalProtein * 4;
  const carbCal = totalCarb * 4;
  const fatCal = totalFat * 9;
  const totalNutritionCal = proteinCal + carbCal + fatCal;
  
  // แคลอรี่ที่เหลือจาก TDEE
  const remainingTDEE = Math.max(0, mockUser.tdee - totalNutritionCal);

  // Chart.js data
  const chartData = {
    labels: ['โปรตีน', 'คาร์บ', 'ไขมัน', 'เหลือ'],
    datasets: [
      {
        data: [proteinCal, carbCal, fatCal, remainingTDEE],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // blue - โปรตีน
          'rgba(249, 115, 22, 0.8)',  // orange - คาร์บ
          'rgba(239, 68, 68, 0.8)',   // red - ไขมัน
          'rgba(229, 229, 234, 0.5)',  // gray - เหลือ
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
          'rgb(229, 229, 234)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        bodyFont: {
          size: 13,
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${Math.round(value)} kcal`;
          }
        }
      },
    },
    cutout: '70%',
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
    if (window.confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      console.log('Delete item:', id);
    }
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera'; // บังคับให้เปิดกล้อง
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Captured image:', file);
        alert('ถ่ายรูปสำเร็จ: ' + file.name);
        setShowCameraModal(false);
      }
    };
    
    input.click();
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // ไม่ใส่ capture เพื่อให้เลือกจากแกลเลอรี่
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Selected image:', file);
        alert('เลือกรูปสำเร็จ: ' + file.name);
        setShowCameraModal(false);
      }
    };
    
    input.click();
  };

  const getProgressColor = () => {
    if (caloriePercentage < 70) return 'from-green-400 to-green-500';
    if (caloriePercentage < 100) return 'from-blue-400 to-blue-500';
    if (caloriePercentage < 120) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const getProgressBadgeColor = () => {
    if (caloriePercentage < 70) return 'bg-green-500';
    if (caloriePercentage < 100) return 'bg-blue-500';
    if (caloriePercentage < 120) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div 
      className="min-h-screen bg-[#f2f2f7]" 
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {/* Navbar */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-6 shadow-sm">
        <div className="max-w-md mx-auto">
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
              <h3 className="text-[17px] font-semibold text-black">{mockUser.name}</h3>
              <p className="text-[13px] text-[#8e8e93]">เป้าหมาย: {mockUser.tdee.toLocaleString()} kcal/วัน</p>
            </div>
          </div>
        </div>

        {/* Calorie Progress */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-100">
          <div className="flex justify-between items-center mb-3">
            <h5 className="text-[17px] font-semibold text-black">พลังงานวันนี้</h5>
            <span className={`${getProgressBadgeColor()} text-white text-[13px] font-semibold px-3 py-1 rounded-full transition-all duration-300`}>
              {Math.round(animatedPercentage)}%
            </span>
          </div>
          
          <div className="h-8 bg-[#e5e5ea] rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor()} flex items-center justify-center text-white text-[13px] font-semibold transition-all duration-300 ease-out`}
              style={{ width: `${Math.min(animatedPercentage, 100)}%` }}
            >
              {animatedCal} / {mockUser.tdee}
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
              <div className="text-[20px] font-bold text-black">{mockUser.tdee.toLocaleString()}</div>
              <div className="text-[11px] text-[#8e8e93]">เป้าหมาย</div>
            </div>
            <div>
              <div className={`text-[20px] font-bold transition-all duration-300 ${remainingCalories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {remainingCalories >= 0 
                  ? (mockUser.tdee - animatedCal).toLocaleString() 
                  : `+${Math.abs(mockUser.tdee - animatedCal).toLocaleString()}`
                }
              </div>
              <div className="text-[11px] text-[#8e8e93]">{remainingCalories >= 0 ? 'เหลือ' : 'เกิน'}</div>
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
              <div className="text-[24px] font-bold text-black">{Math.round(totalNutritionCal)}</div>
              <div className="text-[11px] text-[#8e8e93]">/ {mockUser.tdee} kcal</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">{totalProtein}g</div>
                <div className="text-[11px] text-[#8e8e93]">โปรตีน ({proteinCal} kcal)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">{totalCarb}g</div>
                <div className="text-[11px] text-[#8e8e93]">คาร์บ ({carbCal} kcal)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">{totalFat}g</div>
                <div className="text-[11px] text-[#8e8e93]">ไขมัน ({fatCal} kcal)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e5e5ea]"></div>
              <div>
                <div className="text-[15px] font-semibold text-black">{Math.round(remainingTDEE)}</div>
                <div className="text-[11px] text-[#8e8e93]">เหลือ (kcal)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-300">
          <label className="block text-[13px] text-black mb-2">เลือกวันที่</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 text-[15px] bg-[#f2f2f7] rounded-lg border-0 focus:bg-[#e5e5ea] focus:outline-none transition-all duration-200"
            />
            <button className="px-4 py-2 text-[15px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200">
              ดู
            </button>
          </div>
        </div>

        {/* Food List Button */}
        <button 
          onClick={() => navigate('/foodmenu')}
          className="w-full bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-400 hover:bg-[#f9f9f9] active:scale-[0.98] transition-all duration-200 text-left"
        >
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-[17px] font-semibold text-black mb-1">รายการอาหารวันนี้</h5>
              <p className="text-[13px] text-[#8e8e93]">ดูรายการอาหารทั้งหมด</p>
            </div>
            <svg className="w-6 h-6 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Action Buttons */}
        <div className="space-y-2 pb-6 animate-slideUpCard animate-delay-500">
          <button 
            onClick={handleOpenCamera}
            className="w-full py-3 text-[17px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            เพิ่มรายการอาหาร
          </button>
          <button className="w-full py-3 text-[17px] font-semibold text-green-500 bg-white rounded-[12px] hover:bg-[#f2f2f7] active:scale-[0.98] transition-all duration-200 shadow-sm">
            รายงานผลประจำสัปดาห์
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default MainDashboard;
