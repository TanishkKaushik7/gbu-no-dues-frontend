import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Landmark, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext'; // Path to your AuthContext

const DashboardStats = () => {
  const { authFetch } = useAuth(); // Use the helper from your context
  const [stats, setStats] = useState({
    totalApps: "0",
    pendingApps: "0",
    completedApps: "0",
    rejectedApps: "0"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // ✅ FIXED: Updated endpoint to point to the new metrics router
        const response = await authFetch('/api/metrics/dashboard-stats');

        if (response.ok) {
          const data = await response.json();
          
          if (data.metrics) {
            setStats({
              // ✅ FIXED: Safely convert to Number before using toLocaleString()
              totalApps: Number(data.metrics.total_applications || 0).toLocaleString(),
              // Note: You can also add data.metrics.in_progress here if you want to group them
              pendingApps: Number(data.metrics.pending || 0).toLocaleString(), 
              completedApps: Number(data.metrics.completed || 0).toLocaleString(),
              rejectedApps: Number(data.metrics.rejected || 0).toLocaleString()
            });
          }
        } else {
          console.error("Stats API failed:", response.statusText);
        }
      } catch (error) {
        console.error("Network Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [authFetch]); // authFetch is a stable dependency

  const statCards = [
    { title: "Total Applications", value: stats.totalApps, icon: Landmark, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Pending Approval", value: stats.pendingApps, icon: Clock, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "Cleared Students", value: stats.completedApps, icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-100" },
    { title: "Rejected", value: stats.rejectedApps, icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-100" }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">{card.title}</h3>
            <div className={`p-2 rounded-full ${card.bgColor}`}><card.icon className={`h-4 w-4 ${card.color}`} /></div>
          </div>
          <div className="text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;