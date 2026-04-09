import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/common/Sidebar';
// ✅ IMPORT THE CUSTOM API INSTANCE
import api from '../../api/axios'; 

// Reusing standardized components for consistency across departments
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

const SportsDashboard = () => {
  const { user, logout } = useAuth();
  
  // State Management
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true); 
  const [isViewLoading, setIsViewLoading] = useState(false); 
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- 1. Fetch Sports-Specific Pending Applications ---
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      
      // ✅ SWITCHED TO API INSTANCE
      const res = await api.get('/api/approvals/pending', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const data = res.data;
      
      // DEBUG: Verify raw response in console if list is unexpectedly empty
      console.log("Sports Dashboard Raw Data:", data);

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
            };
          })
        : [];

      setApplications(mappedApplications);
    } catch (err) {
      console.error('Failed to fetch Sports applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchApplications(); 
  }, [fetchApplications]);

  // --- 2. Fetch Detailed Application Info for Review ---
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
      console.error('Failed to fetch enriched sports details:', err);
      setSelectedApplication(listApp);
    } finally {
      setIsViewLoading(false);
    }
  };

  // --- 3. Handle Sports Approval/Rejection ---
  const handleSportsAction = async (application, action, remarksIn) => {
    if (!application) return;
    setActionError('');
    
    if (action === 'reject' && (!remarksIn || !remarksIn.trim())) {
      setActionError('Remarks are required when rejecting clearance');
      return;
    }
  
    const stageId = application?.active_stage?.stage_id;
    if (!stageId) return setActionError('No actionable stage found for Sports clearance.');
  
    const deptId = user?.department_id || user?.school_id; 
    const verb = action === 'approve' ? 'approve' : 'reject';
    
    setActionLoading(true);
    try {
      // ✅ SWITCHED TO API INSTANCE
      await api.post(`/api/approvals/${stageId}/${verb}`, { 
        department_id: deptId || null, 
        remarks: remarksIn || null 
      });

      // ✅ Filter out processed student from the dashboard view
      setApplications(prev => prev.filter(app => app.id !== application.id));
      
      setSelectedApplication(null); 
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error processing Sports action';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Search Filtering ---
  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setApplications(prev => prev.map(a => ({
      ...a,
      match: (a.name + a.rollNo + a.displayId).toLowerCase().includes(q)
    })));
  };

  const filteredApplications = applications.filter(a => a.match !== false);
  const getStatusCount = (s) => applications.filter(a => a.status.toLowerCase() === s).length;
  
  const stats = { 
    total: applications.length, 
    pending: getStatusCount('pending'), 
    approved: getStatusCount('approved'), 
    rejected: getStatusCount('rejected') 
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar user={user} logout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {user?.department_name || 'Sports'}
              </h1>
              <p className="text-gray-600 mb-6">Review equipment returns and process sports clearance.</p>
            </motion.div>

            <DashboardStats stats={stats} />

            <ApplicationsTable 
              applications={filteredApplications} 
              isLoading={isLoading} 
              isViewLoading={isViewLoading} 
              onView={handleViewApplication} 
              onSearch={handleSearch} 
              onRefresh={fetchApplications}
            />

          </motion.div>
        </main>
      </div>

      {selectedApplication && (
        <ApplicationActionModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)}
          onAction={handleSportsAction} 
          actionLoading={actionLoading} 
          actionError={actionError}
          userSchoolName={user?.department_name || 'Sports Department'}
        />
      )}
    </div>
  );
};

export default SportsDashboard;