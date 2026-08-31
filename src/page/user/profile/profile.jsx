import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../../components/BottomNav/BottomNav';
import LoadingOverlay from '../../../components/Loading/LoadingOverlay';
import { getUserService } from '../../../services/user.service';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      navigate('/linelogin');
    }
  }, [navigate]);

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const userRes = await getUserService(user.id);
        if (userRes.success && userRes.data) {
          const record = userRes.data;
          if (record && (record.cal || record.weight || record.gender)) {
            setUserData({
              Gender: record.gender || record.Gender,
              Weight: record.weight || record.Weight,
              Height: record.height || record.Height,
              Age: record.age || record.Age,
              'Activity Level': record.activity_level || record.activityLevel || record['Activity Level'],
              Goal: record.goal || record.Goal,
              Cal: record.cal || record.Cal
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleOpenCamera = () => {
    console.log('Open camera from profile');
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen bg-[#f2f2f7] flex flex-col" 
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      {/* Navbar - Fixed */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-6 shadow-sm flex-shrink-0">
        <div className="max-w-md mx-auto">
          <h1 className="text-[28px] font-bold text-white tracking-tight">
            Calories Daily
          </h1>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-20">
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

          {/* Loading Overlay */}
          <LoadingOverlay show={isLoading} message="กำลังโหลดข้อมูล..." />

          {userData ? (
            <>
              {/* Personal Info */}
              <div className="bg-white rounded-[12px] overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#f2f2f7] border-b border-[#e5e5ea]">
                  <h5 className="text-[13px] font-semibold text-[#8e8e93] uppercase">ข้อมูลส่วนตัว</h5>
                </div>
                <div className="divide-y divide-[#e5e5ea]">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-[15px] text-[#8e8e93]">เพศ</span>
                    <span className="text-[15px] text-black font-medium">
                      {userData.Gender === 'male' ? 'ชาย' : userData.Gender === 'female' ? 'หญิง' : '-'}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-[15px] text-[#8e8e93]">น้ำหนัก</span>
                    <span className="text-[15px] text-black font-medium">{userData.Weight || '-'} kg</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-[15px] text-[#8e8e93]">ส่วนสูง</span>
                    <span className="text-[15px] text-black font-medium">{userData.Height || '-'} cm</span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-[15px] text-[#8e8e93]">อายุ</span>
                    <span className="text-[15px] text-black font-medium">{userData.Age || '-'} ปี</span>
                  </div>
                </div>
              </div>

              {/* Activity & Goal */}
              <div className="bg-white rounded-[12px] overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-[#f2f2f7] border-b border-[#e5e5ea]">
                  <h5 className="text-[13px] font-semibold text-[#8e8e93] uppercase">กิจกรรมและเป้าหมาย</h5>
                </div>
                <div className="divide-y divide-[#e5e5ea]">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-[15px] text-[#8e8e93]">กิจกรรม</span>
                    <span className="text-[15px] text-black font-medium">
                      {userData.ActivityLevel === 'sedentary' ? 'นั่งทำงานอยู่กับที่' :
                       userData.ActivityLevel === 'light' ? 'ออกกำลังกายเบาๆ' :
                       userData.ActivityLevel === 'moderate' ? 'ออกกำลังกายปานกลาง' :
                       userData.ActivityLevel === 'active' ? 'ออกกำลังกายหนัก' :
                       userData.ActivityLevel === 'veryActive' ? 'ออกกำลังกายหนักมาก' : '-'}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-[15px] text-[#8e8e93]">เป้าหมาย</span>
                    <span className="text-[15px] text-black font-medium">
                      {userData.Goal === 'lose' ? 'ลดน้ำหนัก' :
                       userData.Goal === 'maintain' ? 'รักษาน้ำหนัก' :
                       userData.Goal === 'gain' ? 'เพิ่มน้ำหนัก' : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* TDEE */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] p-6 shadow-sm text-center">
                <p className="text-[13px] text-white/90 mb-2">ความต้องการพลังงานรายวัน (TDEE)</p>
                <p className="text-[36px] font-bold text-white">
                  {userData.Cal ? parseInt(userData.Cal).toLocaleString() : '-'}
                  <span className="text-[17px] font-normal ml-2">kcal/วัน</span>
                </p>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => navigate('/regis')}
                className="w-full bg-white rounded-[12px] p-4 shadow-sm hover:bg-[#f9f9f9] active:bg-[#f2f2f7] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-[17px] font-semibold text-green-500">แก้ไขข้อมูล</span>
              </button>
            </>
          ) : !isLoading && (
            <div className="bg-white rounded-[12px] p-6 shadow-sm text-center">
              <svg className="w-16 h-16 text-[#8e8e93] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-[17px] font-semibold text-black mb-2">ยังไม่มีข้อมูล</p>
              <p className="text-[13px] text-[#8e8e93] mb-4">กรุณากรอกข้อมูลส่วนตัวของคุณ</p>
              <button
                onClick={() => navigate('/regis')}
                className="px-6 py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200"
              >
                กรอกข้อมูล
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <BottomNav onCameraClick={handleOpenCamera} />
    </div>
  );
};

export default Profile;
