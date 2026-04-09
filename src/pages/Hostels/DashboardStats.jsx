// src/components/dashboard/DashboardStats.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiAlertTriangle } from 'react-icons/fi';

const DashboardStats = ({ stats }) => {
  const { total, overdue } = stats; // ✅ Extract 'overdue' count

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      
      {/* 1. Standard Total Badge */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 bg-white border border-slate-200/60 pl-3 pr-4 py-1.5 rounded-full shadow-sm"
      >
        <div className="p-1.5 bg-blue-50 rounded-full text-blue-500">
          <FiUsers size={14} />
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Requests
          </span>
          <span className="text-sm font-black text-slate-900">
            {total}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 border-l border-slate-100 pl-3">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Live
          </span>
        </div>
      </motion.div>

      {/* ✅ 2. NEW: Overdue Alert Badge (Only shows if overdue > 0) */}
      {overdue > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-red-50 border border-red-100 pl-3 pr-4 py-1.5 rounded-full shadow-sm animate-pulse"
        >
          <div className="p-1.5 bg-red-100 rounded-full text-red-600">
            <FiAlertTriangle size={14} />
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
              Action Required
            </span>
            <span className="text-sm font-black text-red-700">
              {overdue} Overdue
            </span>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default DashboardStats;