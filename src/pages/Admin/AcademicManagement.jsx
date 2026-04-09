import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Search, Trash2, 
  BookOpen, Layers, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Link2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import AddProgramModal from './AddProgramModal';
import AddSpecializationModal from './AddSpecializationModal';
import DeletePrograms from './DeleteProgram';
import DeleteSpecialization from './DeleteSpecialization';

const AcademicManagement = () => {
  const { authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('programmes');
  const [loading, setLoading] = useState(true);
  const [programmes, setProgrammes] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  
  // New Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 1. Modified: Load everything on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. Added: Separate effect to reset pagination when tab changes (without re-fetching)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // 3. Modified: Fetch logic to pull both endpoints simultaneously
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [progRes, specRes] = await Promise.all([
        authFetch('/api/admin/programmes'),
        authFetch('/api/admin/specializations')
      ]);

      if (progRes.ok) {
        const progData = await progRes.json();
        setProgrammes(progData);
      }
      
      if (specRes.ok) {
        const specData = await specRes.json();
        setSpecializations(specData);
      }
    } catch (error) {
      console.error("Failed to fetch academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Search Logic ---
  const filteredData = (activeTab === 'programmes' ? programmes : specializations).filter(item => {
    const q = searchQuery.toLowerCase();
    const parentName = activeTab === 'programmes' ? item.department_name : item.programme_name;
    const parentCode = activeTab === 'programmes' ? item.department_code : item.programme_code;

    return (
      item.name.toLowerCase().includes(q) || 
      item.code.toLowerCase().includes(q) ||
      parentName?.toLowerCase().includes(q) ||
      parentCode?.toLowerCase().includes(q)
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Updated Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Academic Structure</h1>
          <p className="text-slate-500 text-sm mt-1">Manage institutional academic records.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-slate-200 rounded-2xl p-3 px-5 shadow-sm flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Programmes</p>
              <p className="text-lg font-black text-blue-600">{programmes.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Specializations</p>
              <p className="text-lg font-black text-emerald-600">{specializations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls: Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-full lg:w-fit">
          <button 
            onClick={() => setActiveTab('programmes')}
            className={`flex-1 lg:flex-none px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'programmes' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Programmes
          </button>
          <button 
            onClick={() => setActiveTab('specializations')}
            className={`flex-1 lg:flex-none px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'specializations' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Specializations
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder:font-medium placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button 
            onClick={() => activeTab === 'programmes' ? setIsProgModalOpen(true) : setIsSpecModalOpen(true)}
            className="shrink-0 h-12 px-6 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-3 transition-all shadow-xl active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add {activeTab === 'programmes' ? 'Programme' : 'Specialization'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Content: Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-600  tracking-widest  text-center">S No.</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600  tracking-widest">Entity Name & Unique Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600  tracking-widest">
                  {activeTab === 'programmes' ? 'Linked Department' : 'Parent Programme'}
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600  tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Academic Data...</p>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-all duration-300 group">
                    <td className="px-6 py-5 text-[10px] font-black text-slate-500 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          {activeTab === 'programmes' ? <BookOpen size={16} /> : <Layers size={16} />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{item.name}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.code}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Link2 
                            size={14} 
                            className="text-blue-400 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out shrink-0" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-600">
                                {activeTab === 'programmes' ? (item.department_name || "N/A") : (item.programme_name || "N/A")}
                            </span>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
                                Code: {activeTab === 'programmes' ? (item.department_code || "N/A") : (item.programme_code || "N/A")}
                            </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDeleteModalOpen(true);
                        }} 
                        className="p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all  group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <AlertCircle className="h-12 w-12 text-slate-100 mx-auto" />
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">No entries matched your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Footer & Pagination */}
        {filteredData.length > itemsPerPage && (
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[36px] h-9 rounded-xl text-[10px] font-black transition-all ${
                      currentPage === i + 1 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProgramModal 
        isOpen={isProgModalOpen} 
        onClose={() => setIsProgModalOpen(false)} 
        onSuccess={fetchAllData} 
        authFetch={authFetch} 
      />
      <AddSpecializationModal 
        isOpen={isSpecModalOpen} 
        onClose={() => setIsSpecModalOpen(false)} 
        onSuccess={fetchAllData} 
        authFetch={authFetch} 
      />

      {/* Delete Modals */}
      {activeTab === 'programmes' ? (
        <DeletePrograms 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={fetchAllData}
          authFetch={authFetch}
          program={selectedItem}
        />
      ) : (
        <DeleteSpecialization 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={fetchAllData}
          authFetch={authFetch}
          specialization={selectedItem}
        />
      )}

    </div>
  );
};

export default AcademicManagement;