import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ShieldAlert, Activity, Search, RefreshCw, 
  Clock, Globe, Monitor, Filter, ChevronLeft, 
  ChevronRight, Eye, CheckCircle2, XCircle, Info, Calendar,
  Check, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

const SystemLogs = () => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  /**
   * IST Formatting Logic - UPDATED to split Date and Time
   */
  const formatTimestampIST = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    try {
      let normalizedString = dateString.replace(' ', 'T');
      if (!normalizedString.endsWith('Z') && !normalizedString.includes('+')) {
        normalizedString += 'Z';
      }
      const date = new Date(normalizedString);
      
      const dateStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
      }).format(date);
      
      const timeStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true
      }).format(date);

      return { date: dateStr, time: timeStr.toLowerCase() };
    } catch (e) {
      return { date: "Invalid", time: "Date" };
    }
  };

  const fetchLogs = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      let url = `/api/admin/system-logs?limit=500`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (eventFilter) url += `&event_type=${eventFilter}`;

      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Audit Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [authFetch, statusFilter, eventFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, eventFilter]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <TableCell className="px-6 py-6"><div className="h-5 w-40 bg-slate-100 rounded" /></TableCell>
      <TableCell className="px-8 py-6 text-right"><div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="text-blue-600 h-6 w-6" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight ">Security Audit</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Real-time system event monitoring and actor tracking.</p>
        </div>
        <button 
          onClick={() => fetchLogs()} 
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
        >
          <RefreshCw className={`h-5 w-5 text-slate-500 group-hover:text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Filter by IP, Event, or Actor UUID..." 
            className="w-full pl-12 pr-6 h-[50px] bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Event Dropdown */}
          <FilterDropdown 
            icon={Activity}
            value={eventFilter}
            onChange={setEventFilter}
            options={[
              { v: '', l: 'All Events' },
              { v: 'USER_LOGIN', l: 'User Login' },
              { v: 'STUDENT_LOGIN', l: 'Student Login' },
              { v: 'RATE_LIMIT', l: 'Rate Limit' },
              { v: 'DATA_EXPORT', l: 'Data Export' }
            ]}
          />

          {/* Custom Status Dropdown */}
          <FilterDropdown 
            icon={Filter}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { v: '', l: 'All Status' },
              { v: 'SUCCESS', l: 'Success' },
              { v: 'FAILURE', l: 'Failure' },
              { v: 'ERROR', l: 'Error' }
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
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Event Status</TableHead>
                <TableHead className="px-6 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Network Info</TableHead>
                <TableHead className="px-8 py-5 h-auto text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm font-medium">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const { date, time } = formatTimestampIST(log.timestamp);
                  const actorInitials = log.actor_role?.substring(0, 2).toUpperCase() || 'SY';
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <TableRow key={log.id} className="group hover:bg-slate-50/50 transition-colors border-slate-100/60">
                      
                      {/* Timestamp (Split Date/Time style) */}
                      <TableCell className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            {date}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 ml-[22px]">
                            <Clock size={12} />
                            {time}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actor (Avatar Style) */}
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 font-black bg-blue-50 text-xs shrink-0">
                            {actorInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">
                              {log.actor_role === 'admin' ? 'Admin' : log.actor_role || 'System Node'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 font-mono truncate max-w-[120px]" title={log.actor_id}>
                              {log.actor_id || 'Auto-Triggered'}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Event Status (Pill Badge Style) */}
                      <TableCell className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border shadow-sm ${
                          isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {log.event_type}
                        </span>
                      </TableCell>

                      {/* Network Info (IP & Agent) */}
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Globe size={14} className="text-slate-400" /> {log.ip_address}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[180px] font-medium mt-1 ml-[22px]" title={log.user_agent}>
                            {log.user_agent?.split(') ')[1] || 'Unknown Agent'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Details Button */}
                      <TableCell className="px-8 py-5 text-right">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-200 active:scale-95"
                        >
                          <Eye size={18} />
                        </button>
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

        {/* Pagination Controls */}
        {!loading && filteredLogs.length > 0 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
            <p className="text-[11px] font-black tracking-widest text-slate-400">
              Audit Stream: <span className="text-slate-900">{filteredLogs.length}</span> Events Captured
            </p>
            <div className="flex items-center gap-3">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[11px] font-black text-slate-600 px-2 tracking-widest">PAGE {currentPage} / {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal Component Remains Unchanged */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-[#1e40af] p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-200 text-[10px] font-black tracking-[0.2em] mb-2">Detailed Log Record</p>
                    <h2 className="text-2xl font-black tracking-tight">{selectedLog.event_type}</h2>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 mb-1">Status Code</p>
                    <p className={`font-black text-sm ${selectedLog.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-500'}`}>{selectedLog.status}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 mb-1">IP Address</p>
                    <p className="font-bold text-sm text-slate-800">{selectedLog.ip_address}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="text-blue-500 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 ">User Agent</p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedLog.user_agent}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="text-blue-500 mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 ">Actor ID (UUID)</p>
                      <p className="text-xs text-slate-600 font-mono break-all">{selectedLog.actor_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Diff Viewer */}
                {(Object.keys(selectedLog.old_values || {}).length > 0 || Object.keys(selectedLog.new_values || {}).length > 0) && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 mb-4 flex items-center gap-2">
                       <Info size={14} /> Data Payload Comparison
                     </p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <span className="text-[9px] font-black text-red-400 px-2">Before</span>
                           <pre className="p-4 bg-slate-50 rounded-xl text-[10px] overflow-auto border border-slate-100 font-mono text-slate-500">
                             {JSON.stringify(selectedLog.old_values, null, 2)}
                           </pre>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[9px] font-black text-emerald-500 px-2">After</span>
                           <pre className="p-4 bg-emerald-50/50 rounded-xl text-[10px] overflow-auto border border-emerald-100 font-mono text-slate-700">
                             {JSON.stringify(selectedLog.new_values, null, 2)}
                           </pre>
                        </div>
                     </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemLogs;