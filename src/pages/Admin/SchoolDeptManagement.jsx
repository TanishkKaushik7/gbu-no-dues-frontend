import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, GraduationCap, Plus, Trash2, Edit2, 
  Search, Landmark, Loader2, ShieldCheck, 
  Layers, School, BookOpen, Link as LinkIcon,
  ChevronLeft, ChevronRight, FlaskConical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CreateSchoolModal from './CreateSchoolModal';
import CreateDepartmentModal from './CreateDepartmentModal';
import DeleteStructureModal from './DeleteStructureModal';

const SchoolDeptManagement = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('schools'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schoolMap, setSchoolMap] = useState({});

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  
  const [deleteConfig, setDeleteConfig] = useState({ 
    isOpen: false, id: null, name: '', type: '' 
  });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // --- Toggle Lab Clearance State ---
  const [togglingId, setTogglingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [schoolRes, deptRes] = await Promise.all([
        authFetch('/api/admin/schools'),
        authFetch('/api/admin/departments')
      ]);
      
      if (schoolRes.ok && deptRes.ok) {
        const schoolData = await schoolRes.json();
        const deptData = await deptRes.json();

        setSchools(schoolData.map(s => ({ ...s, type: 'school' })));
        setDepartments(deptData.map(d => ({ ...d, type: 'department' })));

        const sMap = {};
        schoolData.forEach(s => { sMap[s.id] = s.code; });
        setSchoolMap(sMap);
      } else {
        throw new Error("Failed to synchronize with server.");
      }
    } catch (error) {
      setError("Unable to load university structure.");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter items based on tab and search
  const filteredItems = useMemo(() => {
    let items = activeTab === 'schools' ? schools : departments;

    if (!searchTerm) return items;
    const lowerTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerTerm) || 
      item.code?.toLowerCase().includes(lowerTerm)
    );
  }, [activeTab, schools, departments, searchTerm]);

  // --- Core Pagination Logic ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  // Reset to page 1 if search term or tab changes to avoid "empty" pages
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const initiateDelete = (item) => {
    setDeleteConfig({ isOpen: true, id: item.id, name: item.name, type: item.type });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfig.id) return;
    setIsDeleteLoading(true);
    try {
      const endpoint = deleteConfig.type === 'school' 
        ? `/api/admin/schools/${deleteConfig.id}`
        : `/api/admin/departments/${deleteConfig.id}`;

      const response = await authFetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        setDeleteConfig({ isOpen: false, id: null, name: '', type: '' });
        fetchData();
      } else {
        const errData = await response.json();
        alert(errData.detail || `Deletion blocked.`);
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // --- Toggle Lab Clearance Function ---
  const handleToggleLabClearance = async (school) => {
    setTogglingId(school.id); // Keep tracking loading state by ID
    try {
      const newStatus = !school.requires_lab_clearance;
      
      // CHANGED: Now passing school.code (e.g., "SOICT") in the URL
      const response = await authFetch(`/api/common/${school.code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requires_lab_clearance: newStatus })
      });

      if (response.ok) {
        // Update local state instantly for snappy UI
        setSchools(prev => prev.map(s => 
          s.id === school.id ? { ...s, requires_lab_clearance: newStatus } : s
        ));
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.detail || "Failed to update lab clearance requirement.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Structure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">University Structure</h1>
          <p className="text-slate-500 text-sm mt-1">Manage institutional hierarchy.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-slate-200 rounded-2xl p-3 px-5 shadow-sm flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Schools</p>
              <p className="text-lg font-black text-indigo-600">{schools.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Depts</p>
              <p className="text-lg font-black text-emerald-600">{departments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex w-full md:w-auto gap-1">
          <button 
            onClick={() => handleTabChange('schools')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'schools' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Landmark className="h-4 w-4" /> Schools
          </button>
          <button 
            onClick={() => handleTabChange('departments')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'departments' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Layers className="h-4 w-4" /> All Departments
          </button>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button 
            onClick={() => activeTab === 'schools' ? setIsSchoolModalOpen(true) : setIsDeptModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" /> Add {activeTab === 'schools' ? 'School' : 'Dept'}
          </button>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50 min-h-[400px]">
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 px-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105 ${item.type === 'school' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    {item.type === 'school' ? <Landmark className="h-6 w-6" /> : <Layers className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 tracking-tight">{item.name}</h3>
                      {item.type === 'department' && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${item.phase_number === 1 ? 'bg-blue-100 text-blue-700' : item.phase_number === 2 ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                          Phase {item.phase_number}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.code}</span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-widest">ID: {item.id}</span>
                      
                      {/* DEPARTMENTS: Show linked school */}
                      {item.type === 'department' && item.school_id && schoolMap[item.school_id] && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                          <LinkIcon size={10} /> {schoolMap[item.school_id]}
                        </span>
                      )}

                      {/* SCHOOLS: Clickable Lab Clearance Toggle Button (Redesigned) */}
                      {item.type === 'school' && (
                        <>
                          <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                          <button
                            onClick={() => handleToggleLabClearance(item)}
                            disabled={togglingId === item.id}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 border ${
                              item.requires_lab_clearance 
                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:shadow-md' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            } ${togglingId === item.id ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                            title="Click to toggle lab clearance requirement"
                          >
                            {togglingId === item.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <FlaskConical size={12} className={item.requires_lab_clearance ? "text-indigo-200" : "text-slate-400"} />
                            )}
                            {item.requires_lab_clearance ? 'Labs Required' : 'No Labs Required'}
                          </button>
                        </  >
                      )}

                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => initiateDelete(item)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <Search className="h-8 w-8 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No matching results found</p>
            </div>
          )}
        </div>

        {/* --- Pagination Footer --- */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1 px-3">
                <span className="text-xs font-black text-indigo-600">{currentPage}</span>
                <span className="text-xs font-bold text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-400">{totalPages}</span>
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSchoolModal isOpen={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} onSuccess={fetchData} />
      <CreateDepartmentModal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} onSuccess={fetchData} />
      <DeleteStructureModal 
        isOpen={deleteConfig.isOpen} 
        onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })} 
        onConfirm={handleDeleteConfirm} 
        itemName={deleteConfig.name} itemType={deleteConfig.type} isLoading={isDeleteLoading} 
      />
    </div>
  );
};

export default SchoolDeptManagement;