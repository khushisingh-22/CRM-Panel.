import React, { useState } from 'react';
import { customAuth } from '../lib/customAuth';
import { Mail, Lock, Sparkles, Shield, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { DrWashitLogo } from './DrwashitLogo';

interface LoginScreenProps {
  onLoginSuccess: (uid: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showSignup, setShowSignup] = useState(() => {
    return typeof window !== 'undefined' && window.location.search.includes('signup=true');
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const user = await customAuth.createUserWithEmailAndPassword(email, password, name, accessCode);
        onLoginSuccess(user.uid);
      } else if (authMode === 'reset') {
        await customAuth.resetPassword(email, password, accessCode);
        setSuccess('Password updated successfully! You can now log in with your new password.');
        setPassword('');
        setAccessCode('');
        setAuthMode('login');
      } else {
        const user = await customAuth.signInWithEmailAndPassword(email, password);
        onLoginSuccess(user.uid);
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || 'An unexpected error occurred.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A13] px-4 py-12 select-none relative overflow-hidden" id="login-container">
      {/* Background visual graphics */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div 
          className="text-center space-y-2 animate-fade-in cursor-pointer select-none"
          onClick={() => {
            const nextCount = clickCount + 1;
            setClickCount(nextCount);
            if (nextCount >= 5) {
              setShowSignup(true);
              setSuccess('Developer Mode: Create Account tab unlocked!');
            }
          }}
        >
          <div className="mb-2">
            <DrWashitLogo size={64} className="shadow-lg" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Dr Washit <span className="text-sky-400 font-medium">CRM</span>
          </h1>
          <p className="text-xs text-slate-400">
            Professional Cloud-Synced Auto Detailing Workshop Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0B1329] border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-6">
          
          {/* Sign In / Sign Up Selector Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 text-center ${
                authMode === 'login' ? 'border-sky-500 text-sky-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            {showSignup && (
              <button
                onClick={() => { setAuthMode('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 text-center ${
                  authMode === 'signup' ? 'border-sky-500 text-sky-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            )}
            <button
              onClick={() => { setAuthMode('reset'); setError(''); setSuccess(''); }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 text-center ${
                authMode === 'reset' ? 'border-sky-500 text-sky-400 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Reset Pass
            </button>
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
              <span className="mt-0.5 font-bold">✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-widest block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-sky-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-widest block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@workshop.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-sky-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-widest block">
                {authMode === 'reset' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-sky-500/50 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {(authMode === 'signup' || authMode === 'reset') && (
              <div className="space-y-1.5">
                <label className="text-3xs text-slate-400 font-extrabold uppercase tracking-widest block">
                  CRM Access Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                    <Shield size={15} />
                  </span>
                  <input
                    type={showAccessCode ? 'text' : 'password'}
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter workshop master access code"
                    className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-hidden focus:border-sky-500/50 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showAccessCode ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-4xs text-slate-500 mt-1 italic leading-normal">
                  {authMode === 'reset' 
                    ? 'Enter the master CRM access code to authorize your password reset.'
                    : 'Ask the workshop owner for the secure CRM master signup code.'}
                </p>
              </div>
            )}

            {authMode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setAuthMode('reset'); setError(''); setSuccess(''); }}
                  className="text-4xs text-sky-400 hover:text-sky-300 font-bold uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2 animate-shake">
                <Shield size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {authMode === 'signup' 
                    ? 'Creating Account...' 
                    : authMode === 'reset' 
                    ? 'Resetting Password...' 
                    : 'Logging In...'}
                </>
              ) : (
                authMode === 'signup' 
                  ? 'Create Account & Open CRM' 
                  : authMode === 'reset' 
                  ? 'Update Password' 
                  : 'Log In'
              )}
            </button>
          </form>

        </div>

        {/* Security / System Badge */}
        <div className="flex items-center justify-center gap-1.5 text-4xs text-slate-500 uppercase tracking-widest font-extrabold text-center">
          <Shield size={10} />
          <span>Secured with Firebase Authentication</span>
        </div>

      </div>
    </div>
  );
}
