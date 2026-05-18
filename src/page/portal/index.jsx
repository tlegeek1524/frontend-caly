import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, ShieldAlert, Cpu, Loader2, MapPin } from 'lucide-react';
import { Snackbar, Alert } from "@mui/material";
import { fetchWithAuth } from "../../utils/api";

const Portal = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const user = JSON.parse(localStorage.getItem('user'));

  // Role detection
  const roles = user?.roles || [];
  const isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
  const isDev = Array.isArray(roles) ? roles.includes('dev') : roles === 'dev';
  const hasAdminAccess = isAdmin || isDev;

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const apiCall = fetchWithAuth("http://localhost:3000/auth/logout", {
      method: "POST"
    });

    try {
      await Promise.all([
        apiCall,
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      setSnackbar({ open: true, message: "ออกจากระบบสำเร็จ", severity: "success" });
    } catch (err) {
      console.error("Logout API error:", err);
    }

    localStorage.clear();
    setTimeout(() => navigate('/login'), 500);
  };

  const menuItems = [
    {
      id: 'main',
      title: 'Dashboard',
      desc: 'ระบบจัดการและตรวจสอบข้อมูลกลาง',
      icon: Activity,
      path: '/main',
      show: true
    },
    {
      id: 'checkin',
      title: 'Geo Check-in',
      desc: 'รายงานพิกัดและข้อมูลภาพถ่ายเบื้องหลัง (LINE In-App Browser)',
      icon: MapPin,
      path: '/checkin',
      show: true
    },
    {
      id: 'admin',
      title: isAdmin ? 'Admin Console' : 'Dev Console',
      desc: isAdmin ? 'ระบบบริหารจัดการสิทธิ์และผู้ใช้' : 'เครื่องมือสำหรับนักพัฒนาระบบ',
      icon: isAdmin ? ShieldAlert : Cpu,
      path: '/admin-dashboard',
      show: hasAdminAccess
    }
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Sarabun']">
      
      {/* Simple Header */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-none flex items-center justify-center text-white font-bold text-lg">C</div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">CALY PORTAL</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block border-r border-slate-200 pr-4">
            <p className="text-sm font-bold text-slate-900">{user?.full_name || 'Administrator'}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest uppercase">{isAdmin ? 'Admin' : isDev ? 'Developer' : 'User'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-bold text-xs uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-6 bg-[#f0f4f0]">
        <div className={`grid grid-cols-1 ${menuItems.length > 1 ? 'md:grid-cols-2' : ''} gap-4 w-full max-w-3xl`}>
          {menuItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(item.path)}
              className="bg-white border-2 border-slate-200 hover:border-emerald-500 p-8 cursor-pointer transition-all flex flex-col gap-4 group"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                <span>เข้าใช้งาน</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Footer */}
      <div className="bg-white border-t border-slate-200 py-4 px-6 flex justify-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          &copy; 2026 CALY DIGITAL &bull; FLAT SYSTEM V2
        </p>
      </div>

      {/* Minimal Loading Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="mt-4 text-xs font-bold text-emerald-600 uppercase tracking-widest animate-pulse">กำลังออกจากระบบ...</p>
        </div>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 0, fontWeight: 'bold' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Portal;
