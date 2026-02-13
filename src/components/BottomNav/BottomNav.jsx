import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = ({ onCameraClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5ea] safe-area-bottom z-40">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {/* หน้าแรก */}
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200 ${
              isActive('/dashboard') 
                ? 'text-green-500' 
                : 'text-[#8e8e93] hover:text-black active:scale-95'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">หน้าแรก</span>
          </button>

          {/* รายการอาหาร */}
          <button
            onClick={() => navigate('/foodmenu')}
            className={`flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200 ${
              isActive('/foodmenu') 
                ? 'text-green-500' 
                : 'text-[#8e8e93] hover:text-black active:scale-95'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-[10px] font-medium">รายการ</span>
          </button>

          {/* กล้อง (ตรงกลาง - ใหญ่กว่า) */}
          <button
            onClick={onCameraClick}
            className="flex items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg hover:from-green-500 hover:to-emerald-600 active:scale-95 transition-all duration-200"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* แก้ไขข้อมูล */}
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200 ${
              isActive('/profile') 
                ? 'text-green-500' 
                : 'text-[#8e8e93] hover:text-black active:scale-95'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-medium">ข้อมูล</span>
          </button>

          {/* การตั้งค่า */}
          <button
            onClick={() => navigate('/settings')}
            className={`flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all duration-200 ${
              isActive('/settings') 
                ? 'text-green-500' 
                : 'text-[#8e8e93] hover:text-black active:scale-95'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">ตั้งค่า</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
