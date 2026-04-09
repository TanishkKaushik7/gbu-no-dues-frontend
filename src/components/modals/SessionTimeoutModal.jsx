import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';

const SessionTimeoutModal = ({ isOpen, onLogin }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* --- ULTRA BLUR BACKDROP --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
          />

          {/* --- MODAL CARD --- */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-[#111114]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 blur-[80px] pointer-events-none" />

            {/* --- ICON HEADER --- */}
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-amber-500/20 rounded-[2rem] blur-2xl group-hover:bg-amber-500/30 transition-all duration-500" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-900/40">
                  <Lock className="text-white w-10 h-10 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 p-2 rounded-xl shadow-xl">
                    <ShieldAlert size={16} className="text-amber-400" />
                </div>
              </div>
            </div>

            {/* --- TEXT CONTENT --- */}
            <div className="space-y-3 mb-10">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                Session <span className="text-amber-500">Expired</span>
              </h2>
              <div className="h-1 w-12 bg-amber-500 mx-auto rounded-full" />
              <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
                Your secure session has timed out due to inactivity. All unsaved changes have been protected.
              </p>
            </div>

            {/* --- ACTION BUTTON --- */}
            <div className="space-y-6">
              <button
                onClick={onLogin}
                className="group relative w-full overflow-hidden py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl hover:shadow-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-3">
                  <LogIn size={18} className="transition-transform group-hover:-translate-x-1" />
                  Re-Authorize Access
                </span>
              </button>

              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Security Protocol: Active
                </span>
              </div>
            </div>

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutModal;