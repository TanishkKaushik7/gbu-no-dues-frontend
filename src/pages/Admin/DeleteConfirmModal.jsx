import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, userName, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100"
          >
            <div className="p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to remove <span className="font-bold text-slate-700">{userName}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex border-t border-slate-100">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-l border-slate-100 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete User"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;