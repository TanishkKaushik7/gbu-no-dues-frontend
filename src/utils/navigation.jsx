// src/utils/navigation.js
import { 
  LayoutDashboard, Layers, Users, 
  Building2, ClipboardList, FileText 
} from 'lucide-react';

export const getAdminNavigation = (role) => {
  const allItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'dean'] },
    { id: 'applications', label: 'Applications', icon: Layers, roles: ['admin', 'dean'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'schools', label: 'Structure Management', icon: Building2, roles: ['admin'] },
    { id: 'audit', label: 'Audit Logs', icon: ClipboardList, roles: ['admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'dean'] },
  ];

  return allItems.filter(item => 
    item.roles.includes(role?.toLowerCase())
  );
};