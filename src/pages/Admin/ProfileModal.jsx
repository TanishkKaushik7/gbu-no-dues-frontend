import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Shield, Building2, BadgeCheck, 
  Fingerprint, Globe, ShieldAlert, Copy, Check 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const profile = user || {
    name: "Admin",
    email: "admin@example.com",
    id: "dac3030a-cf8b-4cfa-abc4-19386f817ead",
    role: "admin",
    department_name: null,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden max-h-[90vh]"
          >
            {/* 1. FIXED HEADER */}
            <div className="h-28 bg-[#1e40af] relative shrink-0">
              <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10">
                <X className="h-5 w-5" />
              </button>
              
              <div className="absolute -bottom-8 left-10 p-1 bg-white rounded-2xl shadow-xl">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-white shadow-inner">
                  <span className="text-2xl font-black text-white uppercase tracking-tighter">
                    {profile.name?.substring(0, 2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto pt-10 px-8 pb-4 custom-scrollbar">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
                    <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-50" />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                      {profile.role}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Verified Personnel
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-6 space-y-5">
                {/* UUID Block */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-2"><Fingerprint className="h-3 w-3 text-blue-500" /> System Identifier</span>
                    <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors text-[10px] font-bold">
                      {copied ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
                    </button>
                  </label>
                  <div className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 break-all leading-relaxed">
                    {profile.id}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="h-3 w-3 text-blue-500" /> Email
                    </label>
                    <p className="text-xs font-bold text-slate-700 truncate">{profile.email}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Globe className="h-3 w-3 text-blue-500" /> Scope
                    </label>
                    <p className="text-xs font-bold text-slate-700">Universal</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-50">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-blue-500" /> Unit Allocation
                  </label>
                  <p className="text-xs font-bold text-slate-700">
                    {profile.department_name || 'Central University Administration'}
                  </p>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3">
                  <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                   Admin privileges active. All structural overrides are logged.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. FIXED FOOTER */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
              <button 
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;