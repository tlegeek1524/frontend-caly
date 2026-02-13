import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../../components/BottomNav/BottomNav';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/linelogin');
    }
  }, [navigate]);

  const handleOpenCamera = () => {
    // ฟังก์ชันเปิดกล้อง (ถ้าต้องการ)
    console.log('Open camera from profile');
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen bg-[#f2f2f7] pb-20" 
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
        <div className="bg-white rounded-[12px] p-6 shadow-sm text-center">
          <img 
            src={user.picture} 
            alt="profile" 
            className="w-24 h-24 rounded-full border-4 border-green-400 mx-auto mb-4"
          />
          <h3 className="text-[20px] font-semibold text-black mb-1">{user.name}</h3>
          <p className="text-[13px] text-[#8e8e93]">LINE User ID: {user.id}</p>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-[12px] p-4 shadow-sm">
          <h5 className="text-[17px] font-semibold text-black mb-3">ข้อมูลส่วนตัว</h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#e5e5ea]">
              <span className="text-[15px] text-[#8e8e93]">ชื่อ</span>
              <span className="text-[15px] text-black font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#e5e5ea]">
              <span className="text-[15px] text-[#8e8e93]">สถานะ</span>
              <span className="text-[15px] text-black font-medium">{user.statusMessage || '-'}</span>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-[12px] p-6 shadow-sm text-center">
          <svg className="w-16 h-16 text-[#8e8e93] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p className="text-[17px] font-semibold text-black mb-2">ฟีเจอร์กำลังพัฒนา</p>
          <p className="text-[13px] text-[#8e8e93]">การแก้ไขข้อมูลจะเปิดให้ใช้งานเร็วๆ นี้</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCameraClick={handleOpenCamera} />
    </div>
  );
};

export default Profile;
