import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2, XCircle } from 'lucide-react';

const DeletePrograms = ({ isOpen, onClose, onSuccess, authFetch, program }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null); // New error state

  const handleDelete = async () => {
    if (!program) return;
    setIsDeleting(true);
    setError(null); 
    try {
      const res = await authFetch(`/api/admin/programmes/${program.code}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        // Sets the error message from backend (e.g., "Ensure no Specializations are linked")
        setError(errData.detail || "Deletion failed. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Check your connection.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 text-center">
              <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Delete Programme?</h3>
              <p className="text-slate-500 text-sm mt-3 px-4">
                You are about to remove <span className="font-bold text-slate-700">{program?.name}</span>.
              </p>

              {/* Dynamic Error Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-left"
                >
                  <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-rose-700 leading-relaxed uppercase tracking-tight">
                    {error}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => { setError(null); onClose(); }}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={14} />}
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeletePrograms;