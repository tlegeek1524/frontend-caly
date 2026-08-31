import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import BottomNav from '../../../components/BottomNav/BottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/linelogin');
    }
  }, [navigate]);

  const confirmLogout = () => {
    localStorage.removeItem('user');
    navigate('/linelogin');
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
          onClick={() => setShowLogoutModal(true)}
          className="w-full bg-white rounded-[12px] p-4 shadow-sm hover:bg-red-50 active:bg-red-100 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-100"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-[17px] font-semibold text-red-500">ออกจากระบบ</span>
        </button>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-[13px] text-[#8e8e93]">Calories Daily v2.4</p>
        </div>
      </div>

      {/* Tailwind Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center transform transition-all animate-slideUp border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50/50">
              <LogOut className="w-7 h-7 stroke-[2.2]" />
            </div>

            {/* Title & Desc */}
            <h3 className="text-[19px] font-bold text-slate-900 mb-1.5">
              ยืนยันการออกจากระบบ?
            </h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              คุณจะต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อเข้าถึงข้อมูลสุขภาพและบันทึกอาหารของคุณ
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 text-[15px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="w-full py-3 text-[15px] font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl shadow-sm transition-all"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav onCameraClick={handleOpenCamera} />
    </div>
  );
};

export default Settings;
