// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { FiHome, FiLogOut } from 'react-icons/fi';
// import { useStudentAuth } from '../../contexts/StudentAuthContext'; // Path to your auth context

// const HomeButton = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { logout } = useStudentAuth(); // Pull the logout function

//   // 1. Don't show on the landing page
//   if (location.pathname === '/') return null;

//   const handleSafeExit = () => {
//     // 2. Clear session data (Token, user state, etc.)
//     if (logout) {
//       logout(); 
//     } else {
//       // Fallback if context logout isn't available
//       localStorage.removeItem('studentToken');
//       sessionStorage.clear();
//     }
    
//     // 3. Redirect to landing and replace history 
//     // This prevents the user from clicking "Back" to return to the dashboard
//     navigate('/', { replace: true });
//   };

//   return (
//     <button
//       onClick={handleSafeExit}
//       className="fixed no-print right-8 bottom-8 z-[60] bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-95 group overflow-hidden"
//     >
//       <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
//       <div className="relative flex items-center gap-2">
//         <FiHome className="w-5 h-5 text-white group-hover:hidden" />
//         <FiLogOut className="w-5 h-5 text-red-500 hidden group-hover:block transition-all" />
//         <span className="text-white text-xs font-bold w-0 overflow-hidden group-hover:w-16 transition-all duration-300">
//           LOGOUT
//         </span>
//       </div>
//     </button>
//   );
// };

// export default HomeButton;