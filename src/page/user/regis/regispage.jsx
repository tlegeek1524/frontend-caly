import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarRegis from './navbarregis/NavbarRegis';

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

  // ดึงข้อมูลเดิมจาก Airtable เมื่อเปิดหน้า
  useEffect(() => {
    const loadExistingData = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) {
        setIsLoadingData(false);
        return;
      }

      try {
        const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_TDEE;
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_TDEE;
        const tableId = import.meta.env.VITE_AIRTABLE_TABLE_TDEE;
        
        const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        
        const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(`line_uid='${user.id}'`)}`, {
          headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
          const record = data.records[0].fields;
          
          // แปลง field names จาก Airtable มาเป็น formData
          const activityLevelMap = {
            'very_active': 'very_active',
            'active': 'active',
            'moderate': 'moderate',
            'light': 'light',
            'sedentary': 'sedentary'
          };
          
          setFormData({
            gender: record.Gender?.toLowerCase() || '',
            weight: record.Weight || '',
            height: record.Height || '',
            age: record.Age || '',
            activityLevel: activityLevelMap[record['Activity Level']] || '',
            goal: record.Goal?.toLowerCase() || 'maintain'
          });
          
          // ถ้ามี TDEE อยู่แล้ว ให้แสดงด้วย
          if (record.Cal) {
            setResult({
              bmr: 0, // ไม่มีใน Airtable
              tdee: parseInt(record.Cal)
            });
            setEditableTDEE(parseInt(record.Cal));
          }
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
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
      
      // คำนวณ BMR
      const bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + (gender === 'male' ? 5 : -161);
      
      // คำนวณ TDEE ตามระดับกิจกรรม
      let tdee;
      switch (activityLevel) {
        case 'sedentary':
          tdee = bmr * 1.2;
          break;
        case 'light':
          tdee = bmr * 1.375;
          break;
        case 'moderate':
          tdee = bmr * 1.55;
          break;
        case 'active':
          tdee = bmr * 1.725;
          break;
        case 'very_active':
          tdee = bmr * 1.9;
          break;
        default:
          tdee = bmr;
      }
      
      // ปรับตามเป้าหมาย
      if (goal === 'lose') {
        tdee -= 500;
      } else if (goal === 'gain') {
        tdee += 500;
      }
      
      const calculatedResult = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
      };
      
      setResult(calculatedResult);
      setEditableTDEE(calculatedResult.tdee);
      setIsCalculating(false);
      setShowPopup(true);
    }, 800);
  };

  const handleConfirm = async () => {
    setShowPopup(false);
    setIsUpdating(true); // เริ่ม loading
    
    console.log('Confirmed TDEE:', editableTDEE);
    console.log('Form data:', formData);
    
    // บันทึกข้อมูลลง Airtable (ถ้ามี)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_TDEE;
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_TDEE;
        const tableId = import.meta.env.VITE_AIRTABLE_TABLE_TDEE;
        
        const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        
        // เช็คว่ามี record อยู่แล้วหรือไม่
        const checkResponse = await fetch(`${url}?filterByFormula=${encodeURIComponent(`line_uid='${user.id}'`)}`, {
          headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        const checkData = await checkResponse.json();
        
        // แปลง TDEE เป็น string
        const tdeeValue = String(editableTDEE);
        
        console.log('TDEE value to save:', tdeeValue);
        
        if (!tdeeValue || tdeeValue === '' || tdeeValue === 'NaN' || isNaN(Number(tdeeValue))) {
          console.error('Invalid TDEE value:', editableTDEE);
          alert('ค่า TDEE ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          setIsUpdating(false);
          return;
        }
        
        // ข้อมูลที่จะบันทึก
        const fieldsToUpdate = {
          Gender: formData.gender,
          Weight: String(formData.weight),
          Height: String(formData.height),
          Age: String(formData.age),
          'Activity Level': formData.activityLevel,
          Goal: formData.goal,
          Cal: tdeeValue
        };
        
        console.log('Fields to update:', fieldsToUpdate);
        console.log('Fields to update (JSON):', JSON.stringify(fieldsToUpdate, null, 2));
        
        if (checkData.records && checkData.records.length > 0) {
          // อัพเดท record เดิม
          const recordId = checkData.records[0].id;
          const response = await fetch(`${url}/${recordId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: fieldsToUpdate
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Airtable Error:', errorData);
            console.log('Existing record fields:', checkData.records[0].fields);
          } else {
            console.log('Update successful');
          }
        } else {
          // สร้าง record ใหม่
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: {
                line_uid: user.id,
                ...fieldsToUpdate
              }
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Airtable Error:', errorData);
          } else {
            console.log('Create successful');
          }
        }
      } catch (error) {
        console.error('Error saving to Airtable:', error);
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
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] transition-all duration-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Navbar */}
      <NavbarRegis />
      
      {/* Loading Initial Data */}
      {isLoadingData ? (
        <div className="max-w-md mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[17px] font-semibold text-black">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-[24px] sm:text-[28px] font-bold text-black tracking-tight mb-2">
            คำนวณ TDEE
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#8e8e93]">
            กรอกข้อมูลเพื่อคำนวณความต้องการพลังงานรายวัน
          </p>
        </div>

        {/* Form */}
        <form onSubmit={calculateTDEE} className="space-y-3 sm:space-y-4">
          {/* Card Container */}
          <div className="bg-white rounded-[10px] sm:rounded-[12px] overflow-hidden shadow-sm transform transition-all duration-300 hover:shadow-md">
            {/* Gender */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#e5e5ea] transition-colors duration-200">
              <label className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">เพศ</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-[15px] sm:text-[17px] bg-[#f2f2f7] rounded-lg border-0 text-black appearance-none focus:bg-[#e5e5ea] focus:outline-none transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238E8E93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '32px'
                }}
                required
              >
                <option value="">เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-2 border-b border-[#e5e5ea]">
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-r border-[#e5e5ea]">
                <label className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">น้ำหนัก</label>
                <div className="flex items-center bg-[#f2f2f7] rounded-lg overflow-hidden transition-all duration-200 focus-within:bg-[#e5e5ea]">
                  <input 
                    type="number" 
                    name="weight" 
                    value={formData.weight}
                    onChange={handleChange}
                    className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 text-[15px] sm:text-[17px] bg-transparent border-0 text-black focus:outline-none"
                    placeholder="0"
                    required
                  />
                  <span className="px-2 sm:px-3 text-[15px] sm:text-[17px] text-[#8e8e93]">kg</span>
                </div>
              </div>

              <div className="px-3 sm:px-4 py-2.5 sm:py-3">
                <label className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">ส่วนสูง</label>
                <div className="flex items-center bg-[#f2f2f7] rounded-lg overflow-hidden transition-all duration-200 focus-within:bg-[#e5e5ea]">
                  <input 
                    type="number" 
                    name="height" 
                    value={formData.height}
                    onChange={handleChange}
                    className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 text-[15px] sm:text-[17px] bg-transparent border-0 text-black focus:outline-none"
                    placeholder="0"
                    required
                  />
                  <span className="px-2 sm:px-3 text-[15px] sm:text-[17px] text-[#8e8e93]">cm</span>
                </div>
              </div>
            </div>

            {/* Age */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#e5e5ea]">
              <label className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">อายุ</label>
              <div className="flex items-center bg-[#f2f2f7] rounded-lg overflow-hidden transition-all duration-200 focus-within:bg-[#e5e5ea]">
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age}
                  onChange={handleChange}
                  className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 text-[15px] sm:text-[17px] bg-transparent border-0 text-black focus:outline-none"
                  placeholder="0"
                  required
                />
                <span className="px-2.5 sm:px-3 text-[15px] sm:text-[17px] text-[#8e8e93]">ปี</span>
              </div>
            </div>

            {/* Activity Level */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#e5e5ea]">
              <label className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">ระดับกิจกรรม</label>
              <select 
                name="activityLevel" 
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-[14px] sm:text-[17px] bg-[#f2f2f7] rounded-lg border-0 text-black appearance-none focus:bg-[#e5e5ea] focus:outline-none transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238E8E93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '32px'
                }}
                required
              >
                <option value="">เลือกระดับกิจกรรม</option>
                <option value="sedentary">นั่งทำงานเป็นส่วนใหญ่ ไม่ค่อยออกกำลังกาย</option>
                <option value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</option>
                <option value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</option>
                <option value="active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</option>
                <option value="very_active">ออกกำลังกายหนักมาก หรือมีงานใช้แรง</option>
              </select>
            </div>

            {/* Goal */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3">
              <label className="block text-[12px] sm:text-[13px] text-black mb-1.5 sm:mb-2">เป้าหมาย</label>
              <select 
                name="goal" 
                value={formData.goal}
                onChange={handleChange}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-[15px] sm:text-[17px] bg-[#f2f2f7] rounded-lg border-0 text-black appearance-none focus:bg-[#e5e5ea] focus:outline-none transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238E8E93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  paddingRight: '32px'
                }}
                required
              >
                <option value="maintain">คงน้ำหนัก</option>
                <option value="lose">ลดน้ำหนัก (ลด 500 kcal/วัน)</option>
                <option value="gain">เพิ่มน้ำหนัก (เพิ่ม 500 kcal/วัน)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isCalculating}
            className="w-full py-3 sm:py-4 text-[16px] sm:text-[17px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[10px] sm:rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Updating Modal */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-[20px] p-6 max-w-xs mx-4 animate-slideUp">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[17px] font-semibold text-black">กำลังอัพเดทข้อมูล...</p>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn px-3 sm:px-4">
          <div className="bg-white rounded-[16px] sm:rounded-[20px] max-w-md w-full shadow-2xl animate-slideUp overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 sm:px-6 py-4 sm:py-5 text-center">
              <h2 className="text-[20px] sm:text-[24px] font-bold text-white mb-1">ผลการคำนวณ</h2>
              <p className="text-[13px] sm:text-[15px] text-white/90">คุณสามารถแก้ไขค่า TDEE ได้</p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* BMR - Read Only */}
              <div className="bg-[#f2f2f7] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4">
                <label className="block text-[12px] sm:text-[13px] text-[#8e8e93] mb-1.5 sm:mb-2">BMR (อัตราการเผาผลาญพื้นฐาน)</label>
                <div className="text-[24px] sm:text-[28px] font-bold text-black">
                  {result?.bmr.toLocaleString()} <span className="text-[15px] sm:text-[17px] text-[#8e8e93] font-normal">kcal/วัน</span>
                </div>
              </div>

              {/* TDEE - Editable */}
              <div className="bg-[#f2f2f7] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4">
                <label className="block text-[12px] sm:text-[13px] text-[#8e8e93] mb-1.5 sm:mb-2">TDEE (ความต้องการพลังงานรายวัน)</label>
                <input 
                  type="number" 
                  value={editableTDEE}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditableTDEE(value === '' ? '' : parseInt(value));
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full text-[24px] sm:text-[28px] font-bold text-green-500 bg-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-green-400 focus:border-green-500 focus:outline-none transition-all duration-200"
                  placeholder="0"
                  min="0"
                />
                <p className="text-[12px] sm:text-[13px] text-[#8e8e93] mt-1.5 sm:mt-2">
                  คุณสามารถปรับค่านี้ตามความต้องการของคุณได้
                </p>
              </div>

              {/* Info */}
              <div className="bg-green-50 border border-green-200 rounded-[10px] sm:rounded-[12px] p-3 sm:p-4">
                <p className="text-[13px] sm:text-[15px] text-green-800 leading-relaxed">
                  <span className="font-bold">Tips:</span> คุณไม่ควรกินน้อยเกินหรือมากเกินจากค่า BMR ที่แนะนำของคุณเกิน <span className="font-bold">±500 kcal</span> ต่อวัน
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2 sm:gap-3">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-2.5 sm:py-3 text-[15px] sm:text-[17px] font-semibold text-[#8e8e93] bg-[#f2f2f7] rounded-[10px] sm:rounded-[12px] hover:bg-[#e5e5ea] active:scale-[0.98] transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 sm:py-3 text-[15px] sm:text-[17px] font-semibold text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-[10px] sm:rounded-[12px] hover:from-green-500 hover:to-emerald-600 active:scale-[0.98] transition-all duration-200 shadow-md"
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
