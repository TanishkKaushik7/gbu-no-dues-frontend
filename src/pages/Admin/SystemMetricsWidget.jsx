import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Server, Database, HardDrive, Cpu, 
  RefreshCw, Loader2, Globe, Zap, ShieldAlert, 
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SystemMetricsWidget = () => {
  const { authFetch } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [redis, setRedis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetching both general metrics and redis stats concurrently
      const [metricsRes, redisRes] = await Promise.all([
        authFetch('/api/metrics/dashboard-stats'),
        authFetch('/api/utils/redis-stats')
      ]);

      if (metricsRes.ok && redisRes.ok) {
        setMetrics(await metricsRes.json());
        setRedis(await redisRes.json());
      }
    } catch (error) {
      console.error("Health check failed", error);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const MetricBar = ({ label, value, icon: Icon, colorClass, suffix = "%" }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className="text-slate-600">{value}{suffix}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-700`} 
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          System Health
        </h3>
        <button 
          onClick={fetchData} 
          disabled={loading}
          className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !metrics ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Syncing Pulse...</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          
          {/* 1. Core Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">API Node</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Globe className={`h-3.5 w-3.5 ${metrics?.status === 'Online' ? 'text-emerald-500' : 'text-red-500'}`} /> 
                {metrics?.status || 'Offline'}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Cache Engine</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <Zap className={`h-3.5 w-3.5 ${redis?.status === 'Online' ? 'text-amber-500' : 'text-slate-300'}`} /> 
                {redis?.status || 'Offline'}
              </div>
            </div>
          </div>

          {/* 2. Redis Specific Insights (Security & Memory) */}
          <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-3">
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter flex items-center gap-1.5">
                 <ShieldAlert className="h-3 w-3" /> Rate Limiting & Cache
               </h4>
               <span className="text-[10px] font-bold text-indigo-400">{redis?.memory_used_human} Used</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[18px] font-black text-slate-800 leading-none">{redis?.active_rate_limits}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Active Blocks</span>
              </div>
              <div>
                <span className="block text-[18px] font-black text-slate-800 leading-none">{redis?.total_keys}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Tracked Keys</span>
              </div>
            </div>
          </div>

          {/* 3. Resource Load Bars */}
          <div className="space-y-4">
            <MetricBar label="CPU Load" value={metrics?.cpu || 0} icon={Cpu} colorClass="bg-slate-900" />
            <MetricBar label="System RAM" value={metrics?.ram || 0} icon={Server} colorClass="bg-indigo-600" />
            <MetricBar label="DB Latency" value={metrics?.db_latency_ms || 0} icon={Database} colorClass="bg-emerald-500" suffix="ms" />
          </div>

          {/* 4. Footer Metadata */}
          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div>
              <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Uptime</span>
              <span className="text-xs font-bold text-slate-600">
                {Math.floor(metrics?.uptime / 3600)}h {Math.floor((metrics?.uptime % 3600) / 60)}m
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Connections</span>
              <span className="text-xs font-bold text-slate-600 flex items-center justify-end gap-1">
                <Layers className="h-3 w-3" /> {redis?.connected_clients} Clients
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SystemMetricsWidget;