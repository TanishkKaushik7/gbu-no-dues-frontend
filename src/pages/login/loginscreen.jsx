import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiLock, FiLogIn, 
  FiArrowLeft, FiAlertCircle,
  FiEye, FiEyeOff, FiCheckCircle,
  FiRefreshCw 
} from 'react-icons/fi';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import ForgotPasswordModal from './ForgotPasswordModal'; 

// --- UI HELPERS ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "bg-background hover:bg-accent hover:text-accent-foreground border border-gray-200",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// --- MAIN LOGIN SCREEN ---
const LoginScreen = ({ 
  universityName = "Gautam Buddha University",
  systemName = "NoDues Management System"
}) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [turnstileToken, setTurnstileToken] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const turnstileRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleRefreshVerification = () => {
    setTurnstileToken('');
    setError('');
    turnstileRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login({ 
        ...credentials, 
        turnstile_token: turnstileToken 
      });
      
      const user = result?.user;

      if (user) {
        const rawRole = (user.role || "").toLowerCase().trim();
        const deptId = user.department_id ? parseInt(user.department_id) : null;
        const userName = (user.name || "").toLowerCase();
        
        // 1. Define Static/Legacy Routes
        const roleMap = {
          'admin': '/admin/dashboard',
          'super_admin': '/admin/dashboard',
          'hod': '/hod/dashboard',
          'dean': '/school/dashboard', 
          'student': '/student/dashboard'
        };

        let targetPath = roleMap[rawRole];

        // 2. Handle Departmental Staff Routing
        if (rawRole === 'staff') {
          switch (deptId) {
            // Existing Hardcoded Folders
            case 14: targetPath = '/library/dashboard'; break;
            case 15: targetPath = '/hostels/dashboard'; break;
            case 16: targetPath = '/sports/dashboard'; break;
            case 17: targetPath = '/laboratories/dashboard'; break;
            case 18: targetPath = '/crc/dashboard'; break;
            case 19: targetPath = '/accounts/dashboard'; break;
            
            // Generic fallback for Office accounts or School-specific Deans
            case null: 
               targetPath = userName.includes('office') ? '/office/dashboard' : '/school/dashboard';
               break;

            // ⭐ DYNAMIC FALLBACK: For any new Dept IDs created in Phase 2
            default:
              targetPath = '/dept/dashboard'; 
          }
        }

        // 3. Final Fallback: If role is totally unrecognized, try the dynamic route
        const finalPath = targetPath || `/dept/dashboard`;
        
        setTimeout(() => navigate(finalPath, { replace: true }), 100);
      }
    } catch (err) {
      setError(err.message || 'Access Denied.');
      handleRefreshVerification();
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 font-sans relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50/50 rounded-full blur-[120px]" />
      </div>

      <button 
        onClick={() => navigate('/', { replace: true })} 
        className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 bg-white rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 z-50 border border-slate-100"
      >
        <FiArrowLeft className="text-slate-700" size={20} />
      </button>

      <div className="w-full max-w-[400px] lg:max-w-4xl grid grid-cols-1 lg:grid-cols-10 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative z-10 my-12 lg:my-0">
        
        <div className="lg:col-span-4 bg-slate-900 p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden min-h-[200px] lg:min-h-auto">
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 p-1.5 border border-slate-100">
              <img 
                src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
                alt="GBU Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight uppercase mt-4">
              {universityName}
            </h1>
            <div className="h-1 w-12 bg-blue-500 mt-4 rounded-full" />
            <p className="text-slate-400 text-xs mt-4 sm:mt-6 font-bold uppercase tracking-[0.2em]">{systemName}</p>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full">
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Authority Login</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Credentials Required</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-3">
                  <FiAlertCircle className="shrink-0" size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className={labelStyle}>Registered Email</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <Input
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email"
                    className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl text-base md:text-sm font-bold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center pr-1">
                  <label className={labelStyle}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter Your Password"
                    className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl text-base md:text-sm font-bold focus:bg-white outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <label className={labelStyle}>Verification</label>
                  
                  <button
                    type="button"
                    onClick={handleRefreshVerification}
                    className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-tighter transition-all group active:scale-90"
                  >
                    <FiRefreshCw size={10} className="group-hover:rotate-180 transition-transform duration-500" />
                    Refresh
                  </button>
                </div>
                
                <div className={cn(
                  "relative h-[48px] w-[300px] m-auto rounded-2xl border transition-all duration-300 flex items-center justify-center overflow-hidden p-2",
                  turnstileToken 
                    ? "bg-green-50/30 border-green-200" 
                    : "bg-slate-50 border-slate-200"
                )}>
                  <Turnstile 
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={token => {
                      setTurnstileToken(token);
                      setError('');
                    }}
                    onError={() => setError("Security check failed.")}
                    onExpire={() => setTurnstileToken('')}
                    options={{ 
                      theme: 'light', 
                      size: 'normal' 
                    }}
                  />
                  {turnstileToken && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-4 text-green-500"
                    >
                      <FiCheckCircle size={20} />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="pt-3">
                <Button 
                  type="submit" 
                  disabled={isLoading || !turnstileToken} 
                  className={cn(
                    "w-full h-12 rounded-xl font-black text-[11px] uppercase tracking-[0.25em] shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]",
                    turnstileToken 
                      ? "bg-slate-900 hover:bg-slate-800 text-white" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  {isLoading ? (
                    <span className="animate-spin text-lg">●</span>
                  ) : !turnstileToken ? (
                    <>
                      <FiLock className="opacity-50" /> 
                      Verify Above
                    </>
                  ) : (
                    <>
                      <FiLogIn /> 
                      Login
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
};

export default LoginScreen;