import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LogoutConfirmModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 p-6 text-center"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon Wrapper */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-5 ring-4 ring-red-50/50">
              <LogOut className="h-6 w-6 text-red-600 ml-0.5" />
            </div>

            {/* Text Content */}
            <h3 className="text-lg font-semibold text-gray-900">Sign out of session?</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              You are about to sign out of the <span className="font-medium text-gray-700">GBU Admin Portal</span>. 
              Any unsaved changes may be lost.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 hover:text-gray-900 transition-all focus:ring-2 focus:ring-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 shadow-sm transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
              >
                Sign out
              </button>
            </div>

            {/* Minimalist Version Footer */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Connection Secure
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;