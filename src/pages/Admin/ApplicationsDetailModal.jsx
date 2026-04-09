import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle, Clock, Loader2, 
  ShieldCheck, ShieldAlert, Lock, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RejectionModal from './RejectionModal';

const ApplicationDetailModal = ({ isOpen, onClose, application }) => {
  const { authFetch } = useAuth();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [stageToReject, setStageToReject] = useState(null);
  const [isSystemLocked, setIsSystemLocked] = useState(false);

  const isApplicationComplete = application.status === 'completed';

  const fetchStages = useCallback(async () => {
    try {
      const res = await authFetch(`/api/approvals/${application.application_id}/stages`);
      if (res.ok) {
        const data = await res.json();
        setStages(data.stages);
      }
    } catch (error) { 
      console.error("Stage Fetch Error:", error); 
    } finally { 
      setLoading(false);
      setIsSystemLocked(false); 
    }
  }, [application.application_id, authFetch]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchStages();
    }
  }, [isOpen, fetchStages]);

  const handleAdminOverride = async (stageId, action, remarks = "") => {
    if (isSystemLocked || isApplicationComplete) return;

    setIsSystemLocked(true);
    setProcessingId(stageId);

    try {
      const res = await authFetch(`/api/approvals/admin/override-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage_id: stageId,
          action: action,
          remarks: remarks.trim() || `Super Admin Override: ${action}` 
        })
      });

      if (res.ok) {
        setStageToReject(null); 
        await fetchStages();
      } else {
        const err = await res.json();
        alert(`Override Failed: ${err.detail || 'Invalid Stage ID'}`);
        setIsSystemLocked(false);
      }
    } catch (err) { 
        alert("Network error. Could not connect to the GBU Server."); 
        setIsSystemLocked(false);
    } finally { 
        setProcessingId(null); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={isSystemLocked ? null : onClose} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }} 
            className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
          >
            
            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-xl  ${isApplicationComplete ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-[#1e40af] text-white shadow-blue-100'}`}>
                  {isApplicationComplete ? <Check size={32} strokeWidth={3} /> : application.student_name?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{application.student_name}</h3>
                    {isApplicationComplete && (
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase rounded-md">
                        Clearance Finalized
                       </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{application.display_id} </p>
                </div>
              </div>
              <button disabled={isSystemLocked} onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Terminal Data...</p>
                </div>
              ) : (
                <div className={`relative transition-opacity duration-300 ${isSystemLocked ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                  <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-slate-100" />
                  <div className="space-y-8">
                    {stages.map((stage) => {
                      const isAccounts = stage.sequence === 5 || ['accounts', 'account', 'finance'].includes(stage.department_name?.toLowerCase());

                      return (
                        <div key={stage.stage_id} className="relative pl-16 group">
                          <div className={`absolute left-0 h-14 w-14 rounded-2xl flex items-center justify-center z-10 border-4 border-white shadow-lg ${
                            stage.status === 'approved' ? 'bg-emerald-500 text-white' : 
                            stage.status === 'rejected' ? 'bg-rose-500 text-white' : 
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {stage.status === 'approved' ? <ShieldCheck size={24} /> : stage.status === 'rejected' ? <ShieldAlert size={24} /> : <Clock size={24} />}
                          </div>

<div className={`p-6 rounded-[2.5rem] border ${stage.is_current ? 'bg-blue-50/30 border-blue-200' : 'bg-white border-slate-100'}`}>
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      {/* Position 1: Small text shows Role (or OFFICE for Stage 1) */}
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
        Stage {stage.sequence} • {stage.sequence === 1 ? 'OFFICE' : (stage.role === 'hod' ? 'Head of Department' : stage.role)}
      </div>
      
      {/* Position 2: Large text shows Department Name (or OFFICE for Stage 1) */}
      <h4 className="font-black text-slate-800 text-lg tracking-tight ">
        {stage.sequence === 1 ? 'School Office' : stage.department_name}
      </h4>
    </div>

    <div className="flex gap-2 shrink-0">
      {!isApplicationComplete ? (
        isAccounts ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black uppercase border border-amber-100 cursor-not-allowed">
            <Lock size={12} /> Finance Locked
          </div>
        ) : (
          <>
            <button 
              disabled={isSystemLocked || stage.status === 'approved'}
              onClick={() => handleAdminOverride(stage.stage_id, 'approve')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 disabled:opacity-20 transition-all flex items-center gap-2"
            >
              {processingId === stage.stage_id ? <Loader2 className="animate-spin" size={14} /> : 'Approve'}
            </button>
            <button 
              disabled={isSystemLocked || stage.status === 'rejected'}
              onClick={() => setStageToReject(stage)}
              className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 disabled:opacity-20 transition-all"
            >
              Reject
            </button>
          </>
        )
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase border border-slate-100">
          <Lock size={12} /> Archived
        </div>
      )}
    </div>
  </div>
  {stage.remarks && <p className="mt-4 text-[11px] text-slate-500 italic border-l-2 border-slate-200 pl-3">"{stage.remarks}"</p>}
</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {isApplicationComplete ? 'ARCHIVED RECORD: MODIFICATIONS DISABLED' : isSystemLocked ? 'SYSTEM BUSY: RE-SYNCING NODES...' : 'STATUS: READY FOR OVERRIDE'}
              </span>
              <button disabled={isSystemLocked} onClick={onClose} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] disabled:opacity-30">
                Close Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <RejectionModal 
        isOpen={!!stageToReject} 
        onClose={() => setStageToReject(null)} 
        studentName={`${stageToReject?.department_name} Stage`} 
        isLoading={isSystemLocked}
        onConfirm={(remarks) => handleAdminOverride(stageToReject.stage_id, 'reject', remarks)}
      />
    </AnimatePresence>
  );
};

export default ApplicationDetailModal;