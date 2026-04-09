import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios'; 
import { 
  FiUser, FiLogOut, FiMenu, FiX, FiHome, FiFileText, 
  FiActivity 
} from 'react-icons/fi';

// Import Sub-components
import Overview from './Overview';
import MyApplications from './MyApplications';
import TrackStatus from './TrackStatus';
import StudentProfile from './StudentProfile'; // ✅ IMPORT NEW COMPONENT

// --- Constants ---
const STATUS_STEPS = ['Process initiation', 'Library', 'Hostel', 'Sports', 'CRC', 'Labs', 'Accounts', 'Completed'];

const DEFAULT_DEPT_SEQUENCE = [
  { idx: 0, id: 1, name: 'Department', sequence_order: 1 },
  { idx: 1, id: 2, name: 'Library', sequence_order: 2 },
  { idx: 2, id: 3, name: 'Hostel', sequence_order: 3 },
  { idx: 3, id: 4, name: 'Accounts', sequence_order: 4 },
  { idx: 4, id: 5, name: 'Sports', sequence_order: 5 },
  { idx: 5, id: 6, name: 'Exam Cell', sequence_order: 6 }
];

const StudentDashboard = () => {
  const { student: user, token, logout } = useStudentAuth();
  const navigate = useNavigate();

  // --- UI States ---
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- Data States ---
  const [profileData, setProfileData] = useState(null); // ✅ NEW: Store full profile

  const [formData, setFormData] = useState({
    enrollmentNumber: '', rollNumber: '', fullName: '', fatherName: '',
    motherName: '', gender: '', category: '', dob: '', mobile: '',
    email: '', domicile: '', permanentAddress: '', hostelName: '',
    hostelRoom: '', admissionYear: '', section: '', 
    departmentCode: '', 
    admissionType: '', proof_document_url: '', remarks: '', 
    schoolName: '' 
  });

  const [stepStatuses, setStepStatuses] = useState(() =>
    STATUS_STEPS.map(() => ({ status: 'pending', comment: '' }))
  );

  // --- Logic States ---
  const [locked, setLocked] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  
  const [applicationId, setApplicationId] = useState(null);
  const [applicationData, setApplicationData] = useState(null);

  const [departmentSteps, setDepartmentSteps] = useState(STATUS_STEPS);
  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const getAvatar = (identifier = Math.random().toString()) => {
  // Styles you can use: 'avataaars', 'adventurer', 'micah', 'fun-emoji'
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(identifier)}`;
};

  /* ---------- 1. FETCH FULL PROFILE DATA ---------- */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/students/me');
      setProfileData(res.data);
      
      const s = res.data;
      
      // ✅ FIX 1: Use 'prev' so we safely update without needing 'formData' in dependencies
      setFormData(prev => ({
        ...prev, // Retain anything the user just typed!
        enrollmentNumber: s.enrollment_number || prev.enrollmentNumber || '',
        rollNumber: s.roll_number || prev.rollNumber || '',
        fullName: s.full_name || prev.fullName || '',
        fatherName: s.father_name || prev.fatherName || '',
        motherName: s.mother_name || prev.motherName || '',
        gender: s.gender || prev.gender || '',
        category: s.category || prev.category || '',
        dob: s.dob || prev.dob || '',
        mobile: s.mobile_number || prev.mobile || '',
        email: s.email || prev.email || '',
        domicile: s.domicile || prev.domicile || '',
        permanentAddress: s.permanent_address || prev.permanentAddress || '',
        isHosteller: s.is_hosteller ? 'Yes' : (prev.isHosteller || 'No'),
        hostelName: s.hostel_name || prev.hostelName || '',
        hostelRoom: s.hostel_room || prev.hostelRoom || '',
        admissionYear: s.admission_year || prev.admissionYear || '',
        section: s.section || prev.section || '',
        departmentCode: s.department_code || prev.departmentCode || '',
        admissionType: s.admission_type || prev.admissionType || '',
        proof_document_url: prev.proof_document_url, // keep existing safely
        schoolName: s.school_name || prev.schoolName || '',
        remarks: prev.remarks || ''
      }));

      setLocked(prev => ({
        ...prev,
        enrollmentNumber: !!s.enrollment_number,
        rollNumber: !!s.roll_number,
        fullName: !!s.full_name,
        email: !!s.email
      }));

    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    }
  }, []); // ✅ FIX 2: Empty dependency array! Ensures it only runs once and doesn't wipe data.

  /* ---------- 2. FETCH STATUS LOGIC ---------- */
  const fetchApplicationStatus = useCallback(async () => {
    if (!user) return;
    setStatusLoading(true);
    
    try {
      const res = await api.get('/api/applications/my');
      const body = res.data;

      if (body?.application) {
          setApplicationId(body.application.id);
          setApplicationData(prev => ({ ...prev, ...body.application }));
      }

      const rejectedFlag = body?.flags?.is_rejected || (body?.application?.status === 'rejected');
      setIsRejected(rejectedFlag);
      
      if (rejectedFlag) {
        setRejectionDetails(body?.rejection_details || { 
          role: 'Authority', 
          remarks: body?.application?.remarks || 'Rejected' 
        });
        setLocked(prev => { 
            let unlocked = {}; 
            Object.keys(prev).forEach(k => unlocked[k] = false); 
            return unlocked; 
        });
      }

      const completedFlag = !!(body?.flags?.is_completed || body?.application?.status?.toLowerCase() === 'completed');
      setIsCompleted(completedFlag);

      const mapStageToStatus = (stage, body) => {
        if (!stage) return { status: 'pending', comment: '' };
        const s = (stage.status || '').toLowerCase();
        
        if (['completed', 'done', 'approved'].includes(s)) 
          return { status: 'completed', comment: stage.remarks || '' };
        if (['rejected', 'denied'].includes(s)) 
          return { status: 'failed', comment: stage.remarks || '' };
        
        if (body?.application && Number(body.application.current_stage_order) === Number(stage.sequence_order)) {
          return { status: 'in_progress', comment: stage.remarks || '' };
        }
        return { status: 'pending', comment: stage.remarks || '' };
      };

      let deptSeq = (body.departments || body.department_sequence || DEFAULT_DEPT_SEQUENCE);
      const stepLabels = deptSeq.map(d => d.name || d.department_name);
      if (!stepLabels.includes('Completed')) stepLabels.push('Completed');
      setDepartmentSteps(stepLabels);

      const stages = body.stages || [];
      const mappedStatuses = deptSeq.map(d => {
        const stage = stages.find(s => s.verifier_role?.toLowerCase() === d.name?.toLowerCase() || s.sequence_order === d.sequence_order);
        return mapStageToStatus(stage, body);
      });
      
      mappedStatuses.push(completedFlag ? { status: 'completed', comment: '' } : { status: 'pending', comment: '' });
      setStepStatuses(mappedStatuses);

    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) {
         setStatusError("Session Expired. Please Login Again.");
      } else {
         setStatusError(e.message);
      }
    } finally {
      setStatusLoading(false);
      setInitialLoading(false);
    }
  }, [user]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchProfile();
    fetchApplicationStatus(); 
  }, [fetchProfile, fetchApplicationStatus]);

  /* ---------- 3. HANDLE FILE UPLOAD ---------- */
  const handleChange = async (e) => {
    // ✅ Safety wrapper for the custom Shadcn component which might not have 'type' or 'files'
    const { name, value, type = 'text', files = [] } = e.target || {};
    
    if (locked[name] && !isRejected) return; 

    if (type === 'file') {
      const file = files[0];
      if (!file || file.type !== 'application/pdf') {
        setFormErrors(prev => ({ ...prev, [name]: 'Only PDF allowed' }));
        return;
      }
      
      setUploading(true);
      setUploadProgress(0);
      setFormErrors(prev => ({ ...prev, [name]: '' }));

      const data = new FormData();
      data.append('file', file);

      try {
        const res = await api.post('/api/utils/upload-proof', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });
        if (res.data.path) {
            setFormData(prev => ({ ...prev, proof_document_url: res.data.path }));
        }
      } catch (err) {
          setFormErrors(prev => ({ ...prev, [name]: 'Upload failed. Ensure file is PDF < 5MB.' }));
      } finally {
          setTimeout(() => setUploading(false), 500);
      }
      return; 
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ---------- 4. HANDLE SAVE ---------- */
  const handleSave = async (childPayload = null) => {
    setSubmitting(true);
    setSaveMessage('');
    
    try {
      let payload = childPayload || {
        proof_document_url: formData.proof_document_url,
        remarks: formData.remarks,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        gender: formData.gender,
        category: formData.category,
        dob: formData.dob,
        permanent_address: formData.permanentAddress,
        domicile: formData.domicile || formData.permanentAddress,
        section: formData.section,
        department_code: formData.departmentCode,
        admission_type: formData.admissionType,
        is_hosteller: formData.isHosteller === 'Yes',
        hostel_name: formData.hostelName,
        hostel_room: formData.hostelRoom,
        admission_year: parseInt(formData.admissionYear) || undefined
      };

      if (isRejected && applicationId) {
        await api.patch(`/api/applications/${applicationId}/resubmit`, payload);
        setSaveMessage('Resubmitted Successfully');
        setIsRejected(false);
      } else {
        await api.post('/api/applications/create', payload);
        setSaveMessage('Saved Successfully');
      }

      fetchApplicationStatus();
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error saving application';
      setSaveMessage(errorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // ✅ ADDED PROFILE TO MENU
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: FiHome },
    { id: 'profile', label: 'My Profile', icon: FiUser },
    { id: 'form', label: 'My Application', icon: FiFileText },
    { id: 'status', label: 'Track Status', icon: FiActivity },
  ];

  if (initialLoading) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Portal...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex items-stretch overflow-hidden font-sans relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[80%] lg:w-[60%] h-[60%] bg-blue-50/40 rounded-full blur-[120px] lg:blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[80%] lg:w-[60%] h-[60%] bg-indigo-50/40 rounded-full blur-[120px] lg:blur-[160px]" />
      </div>

      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-slate-900 text-white p-8 xl:p-10 justify-between relative z-20 shadow-2xl">
        <div>
          <div className="flex items-center gap-4 mb-12 xl:mb-16 px-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 p-1.5 border border-slate-100">
              <img src="https://www.gbu.ac.in/Content/img/logo_gbu.png" alt="GBU Logo" className="w-full h-full object-contain"/>
            </div>
            <h1 className="text-[12px] xl:text-sm font-black uppercase tracking-[0.25em]">Student Portal</h1>
          </div>

          <nav className="space-y-2 xl:space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-4 xl:gap-5 px-5 xl:px-6 py-4 xl:py-5 rounded-xl xl:rounded-2xl text-[11px] xl:text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 group ${
                  active === item.id 
                    ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} className={active === item.id ? 'text-blue-600' : 'group-hover:text-white transition-colors'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ✅ Dynamic Avatar User Footer */}
        <div className="pt-8 border-t border-slate-800/50 space-y-4 cursor-pointer" onClick={() => setActive('profile')}>
          <div className="px-4 py-3 xl:py-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 xl:gap-4 group hover:bg-white/[0.08] transition-all duration-300">
            <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full overflow-hidden bg-slate-800 shadow-lg border-2 border-slate-700 group-hover:border-blue-500 transition-colors">
              <img 
                src={getAvatar(profileData?.gender)} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] xl:text-[11px] font-black text-white truncate uppercase tracking-wider leading-none mb-1">
                {profileData?.full_name || 'Student'}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] xl:text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {profileData?.roll_number || 'Online'}
                </p>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 xl:px-6 py-3 xl:py-4 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <FiLogOut size={16} xl:size={18} />
              <span className="text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em]">Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <section className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="min-h-[72px] lg:h-24 border-b border-slate-50 flex items-center justify-between px-6 md:px-10 lg:px-14 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
              <FiMenu size={24} />
            </button>
            <h3 className="text-sm xl:text-base font-black text-slate-900 uppercase tracking-[0.15em] xl:tracking-[0.2em]">
              {menuItems.find(m => m.id === active)?.label}
            </h3>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#fcfdfe] overflow-x-hidden scroll-smooth">
          <div className="px-6 py-8 md:px-10 md:py-10 lg:px-14 xl:px-16 lg:py-14 max-w-[1440px] mx-auto w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={active} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full h-full"
              >
                {active === 'dashboard' && (
                  <Overview 
                    user={{ ...user, school_name: formData.schoolName }} 
                    formData={formData} 
                    stepStatuses={stepStatuses} 
                    setActive={setActive} 
                    applicationId={applicationId}
                    application={applicationData}
                    token={token}
                  />
                )}
                {/* ✅ ROUTE FOR PROFILE */}
                {active === 'profile' && (
                  <StudentProfile profileData={profileData} />
                )}
                {active === 'form' && (
                  <MyApplications
                    user={user} formData={formData} locked={locked} formErrors={formErrors}
                    submitting={submitting} 
                    uploading={uploading} 
                    uploadProgress={uploadProgress} 
                    saveMessage={saveMessage}
                    handleChange={handleChange} handleSave={handleSave}
                    hasSubmittedApplication={!!applicationId} isRejected={isRejected} rejectionDetails={rejectionDetails}
                    isCompleted={isCompleted}
                    stepStatuses={stepStatuses}
                    applicationId={applicationId} 
                    token={token}
                  />
                )}
                {active === 'status' && (
                  <TrackStatus 
                    stepStatuses={stepStatuses} 
                    departmentSteps={departmentSteps} 
                    loading={statusLoading} 
                    error={statusError} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </section>

      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] sm:w-80 bg-slate-900 z-[100] p-8 lg:hidden shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 p-1.5 border border-slate-100">
                      <img src="https://www.gbu.ac.in/Content/img/logo_gbu.png" alt="GBU Logo" className="w-full h-full object-contain" />
                    </div> 
                    <span className="text-white text-xs font-black uppercase tracking-widest">GBU Portal</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400 p-2 hover:text-white transition-colors">
                    <FiX size={24} />
                  </button>
                </div>
                <nav className="space-y-2">
                  {menuItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setActive(item.id); setSidebarOpen(false); }} 
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                        active === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 active:bg-white/5'
                      }`}
                    >
                      <item.icon size={20} /> {item.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* ✅ Mobile Avatar Sidebar block */}
              <div className="border-t border-slate-800/50 pt-6 mt-4">
                <div className="flex items-center gap-3 mb-6" onClick={() => { setActive('profile'); setSidebarOpen(false); }}>
                  <img src={getAvatar(profileData?.gender)} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-slate-700 bg-slate-800" />
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-wider">{profileData?.full_name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{profileData?.roll_number}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 text-slate-400 hover:text-rose-400 font-black uppercase tracking-widest transition-all bg-white/5 rounded-xl">
                  <FiLogOut size={18} /> End Session
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;