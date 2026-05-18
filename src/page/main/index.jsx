import React from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  ArrowUpRight,
  MoreHorizontal,
  Bell,
  Filter,
  ChevronRight
} from "lucide-react";

const MainPage = () => {
  const { user } = useOutletContext();

  const stats = [
    { label: "Total Patients", value: "1,284", icon: Users, color: "bg-blue-600", trend: "+12.5%" },
    { label: "Today's Visits", value: "42", icon: Calendar, color: "bg-indigo-600", trend: "+4 new" },
    { label: "Pending Tests", value: "12", icon: Clock, color: "bg-amber-500", trend: "-2 from yesterday" },
    { label: "Staff on Duty", value: "18", icon: CheckCircle2, color: "bg-emerald-600", trend: "Active" },
  ];

  const recentRequests = [
    { id: 1, patient: "Somchai Jaidee", service: "Annual Checkup", status: "In Progress", time: "09:30 AM", type: "Regular" },
    { id: 2, patient: "Suda Rakthai", service: "Vaccination", status: "Completed", time: "10:15 AM", type: "Urgent" },
    { id: 3, patient: "John Doe", service: "Follow-up", status: "Waiting", time: "11:45 AM", type: "Regular" },
    { id: 4, patient: "Jane Smith", service: "Lab Results", status: "In Progress", time: "02:30 PM", type: "Regular" },
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "In Progress": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Waiting": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-fadeIn">
      {/* Top Navigation & Branding Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Hello, {user?.full_name?.split(' ')[0] || 'Administrator'}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search patients, reports..." 
              className="w-full md:w-72 pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="relative p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="hidden md:flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98]">
            <Plus className="w-5 h-5" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-5">
              <div className={`${stat.color} p-4 rounded-2xl shadow-lg shadow-blue-100`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                stat.trend.includes('+') || stat.trend === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Data & Side Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Recent Activity Table */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-xl tracking-tight">Active Appointments</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Manage your patients and their current status</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-colors">
                  View All
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Patient Details</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Service</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Time</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-lg">
                            {req.patient[0]}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-gray-900">{req.patient}</p>
                            <p className="text-xs text-gray-500 font-medium">ID: CASE-{(2000 + req.id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-semibold text-gray-700">{req.service}</td>
                      <td className="px-8 py-6">
                        <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider ${getStatusStyles(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-900">{req.time}</td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/30 border-t border-gray-50 text-center">
              <button className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 mx-auto">
                Showing 4 of 24 appointments <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Pro Banner */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 text-xl mb-6 tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Register Patient', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Set Schedule', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Upload Data', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Health Check', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
              ].map((action, i) => (
                <button key={i} className={`flex flex-col items-center justify-center p-6 rounded-3xl border border-transparent ${action.bg} hover:border-gray-200 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
                  <div className={`${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {/* Render icon conditionally or via mapping if needed, using placeholders for now */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      {i === 0 && <Users className="w-8 h-8" />}
                      {i === 1 && <Calendar className="w-8 h-8" />}
                      {i === 2 && <Clock className="w-8 h-8" />}
                      {i === 3 && <CheckCircle2 className="w-8 h-8" />}
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-700 text-center uppercase tracking-wider">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 rounded-[32px] shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-4">
              <div className="bg-white/20 w-fit p-3 rounded-2xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-2xl text-white leading-tight">Upgrade to Caly Pro</h3>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">Unlock advanced diagnostic tools, unlimited history, and priority AI analysis.</p>
              <button className="w-full py-4 bg-white text-blue-700 font-black rounded-2xl text-sm shadow-xl hover:bg-blue-50 transition-all active:scale-[0.98]">
                Upgrade Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon proxy for easy mapping
const UserPlus = Users;
const ShieldCheck = CheckCircle2;

export default MainPage;
