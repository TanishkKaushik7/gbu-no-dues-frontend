import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Loader2, CheckCircle2, AlertCircle, Layers, Landmark, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// --- UTILITIES ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- CUSTOM SHADCN-LIKE SELECT COMPONENT (Indigo Theme) ---
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
          "flex w-full items-center justify-between py-3.5 px-5 rounded-2xl text-xs font-bold transition-all outline-none",
          disabled || loading 
            ? "opacity-100 bg-slate-50 text-slate-400 border border-transparent cursor-not-allowed" 
            : "cursor-pointer bg-indigo-50/50 border border-indigo-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:bg-indigo-50",
          error ? "border-rose-400 bg-rose-50/30 text-rose-700" : "text-slate-700",
          isOpen ? "ring-4 ring-indigo-500/10 border-indigo-500 bg-white" : ""
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {loading ? <Loader2 className="animate-spin w-4 h-4 shrink-0 text-slate-400" /> : Icon ? <Icon className="w-4 h-4 shrink-0 text-slate-400" /> : null}
          <span className={cn("truncate", !selectedOption && "text-slate-500 font-normal")}>
            {loading ? 'Loading Schools...' : selectedOption ? selectedOption.l : placeholder}
          </span>
        </div>
        <div className="flex items-center text-indigo-400 ml-2 shrink-0">
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
            className="absolute z-50 mt-1 max-h-[200px] w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl custom-scrollbar"
          >
            {!options || options.length === 0 ? (
              <div className="relative cursor-default select-none py-3 px-5 text-slate-500 font-medium text-center text-xs">
                No schools available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.v}
                  className={cn(
                    "relative cursor-pointer select-none py-3 pl-5 pr-10 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-colors",
                    value === option.v ? "bg-indigo-50/50 text-indigo-600" : "text-slate-700"
                  )}
                  onClick={() => {
                    onChange(option.v);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate">{option.l}</span>
                  {value === option.v && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-5 text-indigo-600">
                      <CheckCircle2 size={16} strokeWidth={3} />
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

const CreateDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Schools List State
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phase_number: 1, // Default to Phase 1 (Academic)
    school_code: ''  // Required only for Phase 1
  });

  // 1. Fetch Schools when Modal Opens
  useEffect(() => {
    if (isOpen) {
      const fetchSchools = async () => {
        setSchoolsLoading(true);
        try {
          const res = await authFetch('/api/admin/schools');
          if (res.ok) {
            const data = await res.json();
            setSchoolOptions(data);
          } else {
            console.error("Failed to fetch schools");
          }
        } catch (err) {
          console.error("Error loading schools:", err);
        } finally {
          setSchoolsLoading(false);
        }
      };
      fetchSchools();
    }
  }, [isOpen, authFetch]);

  // 2. Handle Phase Changes (Auto-clear school if not Academic)
  const handlePhaseChange = (newPhase) => {
    setFormData(prev => ({
      ...prev,
      phase_number: newPhase,
      school_code: newPhase === 1 ? prev.school_code : '' // Clear school if not Phase 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation: Phase 1 MUST have a school
      if (formData.phase_number === 1 && !formData.school_code) {
        throw new Error("Academic Departments (Phase 1) must be linked to a Parent School.");
      }

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        phase_number: parseInt(formData.phase_number),
        // Send school_code only for Academic departments
        school_code: formData.phase_number === 1 ? formData.school_code : null
      };

      const response = await authFetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        throw new Error(msg || 'Failed to create department');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({ name: '', code: '', phase_number: 1, school_code: '' });
        setShowSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="relative px-8 py-6 text-center bg-indigo-50/30 border-b border-indigo-50 shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-all shadow-sm z-10">
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex p-3 bg-white rounded-[1.2rem] mb-3 shadow-sm border border-indigo-50">
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Add Department</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Configure Academic or Admin Unit</p>
        </div>

        {/* Scrollable Form Area */}
        {showSuccess ? (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center">
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-6" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Department Created</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">System Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="space-y-6">
              
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 text-[11px] rounded-2xl flex items-center gap-3 border border-rose-100 font-black uppercase tracking-wider animate-in shake-in">
                  <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
                </div>
              )}

              {/* Code & Name */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                  <input 
                    type="text" placeholder="CSE" required maxLength={10}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all uppercase font-mono tracking-wider text-center"
                    value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="col-span-2 space-y-2 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Name</label>
                  <input 
                    type="text" placeholder="e.g. Computer Science" required 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Workflow Phase Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Layers size={12} /> Approval Workflow Phase
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { val: 1, label: "Phase 1: Academic", desc: "Must be linked to a School (e.g. CSE -> SOICT)" },
                    { val: 2, label: "Phase 2: Administrative", desc: "Central Dept (Library, Hostel, Sports)" },
                    { val: 3, label: "Phase 3: Accounts", desc: "Final Clearance (Finance Only)" }
                  ].map((option) => (
                    <button
                      key={option.val} type="button"
                      onClick={() => handlePhaseChange(option.val)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                        formData.phase_number === option.val 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className={`text-xs font-black uppercase tracking-wider truncate ${formData.phase_number === option.val ? 'text-white' : 'text-slate-700'}`}>{option.label}</p>
                        <p className={`text-[10px] font-medium mt-0.5 truncate ${formData.phase_number === option.val ? 'text-indigo-100' : 'text-slate-400'}`}>{option.desc}</p>
                      </div>
                      {formData.phase_number === option.val && <CheckCircle2 className="h-5 w-5 text-indigo-200 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Dropdown (Visible ONLY for Phase 1) */}
              {formData.phase_number === 1 && (
                <div className="space-y-2 animate-in slide-in-from-top-2 pt-2">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Landmark size={12} /> Link to School (Required)
                  </label>
                  <div className="relative">
                    <ShadcnSelect
                      value={formData.school_code}
                      onChange={(val) => setFormData({...formData, school_code: val})}
                      options={schoolOptions.map(s => ({ v: s.code, l: `${s.name} (${s.code})` }))}
                      placeholder="-- Select Parent School --"
                      loading={schoolsLoading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-8 mt-auto">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 hover:bg-slate-50 uppercase tracking-[0.2em] transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-[1.5] px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] hover:bg-indigo-700 shadow-xl shadow-indigo-200 uppercase tracking-[0.2em] transition-all active:scale-[0.98]">{isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm'}</button>
            </div>
          </form>
        )}
      </div>
      
      {/* Scrollbar Style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CreateDepartmentModal;