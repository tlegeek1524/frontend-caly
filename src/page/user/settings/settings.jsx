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
          <button 
            onClick={() => navigate('/regis')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8e8e93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-[15px] text-black">แก้ไขข้อมูล</span>
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
          <p className="text-[13px] text-[#8e8e93]">Calories Daily v2.4</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCameraClick={handleOpenCamera} />
    </div>
  );
};

export default Settings;
