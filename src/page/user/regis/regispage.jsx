import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import NavbarRegis from './navbarregis/NavbarRegis';
import LoadingOverlay from '../../../components/Loading/LoadingOverlay';
import { 
  calculateBMR, 
  calculateTDEEValue, 
  getUserService, 
  createUserService, 
  updateUserService 
} from '../../../services/user.service';

const Regispage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: '',
    weight: '',
    height: '',
    age: '',
    activityLevel: '',
    goal: 'maintain'
  });

  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [editableTDEE, setEditableTDEE] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isExistingUser, setIsExistingUser] = useState(false);

  // ดึงข้อมูลเดิมของผู้ใช้เมื่อเปิดหน้า
  useEffect(() => {
    const loadExistingData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setIsLoadingData(false);
        return;
      }

      try {
        const { success, data: record } = await getUserService(user.id);
        if (success && record) {
          if (record.gender || record.weight || record.cal) {
            setIsExistingUser(true);
            setFormData({
              gender: record.gender?.toLowerCase() || '',
              weight: record.weight !== undefined && record.weight !== null ? String(record.weight) : '',
              height: record.height !== undefined && record.height !== null ? String(record.height) : '',
              age: record.age !== undefined && record.age !== null ? String(record.age) : '',
              activityLevel: record.activity_level || record.activityLevel || '',
              goal: record.goal?.toLowerCase() || 'maintain'
            });
            
            if (record.cal) {
              setResult({
                bmr: 0,
                tdee: parseInt(record.cal)
              });
              setEditableTDEE(parseInt(record.cal));
            }
          }
        }
      } catch (error) {
        console.error('Error loading existing data from API:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadExistingData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTDEE = (e) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Simulate calculation delay for smooth transition
    setTimeout(() => {
      const { gender, weight, height, age, activityLevel, goal } = formData;
      
      const bmr = calculateBMR({ gender, weight, height, age });
      const tdee = calculateTDEEValue({ bmr, activityLevel, goal });
      
      const calculatedResult = {
        bmr,
        tdee
      };
      
      setResult(calculatedResult);
      setEditableTDEE(calculatedResult.tdee);
      setIsCalculating(false);
      setShowPopup(true);
    }, 500);
  };

  const handleConfirm = async () => {
    setShowPopup(false);
    setIsUpdating(true); // เริ่ม loading
    
    console.log('Confirmed TDEE:', editableTDEE);
    console.log('Form data:', formData);
    
    // บันทึกข้อมูลผ่าน API
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        const tdeeValue = Number(editableTDEE);
        
        if (isNaN(tdeeValue) || tdeeValue <= 0) {
          console.error('Invalid TDEE value:', editableTDEE);
          alert('ค่า TDEE ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          setIsUpdating(false);
          return;
        }

        const basePayload = {
          gender: formData.gender,
          age: parseInt(formData.age, 10) || null,
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          activity_level: formData.activityLevel,
          goal: formData.goal,
          cal: tdeeValue
        };

        if (isExistingUser) {
          console.log('PATCH to /api/v1/user/' + user.id, basePayload);
          const { success, error } = await updateUserService(user.id, basePayload);
          if (!success) {
            console.error('API Error updating user (PATCH):', error);
            alert('อัปเดตข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
          } else {
            console.log('User data updated successfully via PATCH');
          }
        } else {
          const postPayload = {
            line_uid: user.id,
            ...basePayload
          };
          console.log('POST to /api/v1/user:', postPayload);
          const { success, error } = await createUserService(postPayload);
          if (!success) {
            console.error('API Error creating user (POST):', error);
            alert('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
          } else {
            console.log('User data created successfully via POST');
          }
        }
      } catch (error) {
        console.error('Error saving user data:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    }
    
    // รอสักครู่แล้วไปหน้า dashboard
    setTimeout(() => {
      setIsUpdating(false);
      navigate('/dashboard');
    }, 500);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    document.body.style.overflow = 'unset';
  };

  // ล็อคการเลื่อนหน้าเมื่อ popup เปิด
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  // Options Data for Custom Select
  const genderOptions = [
    { value: 'male', label: 'ชาย' },
    { value: 'female', label: 'หญิง' }
  ];

  const activityOptions = [
    { value: 'sedentary', label: 'นั่งทำงานเป็นส่วนใหญ่ ไม่ค่อยออกกำลังกาย' },
    { value: 'light', label: 'ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์' },
    { value: 'moderate', label: 'ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์' },
    { value: 'active', label: 'ออกกำลังกายหนัก 6-7 วัน/สัปดาห์' },
    { value: 'very_active', label: 'ออกกำลังกายหนักมาก หรือมีงานใช้แรง' }
  ];

  const goalOptions = [
    { value: 'maintain', label: 'คงน้ำหนัก' },
    { value: 'lose', label: 'ลดน้ำหนัก (ลด 500 kcal/วัน)' },
    { value: 'gain', label: 'เพิ่มน้ำหนัก (เพิ่ม 500 kcal/วัน)' }
  ];

  const [openDropdown, setOpenDropdown] = useState(null); // 'gender' | 'activity' | 'goal' | null

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectOption = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] transition-all duration-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Navbar */}
      <NavbarRegis />
      
      {/* Loading Overlay */}
      <LoadingOverlay show={isLoadingData || isUpdating} message={isUpdating ? "กำลังอัพเดทข้อมูล..." : "กำลังโหลดข้อมูล..."} />

      {!isLoadingData && (
        <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">
            คำนวณ TDEE
          </h2>
          <p className="text-[15px] text-slate-500">
            กรอกข้อมูลเพื่อคำนวณความต้องการพลังงานรายวัน
          </p>
        </div>

        {/* Form */}
        <form onSubmit={calculateTDEE} className="space-y-4">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-visible">
            {/* Gender Dropdown */}
            <div className="px-4 py-3.5 relative custom-dropdown-container">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">เพศ</label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'gender' ? null : 'gender')}
                className={`w-full px-3.5 py-2.5 text-[15px] rounded-xl flex items-center justify-between border transition-all duration-200 text-left ${
                  openDropdown === 'gender'
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <span className={formData.gender ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                  {genderOptions.find(o => o.value === formData.gender)?.label || 'เลือกเพศ'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDropdown === 'gender' ? 'rotate-180 text-emerald-500' : ''}`} />
              </button>

              {/* Menu List */}
              {openDropdown === 'gender' && (
                <div className="absolute left-4 right-4 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 animate-fadeIn">
                  {genderOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleSelectOption('gender', opt.value)}
                      className={`w-full px-4 py-2.5 text-[14px] flex items-center justify-between text-left transition-colors ${
                        formData.gender === opt.value
                          ? 'bg-emerald-50 text-emerald-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {formData.gender === opt.value && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="px-4 py-3.5">
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">น้ำหนัก</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <input 
                    type="number" 
                    name="weight" 
                    value={formData.weight}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2.5 text-[15px] bg-transparent border-0 text-slate-900 focus:outline-none"
                    placeholder="0"
                    required
                  />
                  <span className="px-3 text-[14px] text-slate-400 font-medium">kg</span>
                </div>
              </div>

              <div className="px-4 py-3.5">
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">ส่วนสูง</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <input 
                    type="number" 
                    name="height" 
                    value={formData.height}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2.5 text-[15px] bg-transparent border-0 text-slate-900 focus:outline-none"
                    placeholder="0"
                    required
                  />
                  <span className="px-3 text-[14px] text-slate-400 font-medium">cm</span>
                </div>
              </div>
            </div>

            {/* Age */}
            <div className="px-4 py-3.5">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">อายุ</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2.5 text-[15px] bg-transparent border-0 text-slate-900 focus:outline-none"
                  placeholder="0"
                  required
                />
                <span className="px-3 text-[14px] text-slate-400 font-medium">ปี</span>
              </div>
            </div>

            {/* Activity Level Dropdown */}
            <div className="px-4 py-3.5 relative custom-dropdown-container">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">ระดับกิจกรรม</label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'activity' ? null : 'activity')}
                className={`w-full px-3.5 py-2.5 text-[15px] rounded-xl flex items-center justify-between border transition-all duration-200 text-left ${
                  openDropdown === 'activity'
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <span className={formData.activityLevel ? 'text-slate-900 font-medium truncate pr-2' : 'text-slate-400 truncate pr-2'}>
                  {activityOptions.find(o => o.value === formData.activityLevel)?.label || 'เลือกระดับกิจกรรม'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openDropdown === 'activity' ? 'rotate-180 text-emerald-500' : ''}`} />
              </button>

              {/* Menu List */}
              {openDropdown === 'activity' && (
                <div className="absolute left-4 right-4 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 animate-fadeIn max-h-60 overflow-y-auto">
                  {activityOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleSelectOption('activityLevel', opt.value)}
                      className={`w-full px-4 py-2.5 text-[14px] flex items-center justify-between text-left transition-colors ${
                        formData.activityLevel === opt.value
                          ? 'bg-emerald-50 text-emerald-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="pr-2">{opt.label}</span>
                      {formData.activityLevel === opt.value && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Goal Dropdown */}
            <div className="px-4 py-3.5 relative custom-dropdown-container">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">เป้าหมาย</label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'goal' ? null : 'goal')}
                className={`w-full px-3.5 py-2.5 text-[15px] rounded-xl flex items-center justify-between border transition-all duration-200 text-left ${
                  openDropdown === 'goal'
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <span className={formData.goal ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                  {goalOptions.find(o => o.value === formData.goal)?.label || 'เลือกเป้าหมาย'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDropdown === 'goal' ? 'rotate-180 text-emerald-500' : ''}`} />
              </button>

              {/* Menu List */}
              {openDropdown === 'goal' && (
                <div className="absolute left-4 right-4 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 animate-fadeIn">
                  {goalOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleSelectOption('goal', opt.value)}
                      className={`w-full px-4 py-2.5 text-[14px] flex items-center justify-between text-left transition-colors ${
                        formData.goal === opt.value
                          ? 'bg-emerald-50 text-emerald-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {formData.goal === opt.value && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isCalculating}
            className="w-full py-4 text-[17px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังคำนวณ...
              </span>
            ) : (
              'คำนวณ TDEE'
            )}
          </button>
        </form>
      </div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn px-4 py-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] max-w-md w-full shadow-2xl animate-slideUp overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-5 text-center flex-shrink-0">
              <h2 className="text-[24px] font-bold text-white mb-1">ผลการคำนวณ</h2>
              <p className="text-[15px] text-white/90">คุณสามารถแก้ไขค่า TDEE ได้</p>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* BMR - Read Only */}
              <div className="bg-[#f2f2f7] rounded-[12px] p-4">
                <label className="block text-[13px] text-[#8e8e93] mb-2">BMR (อัตราการเผาผลาญพื้นฐาน)</label>
                <div className="text-[28px] font-bold text-black">
                  {result?.bmr.toLocaleString()} <span className="text-[17px] text-[#8e8e93] font-normal">kcal/วัน</span>
                </div>
              </div>

              {/* TDEE - Editable */}
              <div className="bg-[#f2f2f7] rounded-[12px] p-4">
                <label className="block text-[13px] text-[#8e8e93] mb-2">TDEE (ความต้องการพลังงานรายวัน)</label>
                <input 
                  type="number" 
                  value={editableTDEE}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditableTDEE(value === '' ? '' : parseInt(value));
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full text-[28px] font-bold text-green-500 bg-white rounded-lg px-4 py-3 border-2 border-green-400 focus:border-green-500 focus:outline-none transition-all duration-200"
                  placeholder="0"
                  min="0"
                />
                <p className="text-[13px] text-[#8e8e93] mt-2">
                  คุณสามารถปรับค่านี้ตามความต้องการของคุณได้
                </p>
              </div>

              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-[12px] p-4">
                <p className="text-[15px] text-green-800 leading-relaxed">
                  <span className="font-bold">Tips:</span> คุณไม่ควรกินน้อยเกินหรือมากเกินจากค่า BMR ที่แนะนำของคุณเกิน <span className="font-bold">±500 kcal</span> ต่อวัน
                </p>
              </div>
            </div>

            {/* Actions - Fixed */}
            <div className="px-6 pb-6 flex gap-3 flex-shrink-0 bg-white border-t border-[#e5e5ea] pt-4">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-3 text-[17px] font-semibold text-[#8e8e93] bg-[#f2f2f7] rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 text-[17px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-md"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regispage;
