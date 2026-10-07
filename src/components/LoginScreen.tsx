/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { customAuth } from '../lib/customAuth';
import { Mail, Lock, Shield, User, Loader2, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { DrWashitLogo } from './DrWashitLogo';

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

  const getCardHeading = () => {
    if (authMode === 'signup') return 'Create account';
    if (authMode === 'reset') return 'Reset your password';
    return 'Welcome back 👋';
  };

  const getCardSubtext = () => {
    if (authMode === 'signup') return 'Register a new workshop profile to access the CRM.';
    if (authMode === 'reset') return 'Enter your registered email and we will send you a reset link.';
    return 'Log in to manage your bookings, clients and business.';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F8FB] select-none font-sans" id="login-container">
      
      {/* CSS Keyframes Animations Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-bubble {
          0% { transform: translateY(110%) scale(0.8); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-100px) scale(1.3); opacity: 0; }
        }
        @keyframes fade-up-saas {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-right-saas {
          0% { opacity: 0; transform: translateX(-24px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-bubble-1 { animation: float-bubble 14s infinite linear; }
        .animate-bubble-2 { animation: float-bubble 19s infinite linear 2s; }
        .animate-bubble-3 { animation: float-bubble 16s infinite linear 4s; }
        .animate-bubble-4 { animation: float-bubble 22s infinite linear 6s; }
        .animate-bubble-5 { animation: float-bubble 12s infinite linear 1s; }
        .animate-fade-up-saas { animation: fade-up-saas 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-right-saas { animation: fade-right-saas 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .animate-bubble-1, .animate-bubble-2, .animate-bubble-3, .animate-bubble-4, .animate-bubble-5 {
            animation: none !important;
            opacity: 0.08 !important;
          }
        }
      `}} />

      {/* DESKTOP LEFT PANEL - Hidden on Mobile */}
      <div className="hidden md:flex md:w-[55%] bg-gradient-to-b from-[#0E7490] via-[#0891B2] to-[#22D3EE] relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Animated Overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Faint grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
          {/* Faint glass overlay */}
          <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-[0.5px]" />
          
          {/* Bubbles */}
          <div className="absolute bottom-[-50px] left-[10%] w-6 h-6 rounded-full bg-white opacity-10 animate-bubble-1" />
          <div className="absolute bottom-[-50px] left-[32%] w-12 h-12 rounded-full bg-white opacity-15 animate-bubble-2" />
          <div className="absolute bottom-[-50px] left-[55%] w-8 h-8 rounded-full bg-white opacity-12 animate-bubble-3" />
          <div className="absolute bottom-[-50px] left-[78%] w-14 h-14 rounded-full bg-white opacity-18 animate-bubble-4" />
          <div className="absolute bottom-[-50px] left-[90%] w-5 h-5 rounded-full bg-white opacity-10 animate-bubble-5" />

          {/* Smooth Bottom Wave SVGs */}
          <svg className="absolute bottom-0 left-0 right-0 w-full text-[#F4F8FB] fill-current" viewBox="0 0 1440 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,96L120,106.7C240,117,480,139,720,138.7C960,139,1200,117,1320,106.7L1440,96L1440,160L1320,160C1200,160,960,160,720,160C480,160,240,160,120,160L0,160Z" opacity="0.1" />
            <path d="M0,128L120,122.7C240,117,480,107,720,112C960,117,1200,139,1320,149.3L1440,160L1440,160L1320,160C1200,160,960,160,720,160C480,160,240,160,120,160L0,160Z" opacity="0.05" />
          </svg>
        </div>

        {/* Content Zone */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Header */}
          <div className="flex items-center gap-3.5 animate-fade-right-saas" style={{ animationDelay: '0ms' }}>
            <DrWashitLogo size={56} className="bg-white/10 backdrop-blur-md border border-white/25 shadow-md shrink-0" />
            <span className="text-[20px] font-bold text-white normal-case leading-none">Dr Washit</span>
          </div>

          {/* Center Brand Statements */}
          <div className="max-w-xl space-y-8 my-auto text-left">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-[44px] font-bold text-white leading-[1.1] tracking-tight animate-fade-right-saas" style={{ animationDelay: '80ms', textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                Make every car shine.<br />Run every job smoothly.
              </h2>
              <p className="text-base lg:text-[17px] text-white/90 font-medium leading-relaxed max-w-lg animate-fade-right-saas" style={{ animationDelay: '160ms' }}>
                The all-in-one CRM built for premium doorstep car care and detailing studios.
              </p>
            </div>

            {/* Feature lists */}
            <div className="space-y-4 pt-2 animate-fade-right-saas" style={{ animationDelay: '240ms' }}>
              {[
                "Bookings and calendar, always in sync",
                "Professional GST invoices in one tap",
                "Clients, staff and stock under control",
                "Live revenue and profit insights"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-[22px] w-[22px] rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10">
                    <Check size={12} className="text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[15px] font-medium text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Glass Quote Card */}
          <div className="animate-fade-right-saas" style={{ animationDelay: '320ms' }}>
            <div className="bg-white/15 backdrop-blur-md border border-white/15 p-5 rounded-2xl max-w-md shadow-lg text-left">
              <p className="text-sm italic font-semibold leading-relaxed">
                "Spend less time on paperwork, more time on perfection."
              </p>
              <span className="text-[11px] text-white/70 block mt-2 font-bold uppercase tracking-wider">— Dr Washit Team</span>
            </div>
          </div>
        </div>

      </div>

      {/* MOBILE GRADIENT HEADER - Only visible on screens < 768px */}
      <div className="block md:hidden bg-gradient-to-b from-[#0E7490] via-[#0891B2] to-[#22D3EE] rounded-b-[32px] overflow-hidden relative shadow-md pt-8 pb-14 px-4 z-0">
        {/* Floating bubbles and wave inside mobile header */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-[0.5px]" />
          <div className="absolute bottom-[-20px] left-[15%] w-6 h-6 rounded-full bg-white opacity-10 animate-bubble-1" />
          <div className="absolute bottom-[-20px] left-[45%] w-10 h-10 rounded-full bg-white opacity-15 animate-bubble-2" />
          <div className="absolute bottom-[-20px] left-[75%] w-8 h-8 rounded-full bg-white opacity-12 animate-bubble-3" />
        </div>

        {/* Brand layout on mobile */}
        <div className="flex flex-col items-center text-center text-white relative z-10 space-y-2">
          <DrWashitLogo size={56} className="shadow-lg border border-white/20" />
          <h1 className="text-[22px] font-bold normal-case text-white leading-none">Dr Washit</h1>
          <p className="text-[13px] text-white/90 normal-case">Premium detailing management</p>
          <h2 className="text-[22px] font-bold text-white leading-snug tracking-tight max-w-sm px-2 pt-1">
            Make every car shine. Run every job smoothly.
          </h2>
        </div>

        {/* 2x2 Feature points grid on mobile */}
        <div className="grid grid-cols-2 gap-2 mt-5 px-2 w-full max-w-sm mx-auto relative z-10">
          {[
            "Bookings and calendar, always in sync",
            "Professional GST invoices in one tap",
            "Clients, staff and stock under control",
            "Live revenue and profit insights"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/10 text-left">
              <Check size={10} className="text-white shrink-0 stroke-[2.5]" />
              <span className="text-[12px] font-medium text-white leading-tight">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP & MOBILE MAIN CARD CONTAINER AREA */}
      <div className="flex-1 flex flex-col justify-center items-center relative p-4 md:p-8 bg-[#F4F8FB] overflow-y-auto z-10">
        {/* Soft radial glow behind login card on desktop */}
        <div className="hidden md:block absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Overlapping offset container (-mt-8 is exactly -32px mobile top offset) */}
        <div className="w-full max-w-[440px] -mt-8 md:mt-0 relative z-10 flex flex-col items-stretch animate-fade-up-saas">
          
          {/* Desktop Only Branding Header (No duplicate mobile labels) */}
          <div 
            onClick={() => {
              const nextCount = clickCount + 1;
              setClickCount(nextCount);
              if (nextCount >= 5) {
                setShowSignup(true);
                setSuccess('Developer Mode: Create Account tab unlocked!');
              }
            }}
            className="hidden md:flex flex-col items-center mb-6 text-center cursor-pointer select-none space-y-2"
          >
            <DrWashitLogo size={64} className="shadow-md border border-[#E5EDF3]" />
            <h2 className="text-[24px] font-bold text-[#0F172A] leading-tight normal-case">Dr Washit</h2>
            <div className="flex items-center gap-2 justify-center">
              <span className="bg-[#CFFAFE] text-[#0E7490] text-[11px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-3xs">
                CRM Panel
              </span>
            </div>
            <p className="text-[14px] text-[#64748B] normal-case">Premium detailing management</p>
          </div>

          {/* White login card */}
          <div className="bg-white border border-[#E5EDF3] rounded-3xl p-6 md:p-9 shadow-[0_20px_60px_rgba(8,145,178,0.12)] space-y-6 text-left">
            
            {/* Title & helper */}
            <div className="space-y-1.5">
              <h3 className="text-2xl md:text-[28px] font-bold text-[#0F172A] leading-tight tracking-tight">
                {getCardHeading()}
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                {getCardSubtext()}
              </p>
            </div>

            {/* Tabs Control */}
            <div className="bg-[#F1F5F9] rounded-xl p-1 flex gap-1 relative">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center whitespace-nowrap ${
                  authMode === 'login'
                    ? 'bg-white text-[#0891B2] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Log in
              </button>
              {showSignup && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center whitespace-nowrap ${
                    authMode === 'signup'
                      ? 'bg-white text-[#0891B2] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Sign up
                </button>
              )}
              <button
                type="button"
                onClick={() => { setAuthMode('reset'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center whitespace-nowrap ${
                  authMode === 'reset'
                    ? 'bg-white text-[#0891B2] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Reset password
              </button>
            </div>

            {/* Messages */}
            {success && (
              <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] rounded-xl text-xs flex items-start gap-2.5 text-left font-semibold leading-relaxed animate-fade-up-saas">
                <Check size={15} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-xl text-xs flex items-start gap-2.5 text-left font-semibold leading-relaxed animate-fade-up-saas">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name field (for signup) */}
              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#334155] block">Full name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[#64748B]">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full h-[50px] text-sm pl-11 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0891B2] focus:ring-4 focus:ring-[#0891B2]/15 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#334155] block">Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-[#64748B]">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@workshop.com"
                    className="w-full h-[50px] text-sm pl-11 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0891B2] focus:ring-4 focus:ring-[#0891B2]/15 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#334155] block">
                  {authMode === 'reset' ? 'New Password' : 'Password'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-[#64748B]">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[50px] text-sm pl-11 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0891B2] focus:ring-4 focus:ring-[#0891B2]/15 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Access Code (for signup & reset tabs) */}
              {(authMode === 'signup' || authMode === 'reset') && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#334155] block">CRM Access Code</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[#64748B]">
                      <Shield size={16} />
                    </span>
                    <input
                      type={showAccessCode ? 'text' : 'password'}
                      required
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter master access code"
                      className="w-full h-[50px] text-sm pl-11 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0891B2] focus:ring-4 focus:ring-[#0891B2]/15 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      className="absolute inset-y-0 right-4 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors"
                    >
                      {showAccessCode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#64748B] font-medium leading-normal italic mt-1.5">
                    {authMode === 'reset'
                      ? 'Enter the master CRM access code to authorize your password reset.'
                      : 'Ask the workshop owner for the secure CRM master signup code.'}
                  </p>
                </div>
              )}

              {/* Row below password (only for login mode) */}
              {authMode === 'login' && (
                <div className="flex justify-between items-center text-sm font-medium pt-1">
                  <label className="flex items-center gap-2 text-[#334155] cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-[#CBD5E1] text-[#0891B2] focus:ring-[#0891B2] h-4 w-4 accent-[#0891B2]" 
                      defaultChecked 
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('reset'); setError(''); setSuccess(''); }}
                    className="text-[#0891B2] hover:text-[#0E7490] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Form trigger action button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white text-base font-semibold rounded-xl shadow-[0_8px_24px_rgba(8,145,178,0.35)] hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:scale-100 disabled:-translate-y-0 disabled:brightness-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>
                      {authMode === 'signup'
                        ? 'Creating Account...'
                        : authMode === 'reset'
                        ? 'Resetting Password...'
                        : 'Signing in...'}
                    </span>
                  </>
                ) : (
                  <span>
                    {authMode === 'signup'
                      ? 'Create Account & Open CRM'
                      : authMode === 'reset'
                      ? 'Send reset link'
                      : 'Log in'}
                  </span>
                )}
              </button>

              {/* Reset password - Back to login text link */}
              {authMode !== 'login' && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); setSuccess(''); }}
                    className="text-sm font-medium text-[#0891B2] hover:text-[#0E7490] transition-colors cursor-pointer"
                  >
                    Back to log in
                  </button>
                </div>
              )}

            </form>

            {/* Divider securely protecting block */}
            <div className="flex items-center my-6 z-10 relative">
              <div className="flex-1 border-t border-[#E5EDF3]"></div>
              <span className="px-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Secure login</span>
              <div className="flex-1 border-t border-[#E5EDF3]"></div>
            </div>

          </div>

          {/* Secure Firebase protections label & copyright info */}
          <div className="mt-8 text-center space-y-3.5">
            {/* Mobile quote line */}
            <p className="block md:hidden text-[13px] italic text-[#64748B] text-center max-w-sm mx-auto leading-relaxed">
              "Spend less time on paperwork, more time on perfection."
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[13px] text-[#64748B] font-medium">
              <Shield size={14} className="text-[#64748B]" />
              <span>Your data is encrypted and securely protected</span>
            </div>
            <p className="text-[12px] text-[#94A3B8] font-medium">© 2026 Dr Washit. All rights reserved.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
