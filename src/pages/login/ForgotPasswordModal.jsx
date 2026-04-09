import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiShield, FiLock, FiArrowRight, 
  FiRefreshCw, FiCheckCircle, FiX, FiAlertCircle 
} from 'react-icons/fi';
import { Turnstile } from '@marsidev/react-turnstile';
import axios from 'axios';

const cn = (...classes) => classes.filter(Boolean).join(" ");

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  // Steps: 'email' -> 'otp' -> 'reset' -> 'success'
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Turnstile State
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/g, '');

  const handleRefreshTurnstile = () => {
    setTurnstileToken('');
    turnstileRef.current?.reset();
  };

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setError('');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setTurnstileToken('');
    }
  }, [isOpen]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/verification/forgot-password`, {
        email,
        turnstile_token: turnstileToken
      });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
      handleRefreshTurnstile();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/verification/verify-reset-otp`, {
        email,
        otp
      });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/verification/reset-password`, {
        email,
        otp,
        new_password: newPassword
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const labelStyle = "text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-10">
          <FiX size={20} />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              {step === 'success' ? <FiCheckCircle size={24} /> : <FiLock size={24} />}
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'reset' && 'New Password'}
              {step === 'success' && 'Reset Complete'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {step === 'email' && 'Enter your registered email to receive OTP'}
              {step === 'otp' && `Enter the code sent to ${email}`}
              {step === 'reset' && 'Create a new password'}
              {step === 'success' && 'Your password has been successfully updated'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-red-100"
              >
                <FiAlertCircle size={14} className="shrink-0" /> <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className={labelStyle}>Official Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Enter your registered email"
                  />
                </div>
              </div>

              {/* Turnstile Security Section - Now matching StudentLogin exactly */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <label className={labelStyle}>Security Verification</label>
                    <button
                      type="button"
                      onClick={handleRefreshTurnstile}
                      className="text-slate-400 hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 p-1"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider">Refresh</span>
                      <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    </button>
                  </div>
                  {turnstileToken && (
                    <span className="text-[9px] font-black text-green-600 flex items-center gap-1 uppercase tracking-tighter">
                      <FiCheckCircle size={10} /> Secure
                    </span>
                  )}
                </div>
                
                <div className={cn(
                  "relative h-[48px] w-full max-w-[300px] m-auto rounded-xl border transition-all duration-300 flex items-center justify-center overflow-hidden bg-slate-50",
                  turnstileToken ? "border-green-200 bg-green-50/20" : "border-slate-200"
                )}>
                  <Turnstile 
                    ref={turnstileRef}
                    siteKey={SITE_KEY}
                    onSuccess={token => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    options={{ theme: 'light', size: 'normal', appearance: 'always' }}
                  />
                </div>
              </div>

              <button 
                disabled={loading || !turnstileToken} 
                type="submit" 
                className={cn(
                  "w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg",
                  turnstileToken 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20 active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                )}
              >
                {loading ? <FiRefreshCw className="animate-spin" /> : 'Send Reset OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className={labelStyle}>Verification Code</label>
                <div className="relative">
                  <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-black tracking-[0.5em] focus:bg-white outline-none"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]">
                {loading ? <FiRefreshCw className="animate-spin" /> : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className={labelStyle}>New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <label className={labelStyle}>Confirm Password</label>
                  {confirmPassword && (
                    <span className={`text-[9px] font-black uppercase ${newPassword === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                      {newPassword === confirmPassword ? 'Match' : 'No Match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <FiCheckCircle className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                    newPassword === confirmPassword && confirmPassword ? 'text-emerald-500' : 'text-slate-400'
                  )} size={16} />
                  <input 
                    type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "w-full pl-12 pr-4 h-11 bg-slate-50 border rounded-xl text-sm font-bold focus:bg-white outline-none transition-all",
                      confirmPassword && newPassword !== confirmPassword ? 'border-red-200 ring-4 ring-red-500/5' : 'border-slate-200'
                    )}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                disabled={loading || !newPassword || newPassword !== confirmPassword} 
                type="submit" 
                className={cn(
                  "w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg",
                  newPassword && newPassword === confirmPassword 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-[0.98]' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                )}
              >
                {loading ? <FiRefreshCw className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <p className="text-center text-slate-500 text-sm font-medium">You can now login with your new credentials.</p>
              <button onClick={onClose} className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-[0.98]">
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;