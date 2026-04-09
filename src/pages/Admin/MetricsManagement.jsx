import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, Server, Database, Mail, Clock, RefreshCw, 
  Trash2, Users, Loader2, AlertCircle, HardDrive, Zap
} from 'lucide-react';
import ClearCacheModal from './ClearCacheModal'; 

// Framer Motion Variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const MetricsManagement = () => {
  const { authFetch } = useAuth();
  
  // Data States
  const [health, setHealth] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [redisStats, setRedisStats] = useState(null);
  const [trafficStats, setTrafficStats] = useState(null);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScope, setActiveScope] = useState(null);

  // ✅ FIX: Fetch independently so fast endpoints render immediately
  const fetchAllMetrics = useCallback(() => {
    setLoading(true);
    setError(null);

    // 1. Health
    authFetch('/api/metrics/health')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setHealth(data))
      .catch(err => console.error("Health fetch failed", err));

    // 2. Dashboard Stats (Usually the slowest)
    authFetch('/api/metrics/dashboard-stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setDashStats(data))
      .catch(err => console.error("Dash stats fetch failed", err));

    // 3. Redis
    authFetch('/api/metrics/redis-stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setRedisStats(data))
      .catch(err => console.error("Redis fetch failed", err));

    // 4. Traffic
    authFetch('/api/metrics/traffic-stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setTrafficStats(data))
      .catch(err => console.error("Traffic fetch failed", err))
      .finally(() => setLoading(false)); // Stop spin animation when last one completes

  }, [authFetch]);

  useEffect(() => {
    fetchAllMetrics();
    const interval = setInterval(fetchAllMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchAllMetrics]);

  const handleClearCache = async (scope) => {
    setActiveScope(scope);
    setClearingCache(true);
    try {
      const res = await authFetch(`/api/metrics/clear-cache?scope=${scope}`, { method: 'POST' });
      if (res.ok) {
        setIsModalOpen(false);
        fetchAllMetrics();
      }
    } catch (err) {
      alert("Network error occurred while clearing cache");
    } finally {
      setClearingCache(false);
      setActiveScope(null);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d > 0 ? d + 'd ' : ''}${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center shadow-md">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">System Metrics</h2>
              <p className="text-sm font-medium text-gray-500 mt-0.5">Live monitoring & infrastructure health</p>
            </div>
          </div>

          <button 
            onClick={fetchAllMetrics}
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="h-5 w-5" /> {error}
          </motion.div>
        )}

        {/* MAIN CONTENT GRID */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          
          {/* COLUMN 1: INFRASTRUCTURE */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* SERVER HEALTH */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
              {/* Local Loader */}
              {!health && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-blue-500" /></div>}
              
              <h3 className="text-xs font-bold text-gray-400 mb-5 flex items-center gap-2 uppercase tracking-wider">
                <Server className="h-4 w-4 text-blue-500" /> Infrastructure Health
              </h3>
              
              <div className="space-y-2">
                {/* DB Connection */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Database className="h-4 w-4 text-gray-400" /> Database
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${health?.database === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {health?.database || 'Unknown'}
                  </span>
                </div>

                {/* DB Latency */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Zap className="h-4 w-4 text-amber-500" /> DB Latency
                  </div>
                  <span className={`text-sm font-semibold ${health?.database_latency_ms > 300 ? 'text-red-600' : 'text-green-600'}`}>
                    {health?.database_latency_ms ? `${health.database_latency_ms}ms` : '--'}
                  </span>
                </div>

                {/* Redis Latency */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Activity className="h-4 w-4 text-purple-500" /> Redis Latency
                  </div>
                  <span className={`text-sm font-semibold ${health?.redis_latency_ms > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {health?.redis_latency_ms ? `${health.redis_latency_ms}ms` : '--'}
                  </span>
                </div>

                {/* SMTP Server */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" /> SMTP Server
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${health?.smtp_server === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {health?.smtp_server || 'Offline'}
                  </span>
                </div>

                {/* Uptime */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400" /> Uptime
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatUptime(health?.uptime_seconds)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* REDIS STORAGE */}
            <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
              {!redisStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-purple-500" /></div>}
              
              <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                      <HardDrive className="h-4 w-4 text-purple-500" /> Redis Storage
                  </h3>
                  <button 
                      onClick={() => setIsModalOpen(true)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      title="Clear Cache"
                  >
                      <Trash2 size={16} />
                  </button>
              </div>

              {redisStats?.status === 'Online' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">Memory Used</p>
                    <p className="text-2xl font-semibold text-gray-900">{redisStats.metrics.memory.used}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">Total Keys</p>
                    <p className="text-2xl font-semibold text-gray-900">{redisStats.metrics.db.total_keys}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 text-sm font-medium">
                  Redis Layer Offline
                </div>
              )}
            </motion.div>
          </div>

          {/* COLUMN 2 & 3: APPLICATION DATA */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* TOP COUNTERS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {!dashStats && <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-blue-500" /></div>}
              
              {[
                { label: 'Total Apps', value: dashStats?.metrics?.total_applications || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Completed', value: dashStats?.metrics?.completed || 0, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Pending', value: dashStats?.metrics?.pending || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Rejected', value: dashStats?.metrics?.rejected || 0, color: 'text-red-600', bg: 'bg-red-50' },
              ].map((stat, idx) => (
                <motion.div 
                  key={idx} variants={itemVariants}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center"
                >
                  <div className={`h-10 w-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <h4 className="text-3xl font-bold text-gray-900">{stat.value}</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BOTTLENECKS */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col relative">
                {!dashStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-amber-500" /></div>}

                <h3 className="text-xs font-bold text-gray-400 mb-5 flex items-center gap-2 uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4 text-amber-500" /> Pending Bottlenecks
                </h3>
                <div className="space-y-4 flex-1">
                  {dashStats?.top_bottlenecks?.length > 0 ? (
                    dashStats.top_bottlenecks.map((b, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <span className="text-sm font-medium text-gray-700 truncate pr-4">{b.department}</span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full group-hover:bg-amber-100 transition-colors">
                          {b.pending_count} pending
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                      No bottlenecks detected
                    </div>
                  )}
                </div>
              </motion.div>

              {/* API TRAFFIC */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                {!trafficStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-green-500" /></div>}

                <h3 className="text-xs font-bold text-gray-400 mb-5 flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="h-4 w-4 text-green-500" /> Top API Traffic
                </h3>
                <div className="space-y-5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {trafficStats?.data?.length > 0 ? (
                    trafficStats.data.slice(0, 10).map((t, i) => {
                      const maxHits = trafficStats.data[0].hits;
                      const percent = Math.max(5, Math.round((t.hits / maxHits) * 100));
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 truncate pr-2 font-medium flex items-center gap-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.method === 'GET' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {t.method}
                              </span> 
                              <span className="truncate max-w-[150px]">{t.path}</span>
                            </span>
                            <span className="text-gray-900 font-semibold">{t.hits}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400 font-medium">
                      No traffic recorded
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>

      <ClearCacheModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearCache}
        clearingScope={activeScope}
        isProcessing={clearingCache}
      />
    </div>
  );
};

export default MetricsManagement;