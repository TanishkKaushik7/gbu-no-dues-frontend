import React from 'react';
import Sidebar from './Sidebar';

export default function RoleLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
