import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Send, Loader2 } from 'lucide-react';

const RejectionModal = ({ isOpen, onClose, onConfirm, studentName, isLoading }) => {
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!remarks.trim()) return;
    // ✅ Passes the local remarks state to the parent's handleAction
    onConfirm(remarks);
  };

  // Reset remarks when modal closes/opens
  React.useEffect(() => {
    if (!isOpen) setRemarks('');
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertCircle size={24} />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-800 tracking-tight">Reject Application</h3>
            <p className="text-sm text-slate-500 mt-2">
              Provide a reason for rejecting <span className="font-bold text-slate-700">{studentName}</span>.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <textarea
                required
                placeholder="Enter rejection remarks..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all resize-none"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !remarks.trim()}
                  className="flex-[2] py-3.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Send size={16} /> Confirm</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RejectionModal;