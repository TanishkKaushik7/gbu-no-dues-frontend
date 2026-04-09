import React from 'react';
import { UserPlus, Building2, GraduationCap, FileDown, Plus } from 'lucide-react';

const QuickActions = ({ onRegisterUser, onNavigate }) => {
  
  const actions = [
    {
      label: "User Registry",
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      handler: onRegisterUser 
    },
    {
      label: "Manage Schools",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      handler: () => onNavigate('schools') 
    },
    {
      label: "Applications Records",
      icon: GraduationCap,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      // Changed from 'audit' to 'application_logs' to match AdminDashboard mapping
      handler: () => onNavigate('application_logs') 
    },
    {
      label: "System Reports",
      icon: FileDown,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      handler: () => onNavigate('reports') 
    }
  ];

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm h-full flex flex-col">
      {/* Protocol Header */}
      <div className="mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Quick Actions</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Protocol access gateway</p>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-5">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.handler}
            className="group relative flex flex-col items-center justify-center p-6 w-full h-36 rounded-[2.5rem] border-2 border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 active:scale-[0.95]"
          >
            {/* Icon Container */}
            <div className={`p-4 rounded-2xl ${action.bgColor} mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest text-center leading-tight px-2">
              {action.label}
            </span>
            
            {/* Hover Indicator */}
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
               <Plus className="h-4 w-4 text-blue-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;