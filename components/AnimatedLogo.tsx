import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface AnimatedLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function AnimatedLogo({ className = "", iconClassName = "", textClassName = "" }: AnimatedLogoProps) {
  const [logoAnimIndex, setLogoAnimIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogoAnimIndex((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const logoStyles = [
    {
      badgeClass: "bg-cyan-950/40 text-cyan-400 border-cyan-500/30 shadow-[0_1px_8px_rgba(34,211,238,0.15)] scale-105 animate-pulse",
      textClass: "text-cyan-300 font-black tracking-wider uppercase",
      sparkleClass: "text-cyan-400",
      glowColor: "rgba(34,211,238,0.3)"
    },
    {
      badgeClass: "bg-amber-950/40 text-amber-400 border-amber-500/30 shadow-[0_1px_8px_rgba(245,158,11,0.15)] scale-100",
      textClass: "text-amber-300 font-extrabold tracking-wider uppercase",
      sparkleClass: "text-amber-400 animate-spin",
      glowColor: "rgba(245,158,11,0.3)"
    },
    {
      badgeClass: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_1px_8px_rgba(16,185,129,0.15)] scale-105 animate-pulse",
      textClass: "text-emerald-300 font-black tracking-wider uppercase",
      sparkleClass: "text-emerald-300",
      glowColor: "rgba(16,185,129,0.3)"
    },
    {
      badgeClass: "bg-rose-950/40 text-rose-400 border-rose-500/30 shadow-[0_1px_8px_rgba(244,63,94,0.15)] scale-100",
      textClass: "text-rose-300 font-extrabold tracking-wider uppercase",
      sparkleClass: "text-rose-400",
      glowColor: "rgba(244,63,94,0.3)"
    }
  ];

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[13px] font-black border transition-all duration-700 ease-in-out ${logoStyles[logoAnimIndex].badgeClass} ${className}`}
    >
      <Sparkles className={`w-3.5 h-3.5 ${logoStyles[logoAnimIndex].sparkleClass} transition-colors duration-700 ${iconClassName}`} />
      <span className={`transition-colors duration-700 ${logoStyles[logoAnimIndex].textClass} ${textClassName}`}>
        LAWYERONLINE.LIVE
      </span>
    </span>
  );
}
