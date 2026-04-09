import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, ShieldAlert, BarChart3, Database, Loader2 } from 'lucide-react';

const ClearCacheModal = ({ isOpen, onClose, onConfirm, clearingScope, isProcessing }) => {
  
  const options = [
    {
      id: 'rate_limits',
      title: 'Rate Limits',
      desc: 'Reset all API request throttles and IP blocks.',
      icon: <ShieldAlert className="text-amber-500" />,
      color: 'hover:border-amber-200 hover:bg-amber-50/50'
    },
    {
      id: 'traffic',
      title: 'Traffic Stats',
      desc: 'Wipe historical path hits and endpoint metrics.',
      icon: <BarChart3 className="text-blue-500" />,
      color: 'hover:border-blue-200 hover:bg-blue-50/50'
    },
    {
      id: 'all',
      title: 'Global Cache',
      desc: 'Complete flush of the Redis store. Dangerous.',
      icon: <Trash2 className="text-rose-500" />,
      color: 'hover:border-rose-200 hover:bg-rose-50/50'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={isProcessing ? null : onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Purge Cache</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Redis Maintenance Module</p>
                </div>
              </div>
              <button 
                disabled={isProcessing}
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Selection Area */}
            <div className="px-8 py-4 space-y-3">
              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                Select the data scope you wish to invalidate. This action is immediate and cannot be reversed.
              </p>
              
              {options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isProcessing}
                  onClick={() => onConfirm(opt.id)}
                  className={`w-full p-4 rounded-2xl border border-slate-100 flex items-center gap-4 text-left transition-all group ${opt.color} disabled:opacity-50`}
                >
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {isProcessing && clearingScope === opt.id ? (
                      <Loader2 size={18} className="animate-spin text-slate-400" />
                    ) : opt.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700 uppercase">{opt.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-tight">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 mt-4 flex justify-end">
              <button 
                disabled={isProcessing}
                onClick={onClose}
                className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel Process
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ClearCacheModal;