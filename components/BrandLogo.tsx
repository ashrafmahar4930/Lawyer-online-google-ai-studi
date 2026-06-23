import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function BrandLogo({ className = '' }: { className?: string }) {
  const [logoAnimIndex, setLogoAnimIndex] = useState(0);

  const logoStyles = [
    { badgeClass: 'bg-indigo-950 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]', textClass: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]', sparkleClass: 'text-indigo-400' },
    { badgeClass: 'bg-white border-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.3)]', textClass: 'text-blue-900', sparkleClass: 'text-blue-600' },
    { badgeClass: 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]', textClass: 'text-white', sparkleClass: 'text-blue-200' },
    { badgeClass: 'bg-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]', textClass: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]', sparkleClass: 'text-cyan-300' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoAnimIndex((prev) => (prev + 1) % logoStyles.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black border transition-all duration-700 ease-in-out ${logoStyles[logoAnimIndex].badgeClass} align-middle ${className}`}>
      <Sparkles className={`w-3 h-3 ${logoStyles[logoAnimIndex].sparkleClass} transition-colors duration-700`} />
      <span className={`transition-colors duration-700 ${logoStyles[logoAnimIndex].textClass}`}>
        LAWYERONLINE.LIVE
      </span>
    </span>
  );
}
