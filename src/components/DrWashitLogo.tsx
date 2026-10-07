import React, { useState } from 'react';
import logoImg from '../assets/images.png';

export const DrWashitLogo = ({ size = 60, className = "" }: { size?: number; className?: string }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`inline-flex items-center justify-center bg-white rounded-2xl border border-[#E5EDF3] overflow-hidden shrink-0 shadow-sm ${className}`}
      style={{ width: size, height: size, padding: hasError ? 0 : 4 }}
    >
      {hasError ? (
        <div
          className="w-full h-full bg-gradient-to-br from-[#0891B2] to-[#06B6D4] text-white flex items-center justify-center font-bold"
          style={{ fontSize: size * 0.38 }}
        >
          DW
        </div>
      ) : (
        <img
          src={logoImg}
          alt=""
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};