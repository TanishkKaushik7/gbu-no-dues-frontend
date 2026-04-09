import React, { useState } from 'react';
import { 
  Download, FileSpreadsheet, CheckCircle2, 
  Loader2, AlertCircle, FileText, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Reports = () => {
  const { authFetch } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const endpoint = '/api/admin/reports/export-cleared';
      const response = await authFetch(endpoint);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to generate report");
      }

      const blob = await response.blob();
      const fileName = `GBU_Cleared_Students_${new Date().toISOString().split('T')[0]}.csv`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
      
      {/* 1. Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-slate-900 text-white mb-4 shadow-xl shadow-slate-200">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">University Reports</h1>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Generate and download official student clearance records for the current academic session.
        </p>
      </div>

      {/* 2. Main Action Card */}
      <div className="relative group">
        {/* Decorative background element */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        
        <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Report Illustration/Icon */}
              <div className="h-24 w-24 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">Live Data</span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">CSV Format</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">Cleared Students Master List</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Comprehensive export of all students who have successfully bypassed all departmental checkpoints.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in shake duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Download Button */}
            <div className="mt-10">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`
                  w-full py-5 rounded-2xl flex items-center justify-center gap-4 text-white font-black text-sm uppercase tracking-[0.15em] shadow-2xl transition-all active:scale-[0.97]
                  ${isGenerating 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-emerald-600 shadow-emerald-200 hover:-translate-y-1'
                  }
                `}
              >
                {isGenerating ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Compiling Records...</>
                ) : (
                  <><Download className="h-5 w-5" /> Download Master CSV</>
                )}
              </button>
            </div>
          </div>

          {/* Card Footer Info */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Verified by University Registrar System
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
              Last Sync: <span className="text-slate-600">Just Now</span>
            </div>
          </div>
        </div>
      </div>
 </div>
  );
};

export default Reports;