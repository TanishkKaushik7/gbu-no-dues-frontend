import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, RefreshCw, Loader2, MapPin, 
  Settings2, Filter, ChevronLeft, ChevronRight,
  Check, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ApplicationDetailModal from './ApplicationsDetailModal';

// --- SHADCN TABLE IMPORTS ---
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- CUSTOM SHADCN-LIKE FILTER DROPDOWN ---
const FilterDropdown = ({ value, onChange, options, icon: Icon, theme = "slate", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.v === value);

  // Theme configuration map
  const themes = {
    slate: {
      bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700",
      icon: "text-slate-400", hover: "hover:bg-slate-100", activeBg: "bg-slate-100",
      check: "text-slate-600", focusRing: "ring-slate-500/10"
    },
    blue: {
      bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700",
      icon: "text-blue-500", hover: "hover:bg-blue-100", activeBg: "bg-blue-100",
      check: "text-blue-600", focusRing: "ring-blue-500/20"
    }
  };
  const t = themes[theme];

  return (
    <div className={cn("relative flex-1 md:flex-none", className)} ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl border cursor-pointer transition-all select-none h-[50px]",
          t.bg, t.border, t.hover,
          isOpen ? `ring-4 ${t.focusRing}` : ""
        )}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className={t.icon} />}
          <span className={cn("text-[10px] font-black tracking-widest uppercase truncate", t.text)}>
            {selectedOption ? selectedOption.l : "Select..."}
          </span>
        </div>
        <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0", t.icon, isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full min-w-[180px] overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl custom-scrollbar"
          >
            {options.map((opt) => (
              <div
                key={opt.v}
                onClick={() => { onChange(opt.v); setIsOpen(false); }}
                className={cn(
                  "relative flex items-center justify-between cursor-pointer py-3 px-4 text-[10px] font-black uppercase tracking-widest transition-colors",
                  value === opt.v ? t.activeBg + " " + t.text : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <span className="truncate">{opt.l}</span>
                {value === opt.v && <Check size={14} className={cn("shrink-0 ml-2", t.check)} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ApplicationManagement = () => {
  const { authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await authFetch('/api/approvals/all'); 
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setApplications(data);
        } else if (data && Array.isArray(data.data)) {
          setApplications(data.data);
        } else {
          setApplications([]); 
        }
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Fetch error:");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [authFetch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, stageFilter]);

  const filteredApps = useMemo(() => {
    return (applications || []).filter(app => {
      if (!app) return false;

      const matchesSearch = 
        (app.display_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (app.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.roll_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      let matchesStage = true;
      if (stageFilter !== 'all') {
          const seq = app.active_stage?.sequence_order;
          if (stageFilter === 'dean') matchesStage = seq === 1;
          else if (stageFilter === 'hod') matchesStage = seq === 2;
          else if (stageFilter === 'office') matchesStage = seq === 3;
          else if (stageFilter === 'admin') matchesStage = seq === 4;
          else if (stageFilter === 'accounts') matchesStage = seq === 5;
      }

      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [applications, searchTerm, statusFilter, stageFilter]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- UPDATED SKELETON USING SHADCN COMPONENTS ---
  const SkeletonRow = () => (
    <TableRow className="animate-pulse hover:bg-transparent">
      <TableCell className="px-8 py-7">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-7"><div className="h-4 w-24 bg-slate-100 rounded" /></TableCell>
      <TableCell className="px-6 py-7"><div className="h-6 w-20 bg-slate-100 rounded-xl" /></TableCell>
      <TableCell className="px-8 py-7 text-right"><div className="h-10 w-24 bg-slate-200 rounded-2xl ml-auto" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Application Control</h1>
          <p className="text-slate-500 text-sm mt-1">Admin override panel for system-wide clearance states.</p>
        </div>
        <button 
          onClick={() => fetchApplications()} 
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group active:scale-95 w-fit"
        >
          <RefreshCw className={`h-5 w-5 text-slate-500 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search student identity..." 
            className="w-full pl-12 pr-6 py-3.5 h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <FilterDropdown 
              icon={Filter}
              theme="slate"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { v: 'all', l: 'All Statuses' },
                { v: 'pending', l: 'Pending' },
                { v: 'in_progress', l: 'In Progress' },
                { v: 'completed', l: 'Completed' },
                { v: 'rejected', l: 'Rejected' }
              ]}
            />

            <FilterDropdown 
              icon={Settings2}
              theme="blue"
              value={stageFilter}
              onChange={setStageFilter}
              options={[
                { v: 'all', l: 'All Stages' },
                { v: 'dean', l: 'Pending: Dean' },
                { v: 'hod', l: 'Pending: HOD' },
                { v: 'office', l: 'Pending: Office' },
                { v: 'admin', l: 'Pending: Department' },
                { v: 'accounts', l: 'Pending: Accounts' }
              ]}
            />
        </div>
      </div>

      {/* --- SHADCN TABLE INTEGRATION --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="px-8 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Identity</TableHead>
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Current Progress</TableHead>
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Global Status</TableHead>
                <TableHead className="px-8 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-right">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm font-medium">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : paginatedApps.length > 0 ? (
                paginatedApps.map((app) => (
                  <TableRow 
                    key={app.application_id} 
                    className="group hover:bg-blue-50/30 transition-colors border-slate-100/60"
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-lg group-hover:bg-blue-600 transition-all duration-300">
                          {app.student_name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 tracking-tight text-base">{app.student_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold tracking-widest">{app.roll_number}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                        <MapPin size={14} className="text-blue-500 shrink-0" />
                        <span className="truncate max-w-[200px]" title={app.current_location}>{app.current_location}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest border shadow-sm ${
                        app.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {(app.status || 'unknown').replace('_', ' ')}
                      </span>
                    </TableCell>
                    
                    <TableCell className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                      >
                        <Settings2 size={14} /> Manage
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="px-10 py-24 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Search className="h-8 w-8 text-slate-200" />
                      <p>No matching applications found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {!loading && filteredApps.length > 0 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-[10px] font-black tracking-widest text-slate-400">
              Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredApps.length)}</span> of <span className="text-slate-900">{filteredApps.length}</span> Applications
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                    if (totalPages > 5 && i + 1 !== 1 && i + 1 !== totalPages && Math.abs(currentPage - (i + 1)) > 1) {
                        if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="px-1 text-slate-300">...</span>;
                        return null;
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`h-9 w-9 rounded-xl text-[10px] font-black transition-all ${
                                currentPage === i + 1 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-400'
                            }`}
                        >
                            {i + 1}
                        </button>
                    )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedApp && (
        <ApplicationDetailModal 
          isOpen={!!selectedApp} 
          onClose={() => {
            setSelectedApp(null);
            fetchApplications(true); 
          }} 
          application={selectedApp}
        />
      )}

      {/* Global Scrollbar Customization for Dropdowns */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ApplicationManagement;