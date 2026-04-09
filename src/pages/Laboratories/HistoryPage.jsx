import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiClock, FiCheckCircle, FiXCircle, FiSearch, 
  FiRefreshCw, FiCalendar, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import RoleLayout from '../../components/common/RoleLayout';
import { useAuth } from '../../contexts/AuthContext';

const HistoryPage = () => {
  const { authFetch } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/approvals/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredHistory = history.filter(item => 
    item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.display_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // ✅ HELPER: Format Date & Time to IST
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '--', time: '--' };
    
    // 1. Force UTC interpretation by appending 'Z' if missing
    const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(utcString);

    // 2. Format Date (e.g., 07 Feb 2026)
    const datePart = new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    }).format(date);

    // 3. Format Time (e.g., 04:30 PM)
    const timePart = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(date);

    return { date: datePart, time: timePart };
  };

  const renderActionBadge = (action) => {
    const isApproved = action?.toLowerCase().includes('approve');
    return (
      <span className={`flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        isApproved ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
      }`}>
        {isApproved ? <FiCheckCircle className="mr-1.5" /> : <FiXCircle className="mr-1.5" />}
        {action?.replace('STAGE_', '').replace('ADMIN_OVERRIDE_', '')}
      </span>
    );
  };

  return (
    <RoleLayout>
      <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Approval History</h1>
            <p className="text-slate-500 text-xs font-medium">Audit logs for your past administrative actions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Query audit logs..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-64 shadow-sm transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchHistory}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95"
            >
              <FiRefreshCw size={18} className={isLoading ? 'animate-spin text-blue-500' : ''} />
            </button>
          </div>
        </div>

        {/* ✅ List Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[560px]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Archives...</p>
            </div>
          ) : currentItems.length > 0 ? (
            <>
              <div className="overflow-y-auto min-h-[500px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Profile</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Final Action</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remarks / Feedback</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode='popLayout'>
                      {currentItems.map((item, index) => {
                        const { date, time } = formatDateTime(item.timestamp);
                        return (
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            key={item.timestamp + index}
                            className="hover:bg-blue-50/50 transition-colors group"
                          >
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                  {item.student_name}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-widest border border-blue-100 uppercase">
                                    {item.display_id}
                                  </span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                     # {item.roll_number}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              {renderActionBadge(item.action)}
                            </td>
                            <td className="px-8 py-5">
                              <p className="text-xs text-slate-500 italic max-w-xs truncate font-medium" title={item.remarks}>
                                "{item.remarks || 'Standard approval'}"
                              </p>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                                  <FiCalendar size={12} className="text-slate-400" /> 
                                  {date}
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                  <FiClock size={12} className="text-slate-300" /> 
                                  {time}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* ✅ Pagination Footer */}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages || 1}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => paginate('prev')}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  
                  <button
                    onClick={() => paginate('next')}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px]">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                 <FiClock className="text-slate-200 text-4xl" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Archive Empty</h3>
              <p className="text-xs text-slate-400 font-medium mt-2">No past actions recorded.</p>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
};

export default HistoryPage;