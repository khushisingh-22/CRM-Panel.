import React from 'react';
import logoImg from '../assets/images.png';

export const DrWashitLogo = ({ size = 60, className = "" }: { size?: number; className?: string }) => (
  <div 
    className={`inline-flex items-center justify-center bg-white rounded-xl border border-slate-200/50 overflow-hidden ${className}`} 
    style={{ width: size, height: size }}
  >
    <img 
      src={logoImg} 
      alt="Dr. Washit Logo" 
      className="w-full h-full object-cover" 
      referrerPolicy="no-referrer"
    />
  </div>
);
