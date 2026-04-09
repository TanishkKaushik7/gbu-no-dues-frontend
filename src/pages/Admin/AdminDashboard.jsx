import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Settings, Menu, Loader2, User, 
  LogOut, ArrowRight, GraduationCap, Activity, Server 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminNavigation } from '../../utils/navigation';
import { useNavigate } from 'react-router-dom';

// Widgets & Pages
import DashboardStats from './DashboardStats';
import PerformanceChart from './PerformanceChart';
import RecentLogsWidget from './RecentLogsWidget';
import QuickActions from './QuickActions';
import UserManagement from './UserManagement';
import MetricsManagement from './MetricsManagement';
import SchoolDeptManagement from './SchoolDeptManagement';
import Reports from './Reports';
import ApplicationManagement from './ApplicationManagement';
import AcademicManagement from './AcademicManagement';

// Logs
import ApplicationLogs from './ApplicationLogs'; 
import SystemLogs from './SystemLogs';         

// Modals
import RegisterUserModal from './RegisterUserModal';
import ProfileModal from './ProfileModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import ApplicationInspectionModal from './AdminApplicationModals';

const AdminDashboard = () => {
  const { user, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // --- SIDEBAR LOGIC ---
  const baseNav = getAdminNavigation(user?.role) || [];
  
  let sidebarItems = baseNav.map(item => 
    item.id === 'audit' 
      ? { ...item, id: 'application_logs', label: 'Application Logs' } 
      : item
  );

  if (!sidebarItems.find(item => item.id === 'academics')) {
    const userIndex = sidebarItems.findIndex(item => item.id === 'users');
    const academicItem = { id: 'academics', label: 'Academic Management', icon: GraduationCap };
    if (userIndex !== -1) sidebarItems.splice(userIndex + 1, 0, academicItem);
    else sidebarItems.push(academicItem);
  }

  if (!sidebarItems.find(item => item.id === 'system_logs')) {
    const sysLogsItem = { id: 'system_logs', label: 'System Logs', icon: Server };
    const appLogsIndex = sidebarItems.findIndex(item => item.id === 'application_logs');
    if (appLogsIndex !== -1) sidebarItems.splice(appLogsIndex + 1, 0, sysLogsItem);
    else sidebarItems.push(sysLogsItem);
  }

  if (!sidebarItems.find(item => item.id === 'metrics')) {
    const metricsItem = { id: 'metrics', label: 'System Metrics', icon: Activity };
    const reportsIndex = sidebarItems.findIndex(item => item.id === 'reports');
    if (reportsIndex !== -1) sidebarItems.splice(reportsIndex + 1, 0, metricsItem);
    else sidebarItems.push(metricsItem);
  }

  // Search & UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], applications: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Management
  const [modalOpen, setModalOpen] = useState({ 
    register: false, profile: false, logout: false, inspection: false 
  });
  const [selectedInspectId, setSelectedInspectId] = useState(null);
  const [selectedRollNo, setSelectedRollNo] = useState(null);

  const searchRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (user && !['admin', 'super_admin', 'dean', 'hod', 'registrar'].includes(user.role)) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        try {
          const res = await authFetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data || { students: [], applications: [] });
            setShowSearchResults(true);
          }
        } catch (error) { console.error("Search failed:", error); } 
        finally { setIsSearching(false); }
      } else { setShowSearchResults(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, authFetch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchResults(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setIsSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectApplication = async (item) => {
    if (item.status) {
      setSelectedInspectId(item.id);
      setSelectedRollNo(item.roll_number || item.student_roll);
      setModalOpen(prev => ({ ...prev, inspection: true }));
      setShowSearchResults(false);
      setSearchQuery('');
      return;
    }
    setIsSearching(true);
    try {
      const q = item.roll_number || item.rollNo;
      const res = await authFetch(`/api/applications/status?search_query=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          setSelectedInspectId(data.application.id);
          setSelectedRollNo(q);
          setModalOpen(prev => ({ ...prev, inspection: true }));
        } else { alert("No active No-Dues application found."); }
      }
    } catch (err) { console.error(err); } 
    finally { setIsSearching(false); setShowSearchResults(false); setSearchQuery(''); }
  };

  const handleModalAction = async (appObj, action, remark) => {
    setActionLoading(true);
    try {
      const appId = appObj.id || appObj.application_id;
      const res = await authFetch(`/api/approvals/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, remark })
      });
      if (res.ok) {
        setModalOpen(p => ({ ...p, inspection: false }));
        setSelectedInspectId(null);
        return null; 
      }
    } catch (err) { alert("Network error."); } 
    finally { setActionLoading(false); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight ">Management Overview</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Welcome back, <span className="text-blue-600 font-bold">{user?.name}</span></p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">System Status</p>
                    <p className="text-[10px] font-bold text-green-500  flex items-center justify-end gap-1">
                       <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Operational
                    </p>
                 </div>
              </div>
            </div>

            <DashboardStats />

            <div className="grid gap-6 lg:grid-cols-7">
              {/* Quick Actions now occupies the main top grid area */}
              <div className="lg:col-span-4">
                <QuickActions 
                  onRegisterUser={() => setModalOpen({ ...modalOpen, register: true })} 
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              </div>
              <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <RecentLogsWidget onNavigate={() => setActiveTab('application_logs')} />
              </div>
            </div>

           {/* Full width graph with horizontal scroll logic */}
            <div className="w-full bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-800  tracking-tight">Performance Analytics</h3>
                <p className="text-[10px] font-bold text-slate-400  tracking-widest">Live traffic & processing trends</p>
              </div>
              
              {/* Added h-[450px] here to prevent the chart from collapsing */}
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <div className="min-w-[1000px] h-[450px]"> 
                  <PerformanceChart />
                </div>
              </div>
            </div>
          </div>
        );
      case 'applications': return <ApplicationManagement />;
      case 'users': return <UserManagement />;
      case 'academics': return <AcademicManagement />;
      case 'schools': return <SchoolDeptManagement />;
      case 'application_logs': return <ApplicationLogs />;
      case 'system_logs': return <SystemLogs />; 
      case 'reports': return <Reports />;
      case 'metrics': return <MetricsManagement />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden h-screen">
      <header className="h-16 sm:h-20 bg-[#1e40af] text-white flex items-center justify-between px-4 sm:px-8 shadow-xl z-30 sticky top-0 shrink-0 border-b border-blue-800/50">
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="md:hidden p-2 hover:bg-blue-700 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-black tracking-tight cursor-default select-none">GBU No Dues</h1>
            <span className="text-[8px] sm:text-[9px] font-black text-blue-300  tracking-[0.3em]">Management Console</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:block relative" ref={searchRef}>
          <div className="relative group">
            {isSearching ? <Loader2 className="absolute left-4 top-2.5 h-5 w-5 text-blue-400 animate-spin z-10" /> 
            : <Search className="absolute left-4 top-2.5 h-5 w-5 text-blue-200 group-focus-within:text-blue-600 z-10 transition-colors" />}
            <input
              type="search"
              placeholder="Search Student Name, Roll No, or ND-ID..."
              className="w-full bg-white/10 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder-blue-200 focus:placeholder-slate-400 pl-12 h-10 rounded-2xl border border-white/10 focus:ring-8 focus:ring-blue-400/10 outline-none text-sm shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
            />
          </div>
          <AnimatePresence>
            {showSearchResults && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-14 left-0 right-0 bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] overflow-hidden z-[100] p-4">
                <div className="max-h-[400px] overflow-y-auto space-y-1 custom-scrollbar">
                  {/* Restored Mapping Logic */}
                  {searchResults?.students?.length === 0 && searchResults?.applications?.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm font-medium">No results found for "{searchQuery}"</div>
                  ) : (
                    <>
                      {searchResults?.students?.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[10px] font-black text-slate-400  tracking-widest px-3 py-1 bg-slate-50 rounded-lg mb-1">Students</div>
                          {searchResults.students.map((student, idx) => (
                            <button 
                              key={`std-${idx}`} 
                              onClick={() => handleSelectApplication(student)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex flex-col group"
                            >
                              <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{student.name || student.student_name}</span>
                              <span className="text-xs text-slate-500 font-mono">{student.roll_number || student.rollNo}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults?.applications?.length > 0 && (
                        <div>
                          <div className="text-[10px] font-black text-slate-400  tracking-widest px-3 py-1 bg-slate-50 rounded-lg mb-1">Applications</div>
                          {searchResults.applications.map((app, idx) => (
                            <button 
                              key={`app-${idx}`} 
                              onClick={() => handleSelectApplication(app)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-between group"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{app.display_id || app.id}</span>
                                <span className="text-xs text-slate-500 font-mono">{app.roll_number || app.student_roll}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-1 rounded-md  tracking-wider ${app.status === 'cleared' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {app.status || 'Active'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-90">
              <Settings className={`h-5 w-5 ${isSettingsOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
            </button>
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-4 w-64 bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 p-3">
                  <div className="px-4 py-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[9px] font-black text-blue-600  mt-1">{user?.role}</p>
                  </div>
                  <button onClick={() => { setModalOpen({...modalOpen, profile: true}); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-bold text-[10px]  tracking-widest">
                    <User size={16} className="text-blue-500" /> Admin Profile
                  </button>
                  <button onClick={() => { setModalOpen({...modalOpen, logout: true}); setIsSettingsOpen(false); }} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-[10px] tracking-widest">
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-white text-blue-700 flex items-center justify-center font-black text-xs shadow-lg uppercase border-2 border-blue-400/20">{user?.name?.substring(0, 2)}</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 overflow-hidden'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center h-11 px-4 rounded-2xl text-[10px] uppercase tracking-[0.15em] font-black transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}>
                <item.icon className={`mr-4 h-4 w-4 ${activeTab === item.id ? 'text-white' : 'text-slate-300 group-hover:text-blue-500'} transition-transform group-hover:scale-110`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button onClick={() => setModalOpen({ ...modalOpen, logout: true })} className="w-full flex items-center h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-red-500 bg-red-50 hover:bg-red-100 transition-all group border border-red-100">
              <LogOut className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Terminate Session</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Modals remain the same */}
      <RegisterUserModal isOpen={modalOpen.register} onClose={() => setModalOpen(p => ({ ...p, register: false }))} />
      <ProfileModal isOpen={modalOpen.profile} onClose={() => setModalOpen(p => ({ ...p, profile: false }))} />
      <LogoutConfirmModal isOpen={modalOpen.logout} onClose={() => setModalOpen(p => ({ ...p, logout: false }))} />
      <ApplicationInspectionModal
        isOpen={modalOpen.inspection}
        onClose={() => { setModalOpen(p => ({ ...p, inspection: false })); setSelectedInspectId(null); }}
        applicationId={selectedInspectId}
        rollNumber={selectedRollNo}
        onAction={handleModalAction}
      />
    </div>
  );
};

export default AdminDashboard;