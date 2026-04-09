import React, { useState, useEffect, useRef } from 'react';
import { useStudentAuth } from '../../contexts/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiLogIn, FiArrowLeft, FiUser, FiMail, 
  FiPhone, FiHash, FiCheckCircle, FiRefreshCw, FiBookOpen, FiLock, FiAlertCircle, FiChevronDown
} from 'react-icons/fi';
import { Turnstile } from '@marsidev/react-turnstile';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- SHARED UTILS & COMPONENTS ---
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base md:text-sm ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  return (
    <button
      className={cn(baseStyles, className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// --- SHADCN-LIKE SELECT COMPONENT ---
const ShadcnSelect = ({ value, onChange, options, placeholder, disabled, error, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-slate-50 px-4 py-2 text-base sm:text-xs font-bold transition-all outline-none",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-slate-100",
          error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-1 focus:ring-blue-500",
          isOpen ? "ring-1 ring-blue-500 border-blue-500" : ""
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-slate-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2 text-slate-400">
          {Icon && <Icon size={14} />}
          <FiChevronDown className={cn("transition-transform duration-200", isOpen && "rotate-180")} size={16} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-base shadow-lg sm:text-xs custom-scrollbar"
          >
            {options.length === 0 ? (
              <div className="relative cursor-default select-none py-2 px-4 text-slate-500 font-medium text-center">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative cursor-pointer select-none py-2.5 pl-4 pr-9 font-bold hover:bg-slate-100 hover:text-blue-600 transition-colors",
                    value === option.value ? "bg-blue-50 text-blue-600" : "text-slate-700"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="block truncate">{option.label}</span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <FiCheckCircle size={14} />
                    </span>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN COMPONENT ---
const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useStudentAuth(); 
  
  // Ref for Turnstile to allow manual reset
  const turnstileRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    enrollmentNumber: '',
    rollNumber: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    schoolId: '', 
    password: '',
    confirmPassword: '',
  });

  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const fetchSchools = async () => {
    try {
      const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const API_BASE = rawBase.replace(/\/+$/g, '');
      const response = await axios.get(`${API_BASE}/api/common/schools`);
      if (Array.isArray(response.data)) setSchools(response.data);
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    } finally {
      setSchoolsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleRefreshTurnstile = () => {
    setTurnstileToken('');
    turnstileRef.current?.reset();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'enrollmentNumber' || name === 'mobileNumber') {
      val = value.replace(/\D/g, '').slice(0, name === 'mobileNumber' ? 10 : 15);
    }
    if (name === 'rollNumber') {
      val = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    setForm(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.enrollmentNumber) err.enrollmentNumber = 'Required';
    if (!form.rollNumber) err.rollNumber = 'Required';
    if (!form.fullName) err.fullName = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Invalid email';
    if (form.mobileNumber.length !== 10) err.mobileNumber = '10 digits required';
    if (!form.schoolId) err.schoolId = 'Select School';
    if (form.password.length < 6) err.password = 'Min 6 chars';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Passwords mismatch';
    if (!turnstileToken) err.turnstile = 'Security check required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) return setErrors(v);

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        enrollment_number: form.enrollmentNumber,
        roll_number: form.rollNumber.trim(),
        full_name: form.fullName.trim(),
        mobile_number: form.mobileNumber,
        email: form.email.trim(),
        school_code: form.schoolId, 
        school_id: null, 
        password: form.password,
        confirm_password: form.confirmPassword,
        turnstile_token: turnstileToken
      };

      await register(payload);
      setMessage('Success: Account Created! Redirecting...');
      setTimeout(() => navigate('/student/login'), 2000);

    } catch (err) {
      console.error("Full Error Object:", err);
      let errorMsg = 'Registration failed due to a server error.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) {
          errorMsg = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
        } 
        else if (data.message) { errorMsg = data.message; } 
        else if (data.error) { errorMsg = data.error; }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setMessage(errorMsg);
      handleRefreshTurnstile(); // Reset token on error automatically
    } finally {
      setLoading(false);
    }
  }; 

  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block";
  const inputContainer = "relative transition-all duration-200 focus-within:transform focus-within:scale-[1.01]";

  return (
    <div className="min-h-screen w-full bg-[#fcfdfe] flex items-center justify-center p-4 py-8 lg:p-0 font-sans relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-blue-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-indigo-50/50 rounded-full blur-3xl" />
      </div>

      <button
        onClick={() => navigate('/', { replace: true })}
        className="absolute top-4 left-4 lg:top-6 lg:left-6 p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 z-50 transition-all"
      >
        <FiArrowLeft className="text-slate-600" size={18} />
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative z-10 my-8 lg:my-0">
        
        <div className="lg:col-span-4 bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden min-h-[250px] lg:min-h-auto">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          </div>
          <div className="relative z-10">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-2xl shadow-blue-500/20">
                <img 
                  src="https://www.gbu.ac.in/Content/img/logo_gbu.png" 
                  alt="GBU Logo" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <h1 className="text-2xl font-black leading-tight tracking-tight uppercase">
              Gautam Buddha <br /> University
            </h1>
            <p className="text-slate-400 text-xs mt-4 font-medium uppercase tracking-[0.2em]">Student Registry</p>
          </div>
        </div>

        <div className="lg:col-span-8 p-6 lg:p-10 lg:max-h-[90vh] lg:overflow-y-auto custom-scrollbar">
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Student Registration</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Create your academic profile</p>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-4 p-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3 border ${
                    message.toLowerCase().includes('success') 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}
                >
                  {message.toLowerCase().includes('success') 
                    ? <FiCheckCircle size={16} className="shrink-0" /> 
                    : <FiAlertCircle size={16} className="shrink-0" />
                  } 
                  <span className="leading-relaxed">{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelStyle}>Enrollment No</label>
                  <div className={inputContainer}>
                    <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={14} />
                    <Input 
                      name="enrollmentNumber" 
                      value={form.enrollmentNumber} 
                      onChange={handleChange} 
                      placeholder="Enrollment Number" 
                      className={`pl-10 h-11 text-base sm:text-xs font-bold ${errors.enrollmentNumber ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`} 
                    />
                  </div>
                  {errors.enrollmentNumber && <span className="text-[10px] text-red-500 font-bold">{errors.enrollmentNumber}</span>}
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Roll Number</label>
                  <div className={inputContainer}>
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={14} />
                    <Input 
                      name="rollNumber" 
                      value={form.rollNumber} 
                      onChange={handleChange} 
                      placeholder="ROLL NUMBER"
                      className={`pl-10 h-11 text-base sm:text-xs font-bold uppercase ${errors.rollNumber ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`} 
                    />
                  </div>
                  {errors.rollNumber && <span className="text-[10px] text-red-500 font-bold">{errors.rollNumber}</span>}
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className={labelStyle}>Full Name</label>
                  <Input 
                    name="fullName" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    placeholder="As per official documents" 
                    className={`h-11 text-base sm:text-xs font-bold bg-slate-50 ${errors.fullName ? 'border-red-300' : ''}`} 
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Email</label>
                  <Input 
                    name="email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="Email" 
                    className={`h-11 text-base sm:text-xs font-bold bg-slate-50 ${errors.email ? 'border-red-300' : ''}`} 
                  />
                  {errors.email && <span className="text-[10px] text-red-500 font-bold">{errors.email}</span>}
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Mobile</label>
                  <Input 
                    name="mobileNumber" 
                    value={form.mobileNumber} 
                    onChange={handleChange} 
                    placeholder="10 Digits" 
                    className={`h-11 text-base sm:text-xs font-bold bg-slate-50 ${errors.mobileNumber ? 'border-red-300' : ''}`} 
                  />
                </div>

                {/* --- NEW SHADCN-STYLE DROPDOWN INTEGRATION --- */}
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className={labelStyle}>Academic School</label>
                  <ShadcnSelect 
                    value={form.schoolId}
                    onChange={(val) => handleChange({ target: { name: 'schoolId', value: val } })}
                    options={schools.map(school => ({ value: school.id || school.code, label: `${school.name} (${school.code})` }))}
                    placeholder={schoolsLoading ? 'Loading Schools...' : 'Select University School'}
                    disabled={schoolsLoading}
                    error={errors.schoolId}
                    icon={FiBookOpen}
                  />
                  {errors.schoolId && <span className="text-[10px] text-red-500 font-bold">{errors.schoolId}</span>}
                </div>
                {/* --------------------------------------------- */}

                <div className="space-y-1">
                  <label className={labelStyle}>Password</label>
                  <Input 
                    name="password" 
                    type="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    className={`h-11 text-base sm:text-xs font-bold bg-slate-50 ${errors.password ? 'border-red-300' : ''}`} 
                  />
                  {errors.password && <span className="text-[10px] text-red-500 font-bold">{errors.password}</span>}
                </div>

                <div className="space-y-1">
                  <label className={labelStyle}>Confirm</label>
                  <Input 
                    name="confirmPassword" 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    className={`h-11 text-base sm:text-xs font-bold bg-slate-50 ${errors.confirmPassword ? 'border-red-300' : ''}`} 
                  />
                  {errors.confirmPassword && <span className="text-[10px] text-red-500 font-bold">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Turnstile Section with Refresh */}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <div className="flex justify-between items-center px-1 mb-1">
                  <div className="flex items-center gap-2">
                    <label className={labelStyle}>Security Verification</label>
                    <button
                      type="button"
                      onClick={handleRefreshTurnstile}
                      className="text-blue-400 hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 p-1"
                      title="Refresh Verification"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">Refresh</span>
                      <FiRefreshCw 
                        size={12} 
                        className={loading ? "animate-spin" : "transition-transform group-hover:rotate-180"} 
                      />
                    </button>
                  </div>
                  <AnimatePresence>
                    {turnstileToken && (
                      <motion.span 
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px] font-black text-green-600 flex items-center gap-1 uppercase tracking-tighter"
                      >
                        <FiCheckCircle size={10} /> Secure
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className={cn(
                  "relative h-[48px] w-full max-w-[300px] m-auto rounded-xl border transition-all duration-300 flex items-center justify-center overflow-hidden bg-slate-50",
                  turnstileToken ? "border-green-200 bg-green-50/20" : "border-slate-200"
                )}>
                  <Turnstile 
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={token => {
                      setTurnstileToken(token);
                      setErrors(prev => ({ ...prev, turnstile: '' }));
                    }}
                    onExpire={() => setTurnstileToken('')}
                    options={{ theme: 'light', size: 'normal' }}
                  />
                </div>
                {errors.turnstile && <span className="text-[10px] text-red-500 font-bold ml-1 text-center block mt-1">{errors.turnstile}</span>}
              </div>

              <div className="pt-4 flex flex-col items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={loading || schoolsLoading || !turnstileToken} 
                  className={cn(
                    "w-[300px] h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2",
                    turnstileToken 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  {loading ? <FiRefreshCw className="animate-spin" /> : turnstileToken ? <FiLogIn /> : <FiLock className="opacity-50" />} 
                  {loading ? 'Creating Account...' : turnstileToken ? 'Register Account' : 'Verify to Register'}
                </Button>
                
                <button 
                  type="button" 
                  onClick={() => navigate('/student/login')} 
                  className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
                >
                  Already have an account? <span className="text-blue-500 underline underline-offset-4">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentRegister;