import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTachometerAlt,
  FaHistory,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import LogoutConfirmModal from "./LogoutConfirmModal"; // ✅ 1. Import the modal

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");

  // ✅ 2. Add state to control the modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Removed 'logout' from here, the modal will handle it now

  const role = location.pathname.split("/")[1] || "dashboard";

  let menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
      path: `/${role}/dashboard`,
    },
    {
      id: "history",
      label: "History",
      icon: <FaHistory />,
      path: `/${role}/history`,
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname.split("/").pop();
    setActiveItem(currentPath);

    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition-colors active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed md:sticky top-0 h-[100dvh] md:h-screen w-72 bg-white border-r border-gray-200 text-gray-600 z-[45] transition-transform duration-300 ease-in-out transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 shadow-2xl md:shadow-none`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Branding Section */}
          <div className="px-8 py-8 shrink-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 p-1.5">
                <img
                  src="https://www.gbu.ac.in/Content/img/logo_gbu.png"
                  alt="GBU Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  GBU Portal
                </h1>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Management System
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
            <p className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                      activeItem === item.id
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "hover:bg-gray-50 hover:text-gray-900 text-gray-500 font-medium"
                    }`}
                  >
                    {activeItem === item.id && (
                      <motion.div
                        layoutId="activeSide"
                        className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                      />
                    )}

                    <span
                      className={`text-lg transition-colors ${activeItem === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile & Logout Section */}
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] mx-4 mb-4 rounded-2xl bg-gray-50 border border-gray-100 shrink-0">
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 border border-gray-200 shadow-sm shrink-0">
                <FaUserCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "Officer"}
                </p>
                <p className="text-xs text-gray-500 font-medium truncate capitalize">
                  {role} node
                </p>
              </div>
            </div>

            {/* ✅ 3. Updated Button to trigger modal state */}
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-xl transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <FaSignOutAlt size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 4. Render the Modal at the bottom */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
