import React, { useEffect, useState } from 'react';
import { Car, Sparkles, Droplets, Wind, ShieldCheck, CheckCircle } from 'lucide-react';

interface CarIntroLoaderProps {
  onComplete?: () => void;
  step: number;
}

export default function CarIntroLoader({ step }: CarIntroLoaderProps) {
  const [progress, setProgress] = useState(0);

  // Smooth progress bar simulation over 5.2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate progress slightly towards the end
        const increment = prev < 80 ? 1.8 : 2.5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Step information containing labels, themes, and corresponding icons
  const steps = [
    {
      title: 'Active Foam & Wash',
      subtitle: 'Applying Snow Foam & High-Pressure Wash...',
      desc: 'Spraying organic active wash foam and removing surface dirt.',
      color: 'from-sky-500 via-cyan-400 to-blue-600',
      textColor: 'text-sky-400',
      icon: <Droplets className="h-10 w-10 text-sky-400 animate-bounce" />,
      bgEffect: 'bg-sky-500/25 shadow-[0_0_50px_rgba(56,189,248,0.4)]',
      carColor: 'text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]'
    },
    {
      title: 'Precision Detailing',
      subtitle: 'Microfiber Scrubbing & Premium Decontamination...',
      desc: 'Removing sticky grime and cleaning wheels with premium microfiber.',
      color: 'from-blue-500 via-indigo-500 to-violet-600',
      textColor: 'text-indigo-400',
      icon: <Droplets className="h-10 w-10 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />,
      bgEffect: 'bg-indigo-500/25 shadow-[0_0_50px_rgba(99,102,241,0.4)]',
      carColor: 'text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]'
    },
    {
      title: 'Blow Dry & Vacuum',
      subtitle: 'High-Velocity Blow Dry & Deep Cabin Vacuum...',
      desc: 'Blasting water away from gaps and deep cleaning the interior.',
      color: 'from-indigo-500 via-purple-500 to-pink-600',
      textColor: 'text-purple-400',
      icon: <Wind className="h-10 w-10 text-purple-400 animate-pulse" />,
      bgEffect: 'bg-purple-500/25 shadow-[0_0_50px_rgba(168,85,247,0.4)]',
      carColor: 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]'
    },
    {
      title: 'Ceramic Coating & Wax',
      subtitle: 'Applying Nanotech Ceramic Coating & Gloss Wax...',
      desc: 'Applying premium hybrid wax sealant for deep hydrophobic gloss.',
      color: 'from-purple-500 via-pink-500 to-emerald-500',
      textColor: 'text-pink-400',
      icon: <ShieldCheck className="h-10 w-10 text-pink-400 animate-pulse" />,
      bgEffect: 'bg-pink-500/25 shadow-[0_0_50px_rgba(236,72,153,0.4)]',
      carColor: 'text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]'
    },
    {
      title: 'Ready to Shine',
      subtitle: 'Showroom Finish Achieved! Ready for Detailing Pro...',
      desc: 'Workshop detailing complete. Unlocking Dr. Washit Portal.',
      color: 'from-emerald-500 via-teal-400 to-cyan-500',
      textColor: 'text-emerald-400',
      icon: <Sparkles className="h-10 w-10 text-emerald-400 animate-ping" style={{ animationDuration: '2s' }} />,
      bgEffect: 'bg-emerald-500/25 shadow-[0_0_50px_rgba(16,185,129,0.4)]',
      carColor: 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'
    }
  ];

  const currentStep = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="fixed inset-0 bg-[#060810] flex flex-col items-center justify-center z-50 overflow-hidden select-none">
      {/* Dynamic Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-45" />
      
      {/* Absolute floating soap bubbles / sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center text-center">
        {/* Sleek Logo Branding Header */}
        <div className="flex items-center gap-2 mb-10 animate-fade-in">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            DR
          </div>
          <span className="text-lg font-black text-white tracking-widest uppercase">
            Dr Washit <span className="text-sky-400 font-medium">CRM</span>
          </span>
        </div>

        {/* Outer Glowing Car Detailing Stage */}
        <div className="relative mb-12 p-8 rounded-full border border-slate-800/80 bg-slate-900/30 backdrop-blur-xl flex items-center justify-center group shadow-2xl transition-all duration-500">
          {/* Pulsing Backlight */}
          <div className={`absolute inset-0 rounded-full ${currentStep.bgEffect} blur-2xl transition-all duration-500`} />
          
          {/* Animated Car Icon inside stage */}
          <div className="relative flex items-center justify-center">
            {/* Spray Particle Effects */}
            {step === 0 && (
              <div className="absolute inset-0 -m-6 border-4 border-dashed border-sky-400/30 rounded-full animate-spin" style={{ animationDuration: '12s' }} />
            )}
            {step === 1 && (
              <div className="absolute -inset-4 flex justify-between pointer-events-none">
                <span className="h-2 w-2 bg-indigo-400 rounded-full animate-ping" />
                <span className="h-2.5 w-2.5 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                <span className="h-2 w-2 bg-indigo-300 rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
              </div>
            )}
            {step === 2 && (
              <div className="absolute inset-0 -m-4 border-2 border-slate-700/50 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            )}
            {step === 3 && (
              <div className="absolute inset-0 -m-2 bg-gradient-to-tr from-emerald-500/20 to-teal-400/0 rounded-full animate-pulse" />
            )}

            <div className="h-28 w-28 bg-slate-950/90 rounded-full border border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
              <Car className={`h-14 w-14 transition-all duration-500 ${currentStep.carColor}`} />
              {/* Shining Sparkle Accent overlay on completed step */}
              {step >= 3 && (
                <Sparkles className="absolute top-4 right-4 h-5 w-5 text-yellow-300 animate-bounce" />
              )}
            </div>
          </div>

          {/* Floating Current Action Icon Badge */}
          <div className="absolute -bottom-2 -right-2 h-14 w-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300">
            {currentStep.icon}
          </div>
        </div>

        {/* Step Text Transitions */}
        <div className="h-28 flex flex-col items-center justify-center mb-6">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mb-2 ${currentStep.textColor}`}>
            Step {step + 1} of 5 • {currentStep.title}
          </span>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug animate-pulse">
            {currentStep.subtitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
            {currentStep.desc}
          </p>
        </div>

        {/* Premium Linear Progress & Percentage Gauge */}
        <div className="w-full bg-slate-950 border border-slate-900 p-1.5 rounded-2xl mb-3 shadow-inner">
          <div className="relative h-3 w-full bg-slate-900 rounded-xl overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${currentStep.color} rounded-xl shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all duration-300 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Progress % indicator */}
        <div className="flex items-center justify-between w-full px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Workshop Detailing</span>
          <span className="text-slate-300 font-mono text-xs">{Math.round(progress)}% Complete</span>
        </div>
      </div>
    </div>
  );
}
