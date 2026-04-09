import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2, XCircle } from 'lucide-react';

const DeleteSpecialization = ({ isOpen, onClose, onSuccess, authFetch, specialization }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!specialization) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await authFetch(`/api/admin/specializations/${specialization.code}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        setError(errData.detail || "Cannot delete specialization.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
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
              
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight text-rose-600">Action Required</h3>
              <p className="text-slate-500 text-sm mt-3 px-4">
                Are you sure you want to remove <span className="font-bold text-slate-700">{specialization?.name}</span>?
              </p>

              {/* In-Modal Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteSpecialization;