import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/common/Sidebar';
// ✅ IMPORT THE CUSTOM API INSTANCE
import api from '../../api/axios'; 

// Standardized components across departments
import DashboardStats from './DashboardStats'; // Ensure this points to the shared component
import ApplicationsTable from './ApplicationsTable'; // Ensure this points to the shared/updated table
import ApplicationActionModal from './ApplicationActionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const LibraryDashboard = () => {
  const { user, logout } = useAuth();
  
  // State Management
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true); 
  const [isViewLoading, setIsViewLoading] = useState(false); 
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- 1. Fetch Library-Specific Pending Applications ---
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      
      // ✅ SWITCHED TO API INSTANCE
      const res = await api.get('/api/approvals/pending', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = res.data;
      
      // DEBUG: View raw response in console if list is empty
      console.log("Library Dashboard Raw Data:", data);

      const mappedApplications = Array.isArray(data)
        ? data.map(app => {
            // Greedy mapping: treat anything actionable as "Pending"
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
                // ✅ Capture Overdue Flags
                is_overdue: app.is_overdue || false,
                days_pending: app.days_pending || 0,
            };
          })
        : [];

      setApplications(mappedApplications);
    } catch (err) {
      console.error('Failed to fetch Library applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchApplications(); 
  }, [fetchApplications]);

  // --- 2. Fetch Enriched Details for Clearance Review ---
  const handleViewApplication = async (listApp) => {
    if (!listApp?.id) return;
    setIsViewLoading(true);
    setActionError(''); 

    try {
      // ✅ SWITCHED TO API INSTANCE
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
      console.error('Failed to fetch enriched library details:', err);
      setSelectedApplication(listApp);
    } finally {
      setIsViewLoading(false);
    }
  };

  // --- 3. Handle Library Approval/Rejection ---
  const handleLibraryAction = async (application, action, remarksIn) => {
    if (!application) return;
    setActionError('');
    
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks/Reason is required when rejecting clearance');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id;
    if (!stageId) return setActionError('No actionable stage found for Library clearance.');
  
    const libraryDeptId = user?.department_id || user?.school_id; 
    const verb = action === 'approve' ? 'approve' : 'reject';
    
    setActionLoading(true);
    try {
      // ✅ SWITCHED TO API INSTANCE
      await api.post(`/api/approvals/${stageId}/${verb}`, { 
        department_id: libraryDeptId || null, 
        remarks: remarksIn || null 
      });
  
      // ✅ Remove the student from the local dashboard list once processed
      setApplications(prev => prev.filter(app => app.id !== application.id));
      
      setSelectedApplication(null); 
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error processing Library action';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Search Logic ---
  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setApplications(prev => prev.map(a => ({
      ...a,
      match: (a.name + a.rollNo + a.displayId).toLowerCase().includes(q)
    })));
  };

  const filteredApplications = applications.filter(a => a.match !== false);
  const getStatusCount = (s) => applications.filter(a => a.status.toLowerCase() === s).length;
  
  // ✅ CALCULATE OVERDUE COUNT
  const overdueCount = applications.filter(a => a.is_overdue).length;

  const stats = { 
    total: applications.length, 
    pending: getStatusCount('pending'), 
    approved: getStatusCount('approved'), 
    rejected: getStatusCount('rejected'),
    overdue: overdueCount // ✅ Pass to Stats
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ✅ RESPONSIVE FIX: Added pt-16 on mobile for hamburger clearance, overflow-x-hidden */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-16 sm:p-6 lg:p-8">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="w-full max-w-[1920px] mx-auto space-y-4 sm:space-y-6"
          >
            
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {user?.department_name || 'Library'} 
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 mb-2 sm:mb-4">
                Review pending dues and issue library clearance.
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
          onAction={handleLibraryAction} 
          actionLoading={actionLoading} 
          actionError={actionError}
          userSchoolName={user?.department_name || 'Central Library'}
        />
      )}
    </div>
  );
};

export default LibraryDashboard;