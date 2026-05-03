import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
  targetDate: string;
  onEnd?: () => void;
  className?: string;
  showLabels?: boolean;
}

export default function Countdown({ targetDate, onEnd, className, showLabels = true }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        if (onEnd) onEnd();
        return;
      }

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onEnd]);

  if (!timeLeft) {
    return (
      <div className={className}>
        <span className="text-emerald-500 font-bold uppercase tracking-widest italic animate-pulse">Operation Commenced</span>
      </div>
    );
  }

  const { d, h, m, s } = timeLeft;

  return (
    <div className={`flex items-center gap-1.5 font-mono ${className}`}>
      <Clock size={14} className="text-(--accent) animate-pulse" />
      <div className="flex gap-1 items-baseline">
        {d > 0 && (
          <>
            <span className="text-white font-black">{d}</span>
            <span className="text-[8px] text-gray-500 uppercase mr-1">d</span>
          </>
        )}
        <span className="text-white font-black">{String(h).padStart(2, '0')}</span>
        <span className="text-[8px] text-gray-500 uppercase">:</span>
        <span className="text-white font-black">{String(m).padStart(2, '0')}</span>
        <span className="text-[8px] text-gray-500 uppercase">:</span>
        <span className="text-white font-black">{String(s).padStart(2, '0')}</span>
        {showLabels && <span className="text-[8px] text-(--accent) uppercase ml-1 tracking-widest font-black">remaining</span>}
      </div>
    </div>
  );
}
