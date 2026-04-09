import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, FileText, CheckCircle, XCircle, 
  Clock, Download, AlertCircle, Home, Calendar, Briefcase, MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// --- HELPER: Status Badge ---
const StatusBadge = ({ status }) => {
  const styles = {
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
};

// --- HELPER: Data Field ---
const DataField = ({ label, value, icon: Icon }) => (
  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-sm font-bold text-slate-700 truncate" title={value?.toString()}>
      {value || '—'}
    </p>
  </div>
);

const ApplicationInspectionModal = ({ 
  isOpen, 
  onClose, 
  applicationId, // UUID required
  rollNumber,    // For fetching timeline
}) => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'timeline'
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [enrichedData, setEnrichedData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);

  // Fetch Data on Mount
  useEffect(() => {
    if (isOpen && applicationId) {
      fetchData();
    }
  }, [isOpen, applicationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Enriched Details
      const resEnriched = await authFetch(`/api/approvals/enriched/${applicationId}`);
      if (resEnriched.ok) {
        const data = await resEnriched.json();
        setEnrichedData(data);
        
        // 2. Fetch Timeline (If we have roll number from props or enriched data)
        const rollToSearch = rollNumber || data.roll_number;
        if (rollToSearch) {
          const resStatus = await authFetch(`/api/applications/status?search_query=${rollToSearch}`);
          if (resStatus.ok) {
            const statusData = await resStatus.json();
            setTimelineData(statusData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load application data", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-200">
              ND
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Application Inspector</h2>
              <p className="text-xs text-slate-500 font-bold">ID: {enrichedData?.display_id || 'Loading...'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex bg-white rounded-xl p-1 border border-slate-200">
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Student Profile
              </button>
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'timeline' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Status Timeline
              </button>
            </div>
            <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfe] custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'details' && enrichedData && (
                <motion.div 
                  key="details" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* 1. Header Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                          <User size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{enrichedData.student_name}</h3>
                          <p className="text-sm font-medium text-slate-500">{enrichedData.student_email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge status={enrichedData.application_status} />
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                          {enrichedData.admission_type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proof Document</p>
                      {enrichedData.proof_document_url ? (
                        <a 
                          href={enrichedData.proof_document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-xs shadow-sm"
                        >
                          <FileText size={14} /> View PDF <Download size={12} />
                        </a>
                      ) : (
                        <div className="text-xs font-bold text-slate-400 text-center py-2">No Document</div>
                      )}
                    </div>
                  </div>

                  {/* 2. Detailed Info Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Academic Info */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Briefcase size={14} /> Academic Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DataField label="Roll Number" value={enrichedData.roll_number} />
                        <DataField label="Enrollment No" value={enrichedData.enrollment_number} />
                        <DataField label="Department" value={enrichedData.department_name} />
                        <DataField label="Dept Code" value={enrichedData.department_code} />
                        <DataField label="Section" value={enrichedData.section} />
                        <DataField label="Admission Year" value={enrichedData.admission_year} />
                        <div className="col-span-2">
                          <DataField label="School" value={enrichedData.school_name} />
                        </div>
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <User size={14} /> Personal Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DataField label="Father's Name" value={enrichedData.father_name} />
                        <DataField label="Mother's Name" value={enrichedData.mother_name} />
                        <DataField label="Gender" value={enrichedData.gender} />
                        <DataField label="Category" value={enrichedData.category} />
                        <DataField label="Date of Birth" value={enrichedData.dob} icon={Calendar} />
                        <DataField label="Mobile" value={enrichedData.student_mobile} />
                      </div>
                    </div>

                    {/* Location & Hostel */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2">
                      <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <MapPin size={14} /> Residential Info
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DataField label="Permanent Address" value={enrichedData.permanent_address} icon={Home} />
                        <DataField label="Domicile State" value={enrichedData.domicile} />
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Hostel Status</p>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${enrichedData.is_hosteller ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <p className="text-sm font-bold text-slate-700">{enrichedData.is_hosteller ? "Hosteller" : "Day Scholar"}</p>
                          </div>
                          {enrichedData.is_hosteller && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                              {enrichedData.hostel_name} (Room: {enrichedData.hostel_room})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && timelineData && (
                <motion.div 
                  key="timeline"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Clearance Stages</h3>
                      <p className="text-xs font-bold text-slate-600 mt-1">{timelineData.application.current_location}</p>
                    </div>
                    {timelineData.application.status === 'completed' && (
                      <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="divide-y divide-slate-50">
                    {timelineData.stages.map((stage, idx) => (
                      <div key={stage.id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 shrink-0
                            ${stage.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                              stage.status === 'rejected' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                              stage.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            {stage.status === 'approved' ? <CheckCircle size={14} /> : 
                             stage.status === 'rejected' ? <XCircle size={14} /> : 
                             <Clock size={14} />}
                          </div>
                          {idx !== timelineData.stages.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-100 my-1 group-hover:bg-slate-200 transition-colors" />
                          )}
                        </div>
                        
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{stage.display_name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stage.verifier_role}</p>
                            </div>
                            <StatusBadge status={stage.status} />
                          </div>
                          
                          {stage.comments && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 flex gap-2">
                              <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                              <span>{stage.comments}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationInspectionModal;