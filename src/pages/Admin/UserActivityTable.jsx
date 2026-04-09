import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const UserActivityTable = () => {
  // Mock data - replaces GET /api/admin/users
  const users = [
    { id: 1, name: "Dr. Sharma", role: "hostel_admin", email: "hostel@gbu.ac.in", status: "Active" },
    { id: 2, name: "Ms. Verma", role: "library_admin", email: "library@gbu.ac.in", status: "Active" },
    { id: 3, name: "Mr. Gupta", role: "finance_admin", email: "finance@gbu.ac.in", status: "Inactive" },
    { id: 4, name: "Exam Cell", role: "exam_admin", email: "exam@gbu.ac.in", status: "Active" },
    { id: 5, name: "Sports Dept", role: "sports_admin", email: "sports@gbu.ac.in", status: "Active" },
  ];

  const getRoleStyle = (role) => {
    switch(role) {
      case 'hostel_admin': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'library_admin': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'finance_admin': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Recent User Activity</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">
          View All Users
        </button>
      </div>

      <div className="flex-1 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">User</th>
              <th className="px-4 py-3 whitespace-nowrap">Role</th>
              <th className="px-4 py-3 whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                {/* User Column with Initials Avatar */}
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {user.name.charAt(0)}
                    </div>
                    <span className="truncate max-w-[120px]" title={user.name}>{user.name}</span>
                  </div>
                </td>
                
                {/* Role Column with Custom Badge */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${getRoleStyle(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                
                {/* Email Column */}
                <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]" title={user.email}>
                  {user.email}
                </td>
                
                {/* Status Column (Right Aligned) */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      user.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {user.status}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600">
                       <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivityTable;