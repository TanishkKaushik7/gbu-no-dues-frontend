import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, BookOpen, AlertCircle, Check, ChevronDown } from 'lucide-react';

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- CUSTOM SHADCN-LIKE SELECT COMPONENT ---
const ShadcnSelect = ({ value, onChange, options, placeholder, disabled, error, icon: Icon, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options?.find(opt => opt.v === value);

  return (
    <div className="relative" ref={ref}>
      {/* Hidden input to maintain native HTML form 'required' validation */}
      <input type="text" required value={value} onChange={() => {}} className="absolute opacity-0 w-0 h-0 -z-10" tabIndex={-1} />
      
      <div 
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between h-12 px-5 rounded-2xl text-sm font-bold transition-all outline-none",
          disabled || loading 
            ? "opacity-100 bg-slate-50 text-slate-400 border border-transparent cursor-not-allowed" 
            : "cursor-pointer bg-slate-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 hover:bg-slate-100",
          error ? "border-rose-400 bg-rose-50/30 text-rose-700" : "text-slate-700",
          isOpen ? "ring-4 ring-blue-500/5 border-blue-400 bg-white" : ""
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {loading ? <Loader2 className="animate-spin w-4 h-4 shrink-0 text-slate-400" /> : Icon ? <Icon className="w-4 h-4 shrink-0 text-slate-400" /> : null}
          <span className={cn("truncate", !selectedOption && "text-slate-400 font-normal")}>
            {loading ? 'Loading...' : selectedOption ? selectedOption.l : placeholder}
          </span>
        </div>
        <div className="flex items-center text-slate-400 ml-2 shrink-0">
          <ChevronDown className={cn("transition-transform duration-200", isOpen && "rotate-180")} size={16} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-[250px] w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl custom-scrollbar"
          >
            {!options || options.length === 0 ? (
              <div className="relative cursor-default select-none py-3 px-5 text-slate-500 font-medium text-center text-sm">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.v}
                  className={cn(
                    "relative cursor-pointer select-none py-3 pl-5 pr-10 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition-colors",
                    value === option.v ? "bg-blue-50/50 text-blue-600" : "text-slate-700"
                  )}
                  onClick={() => {
                    onChange(option.v);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate">{option.l}</span>
                  {value === option.v && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-5 text-blue-600">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---
const AddProgramModal = ({ isOpen, onClose, onSuccess, authFetch }) => {
  const [formData, setFormData] = useState({ name: '', code: '', departmentCode: '' });
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deptOptions, setDeptOptions] = useState([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // 1. Fetch Academic Departments on Load
  useEffect(() => {
    if (isOpen) {
      const fetchDepts = async () => {
        setIsLoadingDepts(true);
        setFetchError('');
        try {
          // ✅ Use the 'type=academic' filter to get only relevant depts
          const res = await authFetch('/api/common/departments?type=academic');
          if (res.ok) {
            const data = await res.json();
            setDeptOptions(data);
            // Auto-select first option if available
            if (data.length > 0 && !formData.departmentCode) {
               setFormData(prev => ({ ...prev, departmentCode: data[0].code }));
            }
          } else {
            setFetchError("Failed to load departments");
          }
        } catch (err) {
          console.error("An unexpected error occurred.");
          setFetchError("Network error loading lists");
        } finally {
          setIsLoadingDepts(false);
        }
      };
      fetchDepts();
    }
  }, [isOpen, authFetch, formData.departmentCode]); // Only run when modal opens

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/admin/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase().trim(), // Standardize code
          department_code: formData.departmentCode // Send the code from dropdown
        })
      });

      if (res.ok) {
        setFormData({ name: '', code: '', departmentCode: '' });
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.detail || "Action failed");
      }
    } catch (error) {
      alert("Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Programme</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Academic Database</p>
                 </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Department Dropdown (Dynamic UI) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShadcnSelect
                    value={formData.departmentCode}
                    onChange={(val) => setFormData({...formData, departmentCode: val})}
                    options={deptOptions.map(dept => ({ v: dept.code, l: `${dept.name} (${dept.code})` }))}
                    placeholder="Select Department"
                    loading={isLoadingDepts}
                    error={!!fetchError}
                  />
                </div>
                {fetchError && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 ml-1">
                        <AlertCircle size={10} /> {fetchError}
                    </p>
                )}
              </div>

              {/* Program Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none text-slate-700"
                  placeholder="e.g. Bachelor of Technology (CSE)"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Unique Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Code</label>
                <input 
                  required
                  className="w-full h-12 px-5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 text-sm font-bold transition-all outline-none uppercase placeholder:normal-case text-slate-700"
                  placeholder="e.g. BTECH_CSE"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
                <p className="text-[9px] font-bold text-slate-400 ml-1">Must be unique across the university.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || isLoadingDepts}
                  className="flex-[2] h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  <span>Create Programme</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </AnimatePresence>
  );
};

export default AddProgramModal;