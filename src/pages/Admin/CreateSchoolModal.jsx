import React, { useState } from 'react';
import { X, Landmark, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreateSchoolModal = ({ isOpen, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase() // Enforce uppercase standard (e.g. SOICT)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Robust Error Handling (Handles Arrays/Pydantic errors)
        const msg = Array.isArray(data.detail) 
            ? data.detail[0].msg 
            : data.detail;
        throw new Error(msg || 'Failed to create school');
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setFormData({ name: '', code: '' });
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
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="relative px-8 py-10 text-center bg-blue-50/30 border-b border-blue-50">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-all shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex p-4 bg-white rounded-[1.5rem] mb-4 shadow-sm border border-blue-50">
            <Landmark className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Add Academic School</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Register a new school entity</p>
        </div>

        {showSuccess ? (
          <div className="p-16 text-center animate-in zoom-in-95 duration-500">
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">School Created</h3>
            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Database Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-[11px] rounded-2xl flex items-center gap-3 border border-rose-100 font-black uppercase tracking-wider animate-in shake-in">
                <AlertCircle className="h-4 w-4 shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* School Name Input */}
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Official School Name (e.g. School of ICT)" 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* School Code Input */}
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="School Code (e.g. SOICT)" 
                  required 
                  maxLength={10}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 uppercase tracking-wider font-mono"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                />
                <p className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wide">
                  Unique identifier used for student registration
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-black text-[10px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-[1.5] px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateSchoolModal;