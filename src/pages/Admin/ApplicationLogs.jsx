import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, Filter, Calendar, 
  CheckCircle2, XCircle, Loader2, RefreshCcw, Clock,
  ChevronLeft, ChevronRight, ShieldAlert,
  Check, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

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
const FilterDropdown = ({ value, onChange, options, icon: Icon, className }) => {
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

  return (
    <div className={cn("relative flex-1 md:flex-none min-w-[180px]", className)} ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-4 px-4 h-[50px] rounded-2xl border cursor-pointer transition-all select-none bg-slate-50 border-slate-200 hover:bg-white",
          isOpen ? "ring-4 ring-blue-500/10 border-blue-400 bg-white" : ""
        )}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-slate-400" />}
          <span className="text-[10px] font-black tracking-widest uppercase truncate text-slate-600">
            {selectedOption ? selectedOption.l : "Select..."}
          </span>
        </div>
        <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0 text-slate-400", isOpen && "rotate-180")} />
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
                  value === opt.v ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <span className="truncate">{opt.l}</span>
                {value === opt.v && <Check size={14} className="shrink-0 ml-2 text-blue-600" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuditLogs = () => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    actor_role: ''
  });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '500', // Fetch more for local filtering/pagination
        ...(filters.action && { action: filters.action }),
        ...(filters.actor_role && { actor_role: filters.actor_role })
      });

      const response = await authFetch(`/api/admin/audit-logs?${params}`);

      if (response.ok) {
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, authFetch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when searching or filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // ✅ HELPER: Format Date & Time to IST correctly (matching SystemLogs)
  const formatDateTimeIST = (dateString) => {
    if (!dateString) return { date: '--', time: '--' };
    try {
      const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
      const date = new Date(utcString);

      const datePart = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
      }).format(date);

      const timePart = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
      }).format(date);

      return { date: datePart, time: timePart.toLowerCase() };
    } catch (e) {
      return { date: "Invalid", time: "Date" };
    }
  };

  const getActionBadge = (action) => {
    const isApproved = action?.includes('APPROVED') || action?.includes('OVERRIDE_APPROVE');
    const isRejected = action?.includes('REJECTED');
    
    const baseClasses = "inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border shadow-sm";
    
    if (isApproved) return (
      <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> {action.replace('STAGE_', '').replace('ADMIN_', '')}
      </span>
    );
    if (isRejected) return (
      <span className={`${baseClasses} bg-rose-50 text-rose-700 border-rose-200`}>
        <XCircle className="h-3.5 w-3.5 mr-1.5" /> {action.replace('STAGE_', '')}
      </span>
    );
    return (
      <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>
        {action}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => 
    log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.student_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Skeleton Loader (matching SystemLogs layout)
  const SkeletonRow = () => (
    <TableRow className="animate-pulse hover:bg-transparent">
      <TableCell className="px-8 py-6"><div className="h-5 w-32 bg-slate-100 rounded" /></TableCell>
      <TableCell className="px-6 py-6">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100" />
            <div className="space-y-2"><div className="h-4 w-20 bg-slate-100 rounded"/><div className="h-3 w-16 bg-slate-50 rounded"/></div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-6"><div className="h-8 w-32 bg-slate-100 rounded-full" /></TableCell>
      <TableCell className="px-6 py-6"><div className="h-5 w-24 bg-slate-100 rounded" /></TableCell>
      <TableCell className="px-8 py-6"><div className="h-4 w-48 bg-slate-100 rounded" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="text-blue-600 h-6 w-6" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight ">Applications Audit Logs</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Real-time Applications oversight protocol.</p>
        </div>

        <button 
          onClick={fetchLogs}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
          title="Sync Registry"
        >
          <RefreshCcw className={`h-5 w-5 text-slate-500 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Roll No, Actor or Remarks..." 
            className="w-full pl-12 pr-6 h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Actor Role Dropdown */}
          <FilterDropdown 
            icon={Filter}
            value={filters.actor_role}
            onChange={(val) => setFilters({...filters, actor_role: val})}
            options={[
              { v: '', l: 'All Roles' },
              { v: 'dean', l: 'Dean' },
              { v: 'sports', l: 'Sports' },
              { v: 'library', l: 'Library' },
              { v: 'lab', l: 'Laboratories' }
            ]}
          />

          {/* Custom Action Dropdown */}
          <FilterDropdown 
            icon={Filter}
            value={filters.action}
            onChange={(val) => setFilters({...filters, action: val})}
            options={[
              { v: '', l: 'All Actions' },
              { v: 'STAGE_APPROVED', l: 'Approved' },
              { v: 'STAGE_REJECTED', l: 'Rejected' }
            ]}
          />
        </div>
      </div>

      {/* --- SHADCN TABLE INTEGRATION --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="px-8 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Timestamp (IST)</TableHead>
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Actor</TableHead>
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Final Action</TableHead>
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Student Info</TableHead>
                <TableHead className="px-8 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm font-medium">
              {loading ? (
                 [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const { date, time } = formatDateTimeIST(log.timestamp);
                  return (
                    <TableRow 
                      key={log.id} 
                      className="group hover:bg-slate-50/50 transition-colors border-slate-100/60"
                    >
                      <TableCell className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            {date}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 ml-[22px]">
                            <Clock size={12} />
                            {time}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 font-black bg-blue-50 text-xs shrink-0 uppercase">
                            {log.actor_role?.substring(0, 2) || 'AD'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm tracking-tight">
                              {log.actor_name || 'System User'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">
                              {log.actor_role} Node
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        {getActionBadge(log.action)}
                      </TableCell>

                      <TableCell className="px-6 py-5">
                        <span className="text-sm font-black text-slate-800 tracking-tight font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                           {log.details?.student_roll || 'N/A'}
                        </span>
                      </TableCell>

                      <TableCell className="px-8 py-5 max-w-xs truncate text-[13px] text-slate-500 italic font-medium">
                        {log.remarks ? `"${log.remarks}"` : <span className="text-slate-300">No protocol remarks recorded</span>}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <ShieldAlert size={48} className="mb-4 text-slate-400" />
                      <p className="font-black tracking-widest text-sm text-slate-500">NO LOGS MATCH YOUR FILTER</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- PAGINATION CONTROLS BAR --- */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto shrink-0">
             <p className="text-[11px] font-black tracking-widest text-slate-400">
              Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="text-slate-900">{filteredLogs.length}</span> Logs
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                    // Logic to condense pagination if there are many pages
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
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all active:scale-95"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Scrollbar Customization for Dropdowns */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AuditLogs;