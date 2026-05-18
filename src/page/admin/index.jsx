import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  ShieldAlert, 
  Users, 
  Settings, 
  Activity, 
  Terminal, 
  Server,
  Database,
  Search,
  ArrowRight,
  Loader2,
  RefreshCw,
  Globe,
  User as UserIcon,
  Clock,
  Trash2,
  Lock,
  Unlock,
  Eraser,
  Calendar,
  MessageSquare,
  FileText,
  AlertTriangle,
  ExternalLink,
  Code,
  Info,
  Power,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Typography,
  IconButton
} from "@mui/material";
import { fetchWithAuth, clearApiCache } from "../../utils/api";

const AdminDashboard = () => {
  const { user } = useOutletContext();
  const isAdmin = Array.isArray(user?.roles) ? user.roles.includes('admin') : user?.roles === 'admin';
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Detail Dialog State
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Health Check State
  const [healthStatus, setHealthStatus] = useState([]);
  
  // Danger Zone Confirmation State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  // Live Monitoring Dropdown State
  const [isLiveMonitorOpen, setIsLiveMonitorOpen] = useState(true);
  
  // Roles Management State
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [rolesSearchQuery, setRolesSearchQuery] = useState("");
  const [tempRoles, setTempRoles] = useState({});
  
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banAction, setBanAction] = useState(""); 
  const [banFormData, setBanFormData] = useState({
    accountno: "",
    ban_reason: "",
    ban_end_date: "",
    review_notes: ""
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBanFormChange = (e) => {
    setBanFormData({ ...banFormData, [e.target.name]: e.target.value });
  };

  const fetchAuditLogs = async (showNotify = false) => {
    setIsLoading(true);
    setLogs([]);
    try {
      const response = await fetchWithAuth("/admin/audit-log");
      if (!response) return;
      
      const result = await response.json();
      if (response.ok && result.status === 200) {
        // Sort logs by created_at descending (newest first)
        const sortedLogs = [...result.data].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setLogs(sortedLogs);
        if (showNotify) setSnackbar({ open: true, message: "อัปเดตข้อมูลล่าสุดเรียบร้อยแล้ว", severity: "success" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "ไม่สามารถอัปเดตข้อมูลได้", severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersForRoles = async () => {
    setIsRolesLoading(true);
    try {
      const response = await fetchWithAuth("/users/list-all-users");
      if (!response) return;
      const result = await response.json();
      if (response.ok) {
        const usersList = Array.isArray(result) ? result : (result.data || []);
        setAllUsers(usersList);
        
        // Initialize tempRoles
        const initialTempRoles = {};
        usersList.forEach(usr => {
          const hasDev = Array.isArray(usr.roles) 
            ? usr.roles.includes('dev') 
            : usr.roles === 'dev';
          initialTempRoles[usr.accountno] = hasDev ? 'dev' : 'user';
        });
        setTempRoles(initialTempRoles);
      } else {
        setSnackbar({ open: true, message: result.message || "ไม่สามารถดึงรายชื่อผู้ใช้งานได้", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อดึงข้อมูลผู้ใช้ได้", severity: "error" });
    } finally {
      setIsRolesLoading(false);
    }
  };

  const openRolesDialog = () => {
    setRolesDialogOpen(true);
    fetchUsersForRoles();
  };

  const handleToggleTempRole = (accountno) => {
    setTempRoles(prev => ({
      ...prev,
      [accountno]: prev[accountno] === 'dev' ? 'user' : 'dev'
    }));
  };

  const handleSaveChanges = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    // Filter users whose temporary role has changed from their original role
    const changedUsers = allUsers.filter(usr => {
      const originalHasDev = Array.isArray(usr.roles) 
        ? usr.roles.includes('dev') 
        : usr.roles === 'dev';
      const originalRole = originalHasDev ? 'dev' : 'user';
      const newRole = tempRoles[usr.accountno] || 'user';
      return originalRole !== newRole;
    });

    if (changedUsers.length === 0) {
      setSnackbar({ open: true, message: "ไม่มีการเปลี่ยนแปลงบทบาทผู้ใช้งาน", severity: "info" });
      setIsProcessing(false);
      return;
    }

    try {
      // Loop and update all changed users in parallel
      const updatePromises = changedUsers.map(async (usr) => {
        const newRole = tempRoles[usr.accountno];
        try {
          const response = await fetchWithAuth("/admin/update-role", {
            method: "POST",
            body: JSON.stringify({
              accountno: usr.accountno,
              roles: newRole
            })
          });
          if (response && response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          failCount++;
        }
      });

      await Promise.all(updatePromises);

      if (failCount === 0) {
        setSnackbar({ open: true, message: `บันทึกการเปลี่ยนบทบาทสำเร็จ (${successCount} รายการ)`, severity: "success" });
      } else {
        setSnackbar({ 
          open: true, 
          message: `บันทึกสำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ`, 
          severity: failCount === changedUsers.length ? "error" : "warning" 
        });
      }

      // Refresh data
      await fetchUsersForRoles();
      fetchAuditLogs();
      setRolesDialogOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", severity: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const runAdminAction = async (endpoint, method = "POST", successMsg = "ดำเนินการสำเร็จ") => {
    setIsProcessing(true);
    const token = localStorage.getItem("access_token");
    const payload = banAction === 'ban' ? {
      accountno: banFormData.accountno,
      ban_reason: banFormData.ban_reason,
      ban_end_date: banFormData.ban_end_date,
      review_notes: banFormData.review_notes
    } : { accountno: banFormData.accountno };

    try {
      const response = await fetchWithAuth(endpoint, {
        method,
        body: JSON.stringify(payload)
      });
      if (!response) return;
      const result = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: successMsg, severity: "success" });
        clearApiCache(); // ล้าง Cache ทันทีที่มีการเปลี่ยนแปลงข้อมูลสำคัญ
        
        // ถ้าเป็นการ Clean Sessions ให้เด้งออกทันที
        if (endpoint.includes("clean-sessions")) {
          setTimeout(() => {
            localStorage.clear();
            window.location.href = "/login";
          }, 1500);
          return;
        }

        fetchAuditLogs();
        setBanDialogOpen(false);
        setBanFormData({ accountno: "", ban_reason: "", ban_end_date: "", review_notes: "" });
      } else {
        setSnackbar({ open: true, message: result.message || "เกิดข้อผิดพลาดในการดำเนินการ", severity: "error" });
      }
      setSnackbar({ open: true, message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", severity: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // ฟังก์ชันสำหรับเปิดหน้าต่างยืนยันก่อนทำ Action อันตราย
  const confirmAction = (endpoint, method, successMsg, title, description) => {
    setPendingAction({ endpoint, method, successMsg, title, description });
    setConfirmDialogOpen(true);
  };

  const handleConfirmExecute = () => {
    if (pendingAction) {
      runAdminAction(pendingAction.endpoint, pendingAction.method, pendingAction.successMsg);
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const fetchHealthCheck = async () => {
    try {
      const response = await fetchWithAuth("/admin/health-check");
      if (response && response.ok) {
        const result = await response.json();
        setHealthStatus(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch health check", err);
    }
  };

  const handleSyncEndpoints = async () => {
    setIsProcessing(true);
    try {
      const response = await fetchWithAuth("/admin/sync-endpoints", { method: "POST" });
      if (response && response.ok) {
        const result = await response.json();
        setSnackbar({ 
          open: true, 
          message: `ซิงค์สำเร็จ! พบ API ใหม่ ${result.data.created} เส้น (ข้าม ${result.data.skipped} เส้น)`, 
          severity: "success" 
        });
        fetchHealthCheck();
      }
    } catch (err) {
      setSnackbar({ open: true, message: "การซิงค์ API ล้มเหลว", severity: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleEndpoint = async (path, currentStatus) => {
    const newStatus = currentStatus === 503 ? true : false;
    try {
      const response = await fetchWithAuth("/admin/toggle-endpoint", {
        method: "POST",
        body: JSON.stringify({ path, status: newStatus })
      });
      if (response && response.ok) {
        setSnackbar({ open: true, message: `อัปเดตสถานะเส้นทาง ${path} สำเร็จ`, severity: "success" });
        fetchHealthCheck(); // อัปเดต UI ทันที
      }
    } catch (err) {
      setSnackbar({ open: true, message: "ไม่สามารถเปลี่ยนสถานะ Endpoint ได้", severity: "error" });
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchHealthCheck();
    
    // ตั้งเวลา Refresh Health Check ทุก 30 วินาที
    const interval = setInterval(fetchHealthCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const adminStats = [
    { label: "Total Users", value: "256", icon: Users, color: "text-emerald-600" },
    { label: "Active Sessions", value: logs.filter(l => l.is_active).length || "0", icon: Activity, color: "text-emerald-600" },
    { label: "System Load", value: "32%", icon: Server, color: "text-emerald-600" },
    { label: "Total Logs", value: logs.length, icon: Terminal, color: "text-emerald-600" },
  ];

  const filteredUsers = allUsers.filter(usr => {
    const query = rolesSearchQuery.toLowerCase();
    const fullName = (usr.full_name || "").toLowerCase();
    const username = (usr.username || "").toLowerCase();
    const email = (usr.email || "").toLowerCase();
    const accountno = (usr.accountno || "").toLowerCase();
    return fullName.includes(query) || username.includes(query) || email.includes(query) || accountno.includes(query);
  });

  return (
    <div className="p-6 md:p-10 space-y-10 font-['Sarabun'] bg-[#f0f4f0] min-h-screen">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Administration</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            {isAdmin ? 'ADMIN' : 'DEV'} CONSOLE
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">จัดการระบบและสิทธิ์ผู้ใช้งานระดับสูง</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาผู้ใช้ หรือ Log..." 
              className="pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-none text-sm outline-none focus:border-emerald-500 w-full md:w-64"
            />
          </div>
          <button className="bg-emerald-600 text-white px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors rounded-none">
            Settings
          </button>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, i) => (
          <div key={i} className="bg-white border-2 border-slate-200 p-6 flex items-center gap-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Audit Logs Table */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              รายการบันทึกระบบ (Audit Logs)
            </h2>
            <button 
              onClick={() => fetchAuditLogs(true)} 
              className="bg-white border-2 border-slate-200 p-2 hover:border-emerald-500 text-slate-400 hover:text-emerald-600 transition-all flex items-center justify-center group"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <TableContainer 
            component={Paper} 
            elevation={0} 
            sx={{ borderRadius: 0, border: '2px solid #e2e8f0', boxShadow: 'none', bgcolor: 'white' }}
          >
            <Table stickyHeader sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>USER / OPERATOR</TableCell>
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>IP ADDRESS</TableCell>
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>CREATED AT</TableCell>
                  <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">กำลังดึงข้อมูล...</span>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                      <span className="text-sm font-medium text-slate-400">ไม่พบรายการบันทึกในระบบ</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow 
                      key={log.record_id} 
                      hover 
                      sx={{ '&:hover': { bgcolor: '#f0f4f0 !important' }, cursor: 'pointer' }}
                      onClick={() => { setSelectedLog(log); setDetailDialogOpen(true); }}
                    >
                      <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 flex items-center justify-center text-slate-500"><UserIcon className="w-4 h-4" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 leading-none">{log.user_detail?.full_name || log.decoded_sessions?.username || 'Unknown'}</p>
                            <p className="text-[11px] text-emerald-600 font-bold mt-1">@{log.decoded_sessions?.username || 'Guest'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                        <div className="flex items-center gap-2 text-slate-400"><Globe className="w-3.5 h-3.5" /><span className="text-xs font-mono">{log.ip_address}</span></div>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                        <div className="flex items-center gap-2 text-slate-500"><Clock className="w-3.5 h-3.5 text-slate-300" /><span className="text-xs font-bold">{log.created_at}</span></div>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                        <div className="flex items-center justify-between">
                          {log.is_active ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>Active</span>
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Expired</span>
                          )}
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-emerald-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Right Side: Admin Tools & Monitoring */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border-2 border-slate-200 p-8 space-y-6">
            <div className="flex items-center gap-2 text-slate-900">
              <Settings className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold uppercase tracking-widest text-sm">User Management</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <button 
                  onClick={() => { setBanAction("ban"); setBanDialogOpen(true); }}
                  className="group flex flex-col items-center gap-3 p-4 md:p-5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-500 transition-all text-center"
                >
                  <Lock className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-900 uppercase tracking-widest">Ban User</span>
                </button>
                <button 
                  onClick={() => { setBanAction("unban"); setBanDialogOpen(true); }}
                  className="group flex flex-col items-center gap-3 p-4 md:p-5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 transition-all text-center"
                >
                  <Unlock className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-900 uppercase tracking-widest">Unban User</span>
                </button>
                <button 
                  onClick={openRolesDialog}
                  className="group flex flex-col items-center gap-3 p-4 md:p-5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 transition-all text-center"
                >
                  <Users className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-900 uppercase tracking-widest">User Roles</span>
                </button>
              </div>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="bg-white border-2 border-red-200 p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-tighter transform rotate-45 translate-x-3 translate-y-[-2px] px-6">
               Danger Zone
            </div>
            
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-widest text-sm">Danger Zone</h2>
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
              * คำเตือน: การกระทำในส่วนนี้จะส่งผลกระทบต่อระบบในวงกว้าง กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleSyncEndpoints}
                className="group flex items-center gap-4 p-5 bg-white hover:bg-emerald-50 border-2 border-emerald-600 transition-all text-left"
              >
                <div className="p-3 bg-emerald-600 text-white group-hover:bg-emerald-700 transition-colors"><RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 uppercase tracking-widest">Sync API Endpoints</h4>
                  <p className="text-[10px] text-slate-400 font-medium">สแกนโค้ดและดึงรายการ API เข้าสู่ฐานข้อมูล</p>
                </div>
              </button>

              <button 
                onClick={() => confirmAction(
                  "/admin/clean-sessions", 
                  "DELETE", 
                  "ล้างเซสชันเก่าสำเร็จ",
                  "ยืนยันการล้าง Sessions ทั้งหมด?",
                  "การกระทำนี้จะทำให้ผู้ใช้ทุกคนในระบบถูกบังคับให้ Logout ทันที คุณแน่ใจหรือไม่?"
                )}
                className="group flex items-center gap-4 p-5 bg-red-50/30 hover:bg-red-50 border border-red-100 hover:border-red-500 transition-all text-left"
              >
                <div className="p-3 bg-white border border-red-50 text-red-400 group-hover:text-red-600 transition-colors"><Eraser className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 uppercase tracking-widest">Clean All Sessions</h4>
                  <p className="text-[10px] text-slate-400 font-medium">บังคับ Logout ทุกคนออกจากระบบ</p>
                </div>
              </button>

              <button 
                onClick={() => confirmAction(
                  "/admin/delete-all-users", 
                  "DELETE", 
                  "ล้างข้อมูลผู้ใช้ทั้งหมดสำเร็จ",
                  "ลบข้อมูลผู้ใช้ทั้งหมด?",
                  "คำเตือนระดับสูง: ข้อมูลผู้ใช้ทั้งหมดจะถูกลบทิ้งอย่างถาวรและไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อหรือไม่?"
                )}
                className="group flex items-center gap-4 p-5 bg-red-600 hover:bg-red-700 border border-red-600 transition-all text-left"
              >
                <div className="p-3 bg-white border border-red-50 text-red-600 group-hover:bg-red-50 transition-all"><Trash2 className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">Wipe All User Data</h4>
                  <p className="text-[10px] text-red-100 font-medium tracking-tight">ลบข้อมูลผู้ใช้งานทั้งหมดในระบบ</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white border-b-8 border-emerald-600 overflow-hidden">
             <button 
               onClick={() => setIsLiveMonitorOpen(!isLiveMonitorOpen)}
               className="w-full flex items-center justify-between p-8 text-left hover:bg-slate-800/50 transition-colors duration-200 outline-none focus:outline-none"
             >
                <div className="flex items-center gap-2 text-emerald-400">
                   <Activity className="w-4 h-4" />
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Monitoring</h4>
                </div>
                {isLiveMonitorOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
             </button>
             
             {isLiveMonitorOpen && (
               <div className="px-8 pb-8 space-y-4 animate-fadeIn">
                  {healthStatus.length === 0 ? (
                    <div className="text-[11px] text-slate-500 uppercase tracking-widest italic">
                      กำลังตรวจสอบสถานะระบบ...
                    </div>
                  ) : (
                    healthStatus.map((svc, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] uppercase tracking-widest border-b border-slate-800 pb-2 last:border-0">
                         <div className="flex flex-col">
                           <span className="text-slate-500 text-[9px]">{svc.name}</span>
                           <span className={`${svc.status === 200 ? 'text-emerald-400' : svc.status === 503 ? 'text-amber-500' : 'text-red-400'} font-bold flex items-center gap-2 mt-0.5`}>
                             {svc.status === 200 && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                             {svc.message}
                           </span>
                         </div>
                         <button 
                           onClick={() => handleToggleEndpoint(svc.path, svc.status)}
                           className={`p-1.5 border transition-all ${svc.status === 503 ? 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white' : 'border-slate-700 text-slate-500 hover:border-red-500 hover:text-red-500'}`}
                           title={svc.status === 503 ? "เปิดใช้งาน" : "ปิดใช้งาน (Maintenance)"}
                         >
                           <Power className="w-3 h-3" />
                         </button>
                      </div>
                    ))
                  )}
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Log Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: '4px solid #e2e8f0', boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ p: 4, bgcolor: '#f8fafc', borderBottom: '2px solid #f1f5f9', display: 'flex', itemsCenter: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">L</div>
             <div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest leading-none">Audit Log Detail</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Record ID: {selectedLog?.record_id}</p>
             </div>
          </div>
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: '#94a3b8' }}><Trash2 className="w-5 h-5" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Operator Info */}
            <Grid item xs={12} md={6}>
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    <UserIcon className="w-3 h-3 text-emerald-600" /> Operator Info
                  </h4>
                  <div className="bg-slate-50 p-6 border-l-4 border-emerald-500 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Full Name</p>
                      <p className="text-sm font-bold text-slate-800">{selectedLog?.user_detail?.full_name || 'System Generated'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Username</p>
                      <p className="text-sm font-bold text-emerald-600">@{selectedLog?.decoded_sessions?.username || 'guest_user'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Account Number</p>
                      <p className="text-sm font-mono text-slate-700 font-bold">{selectedLog?.decoded_sessions?.accountno || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    <Globe className="w-3 h-3 text-emerald-600" /> Technical Context
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-slate-100 p-4">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">IP Address</p>
                       <p className="text-xs font-mono font-bold text-slate-800">{selectedLog?.ip_address}</p>
                    </div>
                    <div className="bg-white border-2 border-slate-100 p-4">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Session ID</p>
                       <p className="text-xs font-mono font-bold text-slate-800">{selectedLog?.session_id}</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-slate-900 p-4">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">User Agent</p>
                    <p className="text-[10px] text-slate-300 font-mono leading-relaxed line-clamp-2">{selectedLog?.user_agent}</p>
                  </div>
                </div>
              </div>
            </Grid>

            {/* Session Payload */}
            <Grid item xs={12} md={6}>
               <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                 <Code className="w-3 h-3 text-emerald-600" /> Decoded Payload
               </h4>
               <div className="bg-slate-900 p-6 border border-slate-800 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Info className="w-4 h-4 text-emerald-400" />
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(selectedLog?.decoded_sessions, null, 2)}
                  </pre>
               </div>

               <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created At</span>
                    <span className="text-xs font-bold text-slate-800">{selectedLog?.created_at}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expires At</span>
                    <span className="text-xs font-bold text-red-500">{selectedLog?.expires_at}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLog?.is_active ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {selectedLog?.is_active ? 'Active' : 'Expired'}
                    </span>
                  </div>
               </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '2px solid #f1f5f9', bgcolor: '#f8fafc' }}>
          <button 
            onClick={() => setDetailDialogOpen(false)}
            className="px-8 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            Close Detail
          </button>
        </DialogActions>
      </Dialog>

      {/* Danger Zone Confirmation Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: '4px solid #ef4444', boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ p: 3, bgcolor: '#fef2f2', borderBottom: '2px solid #fee2e2' }}>
           <div className="flex items-center gap-2 text-red-600">
             <AlertTriangle className="w-5 h-5" />
             <h3 className="text-sm font-bold uppercase tracking-widest">{pendingAction?.title}</h3>
           </div>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
           <p className="text-sm text-slate-600 font-medium leading-relaxed">
             {pendingAction?.description}
           </p>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <button 
            onClick={() => setConfirmDialogOpen(false)}
            className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleConfirmExecute}
            className="px-8 py-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
          >
            ยืนยันดำเนินการ
          </button>
        </DialogActions>
      </Dialog>

      {/* Ban/Unban Dialog */}
      <Dialog 
        open={banDialogOpen} 
        onClose={() => setBanDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: '4px solid #e2e8f0', boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', borderBottom: '1px solid #f1f5f9' }}>
          {banAction === 'ban' ? 'ระงับการใช้งานผู้ใช้ (Ban User)' : 'ยกเลิกการระงับการใช้งาน (Unban User)'}
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                <UserIcon className="w-3.5 h-3.5" />
                <label className="text-[10px] font-bold uppercase tracking-widest">เลขที่บัญชี / ID</label>
              </div>
              <TextField fullWidth name="accountno" size="small" placeholder="Account Number" value={banFormData.accountno} onChange={handleBanFormChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '13px' }, '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #e2e8f0' } }} />
            </Grid>
            {banAction === 'ban' && (
              <>
                <Grid item xs={12} md={6}>
                  <div className="flex items-center gap-2 mb-1.5 text-slate-400"><AlertTriangle className="w-3.5 h-3.5" /><label className="text-[10px] font-bold uppercase tracking-widest">เหตุผลในการระงับ</label></div>
                  <TextField fullWidth name="ban_reason" size="small" placeholder="Reason" value={banFormData.ban_reason} onChange={handleBanFormChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '13px' }, '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #e2e8f0' } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="flex items-center gap-2 mb-1.5 text-slate-400"><Calendar className="w-3.5 h-3.5" /><label className="text-[10px] font-bold uppercase tracking-widest">สิ้นสุดวันที่</label></div>
                  <TextField fullWidth name="ban_end_date" type="date" size="small" value={banFormData.ban_end_date} onChange={handleBanFormChange} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '13px' }, '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #e2e8f0' } }} />
                </Grid>
                <Grid item xs={12}>
                  <div className="flex items-center gap-2 mb-1.5 text-slate-400"><MessageSquare className="w-3.5 h-3.5" /><label className="text-[10px] font-bold uppercase tracking-widest">บันทึกเพิ่มเติม (Review Notes)</label></div>
                  <TextField fullWidth name="review_notes" multiline rows={3} placeholder="Notes for review..." value={banFormData.review_notes} onChange={handleBanFormChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0, fontSize: '13px' }, '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #e2e8f0' } }} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9', gap: 1 }}>
          <button onClick={() => setBanDialogOpen(false)} className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">ยกเลิก</button>
          <button onClick={() => runAdminAction(banAction === 'ban' ? "/admin/ban-user" : "/admin/unban-user", "POST", banAction === 'ban' ? "ระงับการใช้งานสำเร็จ" : "ยกเลิกการระงับสำเร็จ")} className={`px-8 py-3 text-[10px] font-bold text-white uppercase tracking-widest transition-all ${banAction === 'ban' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{isProcessing ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'ยืนยันดำเนินการ'}</button>
        </DialogActions>
      </Dialog>

      {/* Roles Management Dialog */}
      <Dialog 
        open={rolesDialogOpen} 
        onClose={() => setRolesDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: '4px solid #e2e8f0', boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ p: 4, bgcolor: '#f8fafc', borderBottom: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center font-bold text-lg">R</div>
             <div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest leading-none">Manage User Roles</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">กำหนดสิทธิ์และบทบาทผู้ใช้งานในระบบ (DEV)</p>
             </div>
          </div>
          <button 
            onClick={() => setRolesDialogOpen(false)} 
            className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none text-xl"
          >
            ✕
          </button>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {isRolesLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">กำลังดึงข้อมูลผู้ใช้ทั้งหมด...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search bar inside dialog */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหาผู้ใช้ด้วยชื่อ, อีเมล หรือเลขบัญชี..." 
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-none text-sm outline-none focus:border-blue-500 w-full"
                  value={rolesSearchQuery}
                  onChange={(e) => setRolesSearchQuery(e.target.value)}
                />
              </div>

              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ borderRadius: 0, border: '2px solid #e2e8f0', boxShadow: 'none', bgcolor: 'white', maxHeight: '400px' }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>USER / EMAIL</TableCell>
                      <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>ACCOUNT NO</TableCell>
                      <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>CURRENT ROLES</TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#f8fafc', fontWeight: 'bold', fontSize: '10px', color: '#94a3b8', borderBottom: '2px solid #f1f5f9', letterSpacing: '0.1em' }}>DEV PRIVILEGE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <span className="text-sm font-medium text-slate-400">ไม่พบข้อมูลผู้ใช้งาน</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((usr) => {
                        const isDev = tempRoles[usr.accountno] === 'dev';
                        return (
                          <TableRow key={usr.accountno || usr.email} hover sx={{ '&:hover': { bgcolor: '#f8fafc !important' } }}>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{usr.full_name || usr.username || 'N/A'}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{usr.email || 'No email'}</p>
                              </div>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <span className="text-xs font-mono font-bold text-slate-600">{usr.accountno || 'N/A'}</span>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <div className="flex flex-wrap gap-1">
                                {isDev ? (
                                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                                    dev
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                    user
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell align="center" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                              <input 
                                type="checkbox"
                                checked={isDev}
                                onChange={() => handleToggleTempRole(usr.accountno)}
                                className="w-4 h-4 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '2px solid #f1f5f9', bgcolor: '#f8fafc', gap: 2 }}>
          <button 
            onClick={() => setRolesDialogOpen(false)}
            className="px-6 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors bg-transparent border-none outline-none"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveChanges}
            disabled={isProcessing}
            className="px-8 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-75"
          >
            {isProcessing ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 0, fontWeight: 'bold' }}>{snackbar.message}</Alert>
      </Snackbar>

      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
