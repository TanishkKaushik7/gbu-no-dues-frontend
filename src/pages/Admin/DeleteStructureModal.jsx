import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

const DeleteStructureModal = ({ isOpen, onClose, onConfirm, itemName, itemType, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100"
          >
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 mb-5 border border-red-200">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                Delete {itemType === 'school' ? 'School' : 'Department'}
              </h3>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                Are you sure you want to permanently remove <span className="font-bold text-slate-900 italic">"{itemName}"</span>? 
                {itemType === 'school' && " All associated data and department links will be affected."}
              </p>
            </div>

            <div className="flex p-4 gap-3 bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-[1.5] px-4 py-3 text-xs font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteStructureModal;