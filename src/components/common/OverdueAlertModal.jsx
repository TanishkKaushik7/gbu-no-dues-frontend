// src/components/dashboard/OverdueAlertModal.jsx
import React from 'react';
import { FiAlertTriangle, FiClock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const OverdueAlertModal = ({ isOpen, onClose, overdueApps, onViewAll }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-red-100"
        >
          {/* Header */}
          <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full shrink-0 text-red-600">
              <FiAlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900">Action Required: Delays Detected</h2>
              <p className="text-sm text-red-700 mt-1">
                You have <strong>{overdueApps.length} applications</strong> that have been pending for more than 7 days.
              </p>
            </div>
            <button onClick={onClose} className="ml-auto text-red-400 hover:text-red-700">
              <FiX size={20} />
            </button>
          </div>

          {/* Body: List Top 3 offenders */}
          <div className="p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Longest Pending</h3>
            <div className="space-y-3">
              {overdueApps.slice(0, 3).map((app) => (
                <div key={app.application_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {app.student_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{app.student_name}</p>
                      <p className="text-xs text-slate-500">{app.roll_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md">
                    <FiClock size={12} />
                    <span className="text-xs font-bold">{app.days_pending} Days</span>
                  </div>
                </div>
              ))}
              
              {overdueApps.length > 3 && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  + {overdueApps.length - 3} more applications...
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Remind Me Later
            </button>
            <button 
              onClick={onViewAll}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              Review All Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OverdueAlertModal;