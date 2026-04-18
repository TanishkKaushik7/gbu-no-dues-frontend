import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import {
  Check, Clock, XCircle, Lock, RefreshCw, 
  Building2, ShieldCheck, Library, Home, 
  Trophy, FlaskConical, Briefcase, ChevronDown,
  History, FileQuestion, Loader2, ArrowLeftRight // Added ArrowLeftRight
} from "lucide-react";

/* -------------------- CONFIG -------------------- */

const STATUS = {
  LOCKED: "LOCKED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};

const STATUS_CONFIG = {
  LOCKED: { 
    icon: Lock, label: "Locked", 
    bg: "bg-slate-50/80", iconBg: "bg-slate-100", border: "border-slate-200", 
    text: "text-slate-400", ring: "" 
  },
  PENDING: { 
    icon: Clock, label: "In Progress", 
    bg: "bg-blue-50/80", iconBg: "bg-blue-100", border: "border-blue-400", 
    text: "text-blue-600", ring: "ring-4 ring-blue-500/20" 
  },
  APPROVED: { 
    icon: Check, label: "Cleared", 
    bg: "bg-emerald-50/80", iconBg: "bg-emerald-100", border: "border-emerald-400", 
    text: "text-emerald-600", ring: "ring-4 ring-emerald-500/20" 
  },
  REJECTED: { 
    icon: XCircle, label: "Action Req.", 
    bg: "bg-rose-50/80", iconBg: "bg-rose-100", border: "border-rose-400", 
    text: "text-rose-600", ring: "ring-4 ring-rose-500/20" 
  }
};

const getIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('library')) return Library;
  if (n.includes('hostel')) return Home;
  if (n.includes('sports')) return Trophy;
  if (n.includes('lab')) return FlaskConical;
  if (n.includes('relation') || n.includes('crc')) return Briefcase;
  if (n.includes('finance') || n.includes('account')) return ShieldCheck;
  return Building2;
};

const formatDateIST = (dateString) => {
  if (!dateString) return null;
  try {
    let normalizedString = dateString.replace(' ', 'T');
    if (!normalizedString.endsWith('Z') && !normalizedString.includes('+')) {
      normalizedString += 'Z';
    }
    const date = new Date(normalizedString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

/* -------------------- UI COMPONENTS -------------------- */

const Node = ({ status, label, icon: Icon, isSmall = false, meta, position = 'right' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.LOCKED;
  const [isHovered, setIsHovered] = useState(false);

  const showTooltip = status !== STATUS.LOCKED;
  const displayComment = meta?.comments || "Verification in progress. Awaiting remarks.";

  const tooltipPositionClass = position === 'right' ? "left-[110%]" : "right-[110%]";

  return (
    <div 
      className="relative flex flex-col items-center group"
      style={{ zIndex: isHovered ? 100 : 10 }}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      // Added touch events for mobile users tapping nodes
      onTouchStart={() => setIsHovered(true)}
    >
      <AnimatePresence>
        {isHovered && showTooltip && (
          <motion.div 
            initial={{ opacity: 0, x: position === 'right' ? -10 : 10, scale: 0.95 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            exit={{ opacity: 0, x: position === 'right' ? -5 : 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute top-0 w-64 md:w-72 p-5 bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[1.5rem] z-[150] pointer-events-none ${tooltipPositionClass}`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Office Remarks</span>
                <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.iconBg} ${config.text}`}>
                  {config.label}
                </div>
              </div>
              <p className="text-[12px] md:text-[13px] leading-relaxed text-slate-200 font-medium">
                {displayComment}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`
        ${isSmall ? 'w-14 h-14' : 'w-[4.5rem] h-[4.5rem] md:w-[5rem] md:h-[5rem]'} 
        rounded-[1.25rem] border-[3px] flex items-center justify-center shadow-sm 
        ${config.bg} ${config.border} ${config.ring} transition-all duration-300
        ${isHovered ? 'scale-105 shadow-xl' : ''}
        ${status === STATUS.PENDING ? 'animate-pulse shadow-blue-500/20' : ''}
      `}>
        <div className={`w-full h-full rounded-[1rem] flex items-center justify-center bg-white/50 backdrop-blur-sm`}>
           <Icon size={isSmall ? 22 : 28} className={config.text} strokeWidth={2.5} />
        </div>
        
        {status === STATUS.APPROVED && (
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-[3px] border-white shadow-sm">
            <Check size={12} strokeWidth={4} />
          </div>
        )}
        {status === STATUS.REJECTED && (
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 border-[3px] border-white shadow-sm">
            <XCircle size={12} strokeWidth={4} />
          </div>
        )}
      </div>

      <div className="mt-4 text-center w-24 md:w-36">
        <p className="text-[10px] md:text-xs font-black text-slate-800 leading-tight tracking-tight">{label}</p>
        <p className={`text-[9px] md:text-[10px] font-bold mt-1 tracking-wide ${config.text}`}>{config.label}</p>
      </div>
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */

const TrackStatus = () => {
  const { token } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [isNoApplication, setIsNoApplication] = useState(false);
  const [workflow, setWorkflow] = useState({ top: [], parallel: [], bottom: [] });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setIsNoApplication(false);
      const res = await fetch(`${(import.meta.env.VITE_API_BASE || '').replace(/\/+$/g, '')}/api/applications/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();

      if (!json.application || !json.stages || json.stages.length === 0) {
        setIsNoApplication(true);
        setLoading(false);
        return;
      }

      setLastUpdated(json.application.updated_at);

      const mapStatus = (s) => {
        const val = (s || '').toLowerCase();
        if (['approved', 'completed', 'cleared'].includes(val)) return STATUS.APPROVED;
        if (['rejected', 'denied'].includes(val)) return STATUS.REJECTED;
        return val === 'pending' || val === 'processing' || val === 'in progress' ? STATUS.PENDING : STATUS.LOCKED;
      };

      const stages = [...json.stages].sort((a, b) => a.sequence_order - b.sequence_order);
      const top = [], parallel = [], bottom = [];

      stages.forEach(s => {
        let finalLabel = s.display_name;
        if (s.verifier_role === 'staff' && s.display_name === 'Staff') finalLabel = 'School Office';
        else if (s.verifier_role === 'hod') finalLabel = `${s.display_name} HOD`;
        else if (s.verifier_role === 'dean') finalLabel = `${s.display_name}`; 

        const stageObj = { 
          id: s.id, 
          label: finalLabel, 
          status: mapStatus(s.status), 
          icon: getIcon(s.display_name),
          meta: { comments: s.comments } 
        };
        
        if (s.sequence_order < 4) top.push(stageObj);
        else if (s.sequence_order === 4) parallel.push(stageObj);
        else bottom.push(stageObj);
      });
      setWorkflow({ top, parallel, bottom });
    } catch (err) { 
      console.error("An unexpected error occurred."); 
      setIsNoApplication(true);
    } finally { 
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20 w-16 h-16 m-auto"></div>
            <Loader2 size={40} className="animate-spin text-blue-600 relative z-10" strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-2">Synchronizing Timeline</p>
        </div>
      </div>
    );
  }

  if (isNoApplication) {
    return (
      <div className="bg-slate-50 min-h-screen py-10 px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center p-12 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
            <FileQuestion size={36} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Active Application</h2>
          <p className="text-xs font-bold text-slate-500 mt-3 tracking-wide leading-relaxed px-2">
            You haven't submitted any clearance requests yet. Once you submit, your live tracking workflow will appear here.
          </p>
          <button 
            onClick={fetchStatus}
            className="mt-10 px-8 py-4 bg-slate-900 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 flex items-center gap-3 mx-auto"
          >
            <RefreshCw size={16} /> Refresh System
          </button>
        </motion.div>
      </div>
    );
  }

  const lastTopActive = workflow.top[workflow.top.length - 1]?.status === STATUS.APPROVED;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Application Status</h1>
            <p className="text-xs font-bold text-slate-500 mt-1 tracking-widest uppercase">Live Clearance Workflow</p>
          </div>
          <button 
            onClick={fetchStatus} 
            className="p-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl transition-all hover:bg-slate-50 active:scale-95 group w-fit hidden sm:block"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500 text-blue-600`} />
          </button>
        </div>

        {/* Workflow Canvas */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden relative flex flex-col">
          
          {/* MOBILE HINT: Tells users they can swipe sideways */}
          <div className="md:hidden bg-blue-50/80 border-b border-blue-100 py-3 flex items-center justify-center gap-2 text-blue-600 z-20">
            <ArrowLeftRight size={14} className="animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase">Swipe to explore workflow</span>
          </div>

          {/* Decorative Blueprint Dots */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }}></div>

          {/* Canvas Container: Added overscroll-x-contain to prevent browser back-swipes */}
          <div className="p-6 md:p-14 overflow-x-auto overflow-y-visible relative z-10 custom-scrollbar overscroll-x-contain">
            {/* Reduced mobile min-width slightly so it centers better */}
            <div className="min-w-[700px] md:min-w-[900px] flex flex-col items-center relative py-6 md:py-12 mx-auto">
              
              {/* 1. TOP SECTION */}
              {workflow.top.map((stage) => (
                <React.Fragment key={stage.id}>
                  <Node {...stage} position="right" />
                  <div className={`w-[3px] h-12 rounded-full my-1 ${stage.status === STATUS.APPROVED ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'bg-slate-200'} transition-all duration-500 relative`}>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[80%] bg-white rounded-full p-0.5">
                          <ChevronDown size={16} className={stage.status === STATUS.APPROVED ? 'text-emerald-500' : 'text-slate-300'} strokeWidth={4} />
                      </div>
                  </div>
                </React.Fragment>
              ))}

              {/* 2. PARALLEL SECTION */}
              {workflow.parallel.length > 0 && (
                <div className="w-full relative mt-4">
                  <div className="flex w-full">
                    {workflow.parallel.map((stage, idx) => {
                      const isLeftHalf = idx < (workflow.parallel.length / 2);
                      return (
                        <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                          
                          {/* Top Horizontal Branch Line */}
                          <div className={`absolute top-0 h-[3px] w-full rounded-full transition-all duration-500
                            ${lastTopActive ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'bg-slate-200'} 
                            ${idx === 0 ? 'left-1/2 w-1/2' : ''} 
                            ${idx === workflow.parallel.length - 1 ? 'right-1/2 w-1/2' : ''}`} 
                          />
                          
                          {/* Top Vertical Drop Line */}
                          <div className={`w-[3px] h-8 rounded-b-full transition-all duration-500 ${lastTopActive ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'bg-slate-200'}`} />
                          
                          {/* Parallel Node */}
                          <div className="my-2">
                            <Node {...stage} isSmall position={isLeftHalf ? 'right' : 'left'} />
                          </div>

                          {/* Bottom Vertical Drop Line */}
                          <div className={`w-[3px] h-8 rounded-t-full transition-all duration-500 ${stage.status === STATUS.APPROVED ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'bg-slate-200'}`} />
                          
                          {/* Bottom Horizontal Branch Line */}
                          <div className={`absolute bottom-0 h-[3px] w-full rounded-full transition-all duration-500
                            ${idx === 0 ? 'left-1/2 w-1/2' : ''} 
                            ${idx === workflow.parallel.length - 1 ? 'right-1/2 w-1/2' : ''}
                            ${stage.status === STATUS.APPROVED ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'bg-slate-200'}`} 
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Collector Arrow */}
                  <div className="flex justify-center mt-1">
                      <div className="w-[3px] h-12 bg-slate-200 rounded-full relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[80%] bg-white rounded-full p-0.5">
                              <ChevronDown size={16} className="text-slate-300" strokeWidth={4} />
                          </div>
                      </div>
                  </div>
                </div>
              )}

              {/* 3. BOTTOM SECTION */}
              <div className="flex flex-col items-center mt-4">
                {workflow.bottom.map((stage, idx) => (
                  <React.Fragment key={stage.id}>
                    <Node {...stage} position="right" />
                    {idx < workflow.bottom.length - 1 && (
                      <div className={`w-[3px] h-12 rounded-full my-1 ${stage.status === STATUS.APPROVED ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'bg-slate-200'} transition-all duration-500 relative`}>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[80%] bg-white rounded-full p-0.5">
                              <ChevronDown size={16} className={stage.status === STATUS.APPROVED ? 'text-emerald-500' : 'text-slate-300'} strokeWidth={4} />
                          </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Status Bar */}
          <div className="bg-slate-50/95 backdrop-blur-md border-t border-slate-200 p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hidden sm:block">
                <History size={20} className="text-blue-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none mb-1.5">Last System Update</p>
                <p className="text-xs md:text-sm font-bold text-slate-800">{formatDateIST(lastUpdated) || 'Syncing latest data...'}</p>
              </div>
            </div>
            
            <div className="px-5 py-2.5 bg-white border border-emerald-100 rounded-2xl shadow-sm flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] md:text-[11px] font-black text-emerald-700 tracking-widest uppercase mt-0.5">Live Sync Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackStatus;