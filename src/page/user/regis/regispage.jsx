import { useState, useEffect } from 'react';
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
          
          if (record.Cal) {
            setResult({
              bmr: 0,
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
    console.log('Changed:', e.target.name, '=', e.target.value); // Debug
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTDEE = (e) => {
    e.preventDefault();
    setIsCalculating(true);
    
    setTimeout(() => {
      const { gender, weight, height, age, activityLevel, goal } = formData;
      
      const bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + (gender === 'male' ? 5 : -161);
      
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
    setIsUpdating(true);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_TDEE;
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_TDEE;
        const tableId = import.meta.env.VITE_AIRTABLE_TABLE_TDEE;
        
        const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        
        const checkResponse = await fetch(`${url}?filterByFormula=${encodeURIComponent(`line_uid='${user.id}'`)}`, {
          headers: { 'Authorization': `Bearer ${apiToken}` }
        });
        const checkData = await checkResponse.json();
        
        const tdeeValue = String(editableTDEE);
        
        if (!tdeeValue || tdeeValue === '' || tdeeValue === 'NaN' || isNaN(Number(tdeeValue))) {
          alert('ค่า TDEE ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          setIsUpdating(false);
          return;
        }
        
        const fieldsToUpdate = {
          Gender: formData.gender,
          Weight: String(formData.weight),
          Height: String(formData.height),
          Age: String(formData.age),
          'Activity Level': formData.activityLevel,
          Goal: formData.goal,
          Cal: tdeeValue
        };
        
        if (checkData.records && checkData.records.length > 0) {
          const recordId = checkData.records[0].id;
          await fetch(`${url}/${recordId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: fieldsToUpdate
            })
          });
        } else {
          await fetch(url, {
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
        }
      } catch (error) {
        console.error('Error saving to Airtable:', error);
      }
    }
    
    setTimeout(() => {
      setIsUpdating(false);
      navigate('/dashboard');
    }, 500);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarRegis />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarRegis />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">คำนวณ TDEE</h1>
          <p className="text-gray-600">กรอกข้อมูลเพื่อคำนวณความต้องการพลังงานรายวัน</p>
        </div>

        <form onSubmit={calculateTDEE} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          
          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-bold text-gray-700 mb-2">
              เพศ <span className="text-red-500">*</span>
            </label>
            <select 
              id="gender"
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className="block w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all bg-white"
              required
            >
              <option value="">-- กรุณาเลือกเพศ --</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="weight" className="block text-sm font-bold text-gray-700 mb-2">
                น้ำหนัก (kg) <span className="text-red-500">*</span>
              </label>
              <input 
                id="weight"
                type="number" 
                name="weight" 
                value={formData.weight}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all"
                placeholder="เช่น 70"
                min="1"
                max="300"
                required
              />
            </div>

            <div>
              <label htmlFor="height" className="block text-sm font-bold text-gray-700 mb-2">
                ส่วนสูง (cm) <span className="text-red-500">*</span>
              </label>
              <input 
                id="height"
                type="number" 
                name="height" 
                value={formData.height}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all"
                placeholder="เช่น 170"
                min="1"
                max="300"
                required
              />
            </div>
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-2">
              อายุ (ปี) <span className="text-red-500">*</span>
            </label>
            <input 
              id="age"
              type="number" 
              name="age" 
              value={formData.age}
              onChange={handleChange}
              className="block w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all"
              placeholder="เช่น 25"
              min="1"
              max="120"
              required
            />
          </div>

          {/* Activity Level */}
          <div>
            <label htmlFor="activityLevel" className="block text-sm font-bold text-gray-700 mb-2">
              ระดับกิจกรรม <span className="text-red-500">*</span>
            </label>
            <select 
              id="activityLevel"
              name="activityLevel" 
              value={formData.activityLevel}
              onChange={handleChange}
              className="block w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all bg-white"
              required
            >
              <option value="">-- กรุณาเลือกระดับกิจกรรม --</option>
              <option value="sedentary">นั่งทำงานเป็นส่วนใหญ่ ไม่ค่อยออกกำลังกาย</option>
              <option value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</option>
              <option value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</option>
              <option value="active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</option>
              <option value="very_active">ออกกำลังกายหนักมาก หรือมีงานใช้แรง</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label htmlFor="goal" className="block text-sm font-bold text-gray-700 mb-2">
              เป้าหมาย <span className="text-red-500">*</span>
            </label>
            <select 
              id="goal"
              name="goal" 
              value={formData.goal}
              onChange={handleChange}
              className="block w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 outline-none transition-all bg-white"
              required
            >
              <option value="maintain">คงน้ำหนัก</option>
              <option value="lose">ลดน้ำหนัก (ลด 500 kcal/วัน)</option>
              <option value="gain">เพิ่มน้ำหนัก (เพิ่ม 500 kcal/วัน)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isCalculating}
            className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isCalculating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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

      {/* Updating Modal */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xl font-bold text-gray-900">กำลังอัพเดทข้อมูล...</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">ผลการคำนวณ</h2>
              <p className="text-white text-opacity-90">คุณสามารถแก้ไขค่า TDEE ได้</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">BMR (อัตราการเผาผลาญพื้นฐาน)</p>
                <p className="text-4xl font-bold text-gray-900">
                  {result?.bmr.toLocaleString()} <span className="text-lg text-gray-600">kcal/วัน</span>
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <p className="text-sm text-gray-600 mb-2">TDEE (ความต้องการพลังงานรายวัน)</p>
                <input 
                  type="number" 
                  value={editableTDEE}
                  onChange={(e) => setEditableTDEE(e.target.value === '' ? '' : parseInt(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="w-full text-4xl font-bold text-green-600 bg-white rounded-xl px-4 py-3 border-2 border-green-400 focus:border-green-600 focus:ring-4 focus:ring-green-200 outline-none"
                  min="0"
                />
                <p className="text-sm text-gray-600 mt-2">คุณสามารถปรับค่านี้ตามความต้องการ</p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tips:</strong> คุณไม่ควรกินน้อยเกินหรือมากเกินจากค่า BMR เกิน <strong>±500 kcal</strong> ต่อวัน
                </p>
              </div>
            </div>

            <div className="p-6 flex gap-4">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-3 text-lg font-bold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
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
