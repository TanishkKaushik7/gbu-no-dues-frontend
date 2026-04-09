import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import api from '../../api/axios'; 

// Shared Components
import DashboardStats from './DashboardStats'; 
import ApplicationsTable from './ApplicationsTable'; 
import ApplicationActionModal from './ApplicationActionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const OfficeDashboard = () => {
  // ✅ Accessing user details from AuthContext
  const { user, logout } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isViewLoading, setIsViewLoading] = useState(false); 
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Determine the Display Title (e.g., SOICT Office)
  const officeTitle = user?.school_name 
    ? `${user.school_name}` 
    : (user?.name || 'Registrar Office');

  // --- 1. Fetch Office-Specific Pending Applications ---
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      
      // The backend uses the token to identify the user's school_id (e.g., ID 1 for SOICT)
      const res = await api.get('/api/approvals/pending', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = res.data;

      const mappedApplications = Array.isArray(data)
        ? data.map(app => {
            const rawStatus = (app.status || '').toLowerCase();
            const isFinalized = ['approved', 'rejected', 'completed'].includes(rawStatus);

            return {
                id: app.application_id,
                displayId: app.display_id || '—',
                rollNo: app.roll_number || '',
                enrollment: app.enrollment_number || '',
                name: app.student_name || '',
                date: app.created_at || '',
                status: isFinalized ? (app.status || 'Processed') : 'Pending',
                current_location: app.current_location || '',
                active_stage: app.active_stage || null, 
                match: true, 
                is_overdue: app.is_overdue || false,
                days_pending: app.days_pending || 0,
            };
          })
        : [];

      setApplications(mappedApplications);
    } catch (err) {
      console.error('Failed to fetch Office applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchApplications(); 
  }, [fetchApplications]);

  // --- 2. Fetch Detailed Data for Review ---
  const handleViewApplication = async (listApp) => {
    if (!listApp?.id) return;
    setIsViewLoading(true);
    setActionError(''); 

    try {
      const res = await api.get(`/api/approvals/enriched/${listApp.id}`);
      const details = res.data;

      const enrichedApp = {
        ...details,
        id: details.application_id,
        displayId: details.display_id,
        rollNo: details.roll_number,
        enrollment: details.enrollment_number,
        name: details.student_name,
        date: details.created_at,
        status: details.application_status || details.status,
        active_stage: details.actionable_stage || listApp.active_stage, 
        proof_url: details.proof_document_url
      };

      setSelectedApplication(enrichedApp);
    } catch (err) {
      console.error('Failed to fetch enriched office details:', err);
      setSelectedApplication(listApp);
    } finally {
      setIsViewLoading(false);
    }
  };

  // --- 3. Handle Office Approval/Rejection ---
  const handleOfficeAction = async (application, action, remarksIn) => {
    if (!application) return;
    setActionError('');
    
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks are required for rejection');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id;
    if (!stageId) return setActionError('No actionable stage found for Office clearance.');
  
    // ✅ Logic: Use department_id if present, else use school_id (Common for Office Staff)
    const officeIdentifierId = user?.department_id || user?.school_id; 
    const verb = action === 'approve' ? 'approve' : 'reject';
    
    setActionLoading(true);
    try {
      await api.post(`/api/approvals/${stageId}/${verb}`, { 
        department_id: user?.department_id || null, 
        school_id: user?.school_id || null, // Explicitly pass school_id for Office clearance
        remarks: remarksIn || null 
      });
  
      setApplications(prev => prev.filter(app => app.id !== application.id));
      setSelectedApplication(null); 
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error processing Office action';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setApplications(prev => prev.map(a => ({
      ...a,
      match: (a.name + a.rollNo + a.displayId).toLowerCase().includes(q)
    })));
  };

  const filteredApplications = applications.filter(a => a.match !== false);
  const getStatusCount = (s) => applications.filter(a => a.status.toLowerCase() === s).length;
  const overdueCount = applications.filter(a => a.is_overdue).length;

  const stats = { 
    total: applications.length, 
    pending: getStatusCount('pending'), 
    approved: getStatusCount('approved'), 
    rejected: getStatusCount('rejected'),
    overdue: overdueCount 
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-16 sm:p-6 lg:p-8">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="w-full max-w-[1920px] mx-auto space-y-4 sm:space-y-6"
          >
            
            <motion.div variants={itemVariants}>
              {/* ✅ Dynamic Title: "School of Information & Communication Technology Office" */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {officeTitle}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 mb-2 sm:mb-4">
                Verify administrative dues for {user?.school_name || 'the school'} and issue final office clearance.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
                <DashboardStats stats={stats} />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
                <ApplicationsTable 
                  applications={filteredApplications} 
                  isLoading={isLoading} 
                  isViewLoading={isViewLoading} 
                  onView={handleViewApplication} 
                  onSearch={handleSearch} 
                  onRefresh={fetchApplications}
                />
            </motion.div>

          </motion.div>
        </main>
      </div>

      {selectedApplication && (
        <ApplicationActionModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)}
          onAction={handleOfficeAction} 
          actionLoading={actionLoading} 
          actionError={actionError}
          // ✅ Passing the school name to the modal for consistent UI
          userSchoolName={user?.school_name || 'Central Office'}
        />
      )}
    </div>
  );
};

export default OfficeDashboard;