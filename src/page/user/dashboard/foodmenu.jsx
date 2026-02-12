import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FoodMenu = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const containerRef = useRef(null);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -100) {
      // Swipe right - go back
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
  
  // Mock data
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
    },
    {
      id: 4,
      menu: 'ผัดไทย',
      date: new Date().toISOString(),
      cal: 380,
      protein: 15,
      carb: 55,
      fat: 10,
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 5,
      menu: 'ต้มยำกุ้ง',
      date: new Date().toISOString(),
      cal: 150,
      protein: 20,
      carb: 10,
      fat: 5,
      image: 'https://via.placeholder.com/60'
    }
  ];

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
    input.capture = 'camera';
    
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

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#f2f2f7]" 
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {/* Navbar */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-6 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-[28px] font-bold text-white tracking-tight">
            รายการอาหาร
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Date Filter */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard">
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

        {/* Food List */}
        <div className="animate-slideUpCard animate-delay-100">
          <h5 className="text-[17px] font-semibold text-black mb-3 px-1">
            รายการอาหารวันที่ {new Date(selectedDate).toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h5>
          <div className="space-y-3">
            {mockFoodRecords.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-[12px] overflow-hidden shadow-sm animate-slideUpCard" 
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="bg-[#f2f2f7] px-4 py-2 flex justify-between items-center border-b border-[#e5e5ea]">
                  <span className="text-[15px] font-semibold text-black">{item.menu}</span>
                  <span className="text-[13px] text-[#8e8e93]">
                    {new Date(item.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex gap-3 items-start">
                    <img 
                      src={item.image} 
                      alt={item.menu}
                      className="w-16 h-16 rounded-lg object-cover bg-[#f2f2f7]"
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-[13px] text-[#8e8e93]">{item.cal} kcal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-[13px] text-[#8e8e93]">{item.protein}g โปรตีน</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span className="text-[13px] text-[#8e8e93]">{item.carb}g คาร์บ</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-[13px] text-[#8e8e93]">{item.fat}g ไขมัน</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[13px] text-red-500 font-medium hover:text-red-600 transition-colors"
                      >
                        ลบรายการ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm animate-slideUpCard animate-delay-300">
          <h5 className="text-[15px] font-semibold text-black mb-3">สรุปรวม</h5>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-[18px] font-bold text-green-500">
                {mockFoodRecords.reduce((sum, item) => sum + item.cal, 0)}
              </div>
              <div className="text-[11px] text-[#8e8e93]">แคลอรี่</div>
            </div>
            <div className="text-center">
              <div className="text-[18px] font-bold text-blue-500">
                {mockFoodRecords.reduce((sum, item) => sum + item.protein, 0)}g
              </div>
              <div className="text-[11px] text-[#8e8e93]">โปรตีน</div>
            </div>
            <div className="text-center">
              <div className="text-[18px] font-bold text-orange-500">
                {mockFoodRecords.reduce((sum, item) => sum + item.carb, 0)}g
              </div>
              <div className="text-[11px] text-[#8e8e93]">คาร์บ</div>
            </div>
            <div className="text-center">
              <div className="text-[18px] font-bold text-red-500">
                {mockFoodRecords.reduce((sum, item) => sum + item.fat, 0)}g
              </div>
              <div className="text-[11px] text-[#8e8e93]">ไขมัน</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-6 animate-slideUpCard animate-delay-400">
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

export default FoodMenu;
