import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../../components/BottomNav/BottomNav';

const Settings = () => {
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

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      localStorage.removeItem('user');
      navigate('/linelogin');
    }
  };

  const handleOpenCamera = () => {
    console.log('Open camera from settings');
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
        {/* Account Section */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#f2f2f7] border-b border-[#e5e5ea]">
            <h5 className="text-[13px] font-semibold text-[#8e8e93] uppercase">บัญชี</h5>
          </div>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[15px] text-black">ข้อมูลส่วนตัว</span>
            </div>
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#f2f2f7] border-b border-[#e5e5ea]">
            <h5 className="text-[13px] font-semibold text-[#8e8e93] uppercase">แอปพลิเคชัน</h5>
          </div>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors border-b border-[#e5e5ea]">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-[15px] text-black">การแจ้งเตือน</span>
            </div>
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-[15px] text-black">ธีม</span>
            </div>
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* About */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#f2f2f7] border-b border-[#e5e5ea]">
            <h5 className="text-[13px] font-semibold text-[#8e8e93] uppercase">เกี่ยวกับ</h5>
          </div>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors border-b border-[#e5e5ea]">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[15px] text-black">เกี่ยวกับแอป</span>
            </div>
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[15px] text-black">นโยบายความเป็นส่วนตัว</span>
            </div>
            <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-[12px] p-4 shadow-sm hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[17px] font-semibold text-red-500">ออกจากระบบ</span>
        </button>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-[13px] text-[#8e8e93]">Calories Daily v1.0.0</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCameraClick={handleOpenCamera} />
    </div>
  );
};

export default Settings;
