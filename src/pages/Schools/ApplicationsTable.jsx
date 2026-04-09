// src/components/dashboard/ApplicationsTable.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiEye, FiList, FiRefreshCw, FiCheckCircle, 
  FiClock, FiXCircle, FiMapPin, FiSearch, FiFilter, FiLoader,
  FiAlertTriangle 
} from 'react-icons/fi';
import { ChevronDown, Check } from 'lucide-react'; // Added for the new dropdowns
import { useAuth } from '../../contexts/AuthContext'; 

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- CUSTOM SHADCN-LIKE SELECT COMPONENT ---
const CustomSelect = ({ value, onChange, options, icon: Icon, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.v) === String(value));

  return (
    <div className={cn("relative", className)} ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all select-none bg-white border-gray-300 hover:bg-gray-50",
          isOpen ? "ring-2 ring-indigo-500/20 border-indigo-400" : ""
        )}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
          <span className="text-sm font-medium text-gray-700 truncate">
            {selectedOption ? selectedOption.l : "Select..."}
          </span>
        </div>
        <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0 text-gray-500", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full min-w-[120px] max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg custom-scrollbar"
          >
            {options.map((opt) => (
              <div
                key={opt.v}
                onClick={() => { onChange(opt.v); setIsOpen(false); }}
                className={cn(
                  "relative flex items-center justify-between cursor-pointer py-2 px-3 text-sm font-medium transition-colors",
                  String(value) === String(opt.v) ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="truncate">{opt.l}</span>
                {String(value) === String(opt.v) && <Check size={14} className="shrink-0 ml-2 text-indigo-600" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const renderStatusBadge = (status) => {
  const s = (status || '').toString();
  const key = s.toLowerCase().replace(/[\s-]/g, '');
  if (['inprogress', 'in_progress', 'pending'].includes(key)) {
    return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit"><FiClock className="mr-1" /> {s}</span>;
  }
  
  return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center w-fit">{s}</span>;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  } catch (e) { return iso; }
};

const ApplicationsTable = ({ applications, isLoading, onView, onSearch, onRefresh, isViewLoading }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null); 
  
  const [filterStatus, setFilterStatus] = useState('All'); 
  
  const itemsPerPage = 50;

  const filteredApps = useMemo(() => {
    if (!applications) return [];
    
    // First, filter by Department scope (existing logic)
    let result = applications.filter(app => {
      if (['super_admin', 'dean'].includes(user?.role)) {
        return true; 
      }
      const location = (app.current_location || '').toLowerCase();
      const myDept = (user?.department || user?.role || '').toLowerCase();
      return location.includes(myDept);
    });

    // Second, filter by the Dropdown Selection
    if (filterStatus !== 'All') {
        result = result.filter(app => {
            const status = (app.status || '').toLowerCase();
            
            if (filterStatus === 'Overdue') return app.is_overdue;
            if (filterStatus === 'Pending') return status === 'pending';
            
            return true;
        });
    }

    return result;
  }, [applications, user, filterStatus]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [applications.length, filterStatus]); 

  useEffect(() => {
    if (!isViewLoading) {
      setLoadingId(null);
    }
  }, [isViewLoading]);

  const totalItems = filteredApps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedApplications = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewClick = (app) => {
    setLoadingId(app.id);
    onView(app);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-4 gap-4">
        
        <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
            <div className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">
                Application List
                </h3>
                {user?.role !== 'super_admin' && (
                    <span className="text-xs text-gray-400 font-medium break-words">
                      Showing requests for: {user?.department || user?.role}
                    </span>
                )}
            </div>

            <button
                onClick={onRefresh}
                className="p-2 border border-gray-300 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors duration-200 shadow-sm flex-shrink-0"
                title="Refresh Data"
            >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>

        {/* Controls: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          
          {/* CUSTOM STATUS FILTER DROPDOWN */}
          <CustomSelect 
            icon={FiFilter}
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { v: 'All', l: 'All Status' },
              { v: 'Pending', l: 'Pending' },
              { v: 'Overdue', l: 'Overdue' }
            ]}
            className="flex-grow sm:flex-grow-0 min-w-[140px]"
          />

          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64 transition-shadow duration-300 focus-within:shadow-md focus-within:border-indigo-500 bg-gray-50/50">
            <FiSearch className="text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full outline-none text-sm bg-transparent"
              onChange={onSearch}
            />
          </div>

          {/* CUSTOM PAGINATION DROPDOWN */}
          {totalItems > itemsPerPage && (
            <CustomSelect 
              value={currentPage}
              onChange={(val) => setCurrentPage(Number(val))}
              options={Array.from({ length: totalPages }, (_, i) => ({ v: i + 1, l: `Page ${i + 1}` }))}
              className="w-full sm:w-[110px]"
            />
          )}
        </div>
      </div>
      
      {/* Table Content */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 flex flex-col items-center">
          <FiRefreshCw className="animate-spin w-6 h-6 mb-3 text-indigo-500" />
          <p>Loading applications...</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle px-4 md:px-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Roll No</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Enrollment No</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedApplications.map((app) => (
                  <tr 
                    key={app.id} 
                    className={`transition-colors duration-200 ${
                        app.is_overdue 
                        ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-500' 
                        : 'hover:bg-indigo-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-900 font-semibold whitespace-nowrap">{app.rollNo || '—'}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-500 text-sm whitespace-nowrap">{app.enrollment || '—'}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-700 whitespace-nowrap">
                      <div className="truncate font-medium">{app.name || '—'}</div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-700 text-sm whitespace-nowrap">
                       <div className="flex items-center text-gray-500">
                         <FiMapPin className="mr-1 text-xs" />
                         {app.current_location || '—'}
                       </div>
                    </td>
                    
                    <td className="px-4 py-3 md:px-6 md:py-4 text-gray-700 whitespace-nowrap">
                      <div className='flex flex-col'>
                          <div className='flex items-center text-sm'>
                              <FiCalendar className='mr-1 text-gray-400' />
                              {formatDate(app.date)}
                          </div>
                          
                          {app.is_overdue && (
                              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded w-fit">
                                <FiAlertTriangle className="w-3 h-3" />
                                {app.days_pending} Days Overdue
                              </span>
                          )}
                      </div>
                    </td>

                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">{renderStatusBadge(app.status)}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewClick(app)}
                        disabled={isViewLoading && loadingId === app.id}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center font-medium p-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
                      >
                        {isViewLoading && loadingId === app.id ? (
                          <FiLoader className="animate-spin mr-1 w-4 h-4" />
                        ) : (
                          <FiEye className="mr-1 w-4 h-4" />
                        )}
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApps.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-lg">
              <FiList className='mx-auto w-8 h-8 mb-2 text-gray-400' />
              {user?.role !== 'super_admin' 
                  ? "No applications found matching the filter."
                  : "No applications found."}
            </div>
          )}
          
          {!isLoading && filteredApps.length > 0 && (
            <div className="mt-4 text-xs text-gray-400 text-right px-2">
              Showing {Math.min(filteredApps.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
            </div>
          )}
        </div>
      )}

      {/* Adding custom scrollbar style just for the dropdown overflow */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

export default ApplicationsTable;