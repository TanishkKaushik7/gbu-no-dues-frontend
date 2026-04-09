import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RecentLogsWidget = ({ onNavigate }) => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentLogs = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/api/admin/audit-logs?limit=5');
        if (response.ok) {
          const data = await response.json();
          setLogs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching recent logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentLogs();
  }, [authFetch]);

  // Helper to parse the student roll from the stringified details field
  const getStudentRoll = (log) => {
    try {
      if (typeof log.details === 'string') {
        const parsed = JSON.parse(log.details);
        return parsed.student_roll || 'N/A';
      }
      return log.details?.student_roll || 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  // ✅ HELPER: Format Time to IST correctly
  const formatTimeIST = (dateString) => {
    if (!dateString) return '--:--';
    
    // 1. Force UTC interpretation by appending 'Z' if missing
    // This tells the browser: "The server sent this in UTC"
    const utcString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    
    const date = new Date(utcString);

    // 2. Convert to Indian Standard Time
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-blue-600" />
          Recent Activity
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Feed</span>
      </div>

      {/* Activity Timeline */}
      <div className="relative flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
            <p className="text-xs font-bold uppercase tracking-tighter">Syncing IST...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-0">
            {logs.map((log, index) => {
              const isRejected = log.action.includes('REJECT');
              
              return (
                <div key={log.id} className="group relative flex gap-3 pb-4 last:pb-0">
                  {/* Vertical Connector Line */}
                  {index !== logs.length - 1 && (
                    <span className="absolute left-[13.5px] top-8 w-px h-[calc(100%-12px)] bg-slate-100" aria-hidden="true" />
                  )}

                  {/* Status Icon */}
                  <div className="relative z-10 flex items-start pt-0.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                      isRejected ? 'bg-red-50' : 'bg-emerald-50'
                    }`}>
                      {isRejected ? (
                        <XCircle className="h-3.5 w-3.5 text-red-600" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </div>
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold text-slate-900 leading-tight truncate mr-2">
                        {log.actor_name || 'System'} 
                        <span className="font-normal text-slate-500 mx-1">
                          {isRejected ? 'rejected' : 'approved'}
                        </span>
                        <span className="text-blue-600 font-mono font-bold">
                          {getStudentRoll(log)}
                        </span>
                      </p>
                      
                      {/* ✅ FIXED TIME DISPLAY */}
                      <time className="text-[9px] font-bold text-slate-400 whitespace-nowrap pt-0.5">
                        {formatTimeIST(log.timestamp)}
                      </time>
                    </div>

                    {/* Remarks Box */}
                    {log.remarks && (
                      <div className="mt-1.5 p-2 bg-slate-50/80 rounded-lg border border-slate-100 group-hover:bg-blue-50/40 transition-colors">
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">
                          "{log.remarks}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400 font-bold uppercase">No activity logs</div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-50">
        <button 
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] group"
        >
          Full Audit Trail
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default RecentLogsWidget;