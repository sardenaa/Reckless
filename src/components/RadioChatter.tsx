import React, { useState, useEffect } from "react";
import { Radio, MicVocal, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CHATTER_MESSAGES = [
  "UNIT 4-TOM: 10-80 in progress, downtown LS.",
  "DISPATCH: All units, code 3 to Pershing Square.",
  "UNIT 7-KING: 10-4, heading to the scene.",
  "DISPATCH: Negative on that 10-11, standby.",
  "UNIT 1-ADAM: Suspect is currently on foot, heading North.",
  "DISPATCH: Air support is 2 minutes out.",
  "UNIT 2-BOY: Shots fired! Shots fired! Request BACKUP!",
  "MEDIC 1: En route to the shooting, ETA 3 minutes.",
  "UNIT 5-LINCOLN: 10-15 on one suspect, requesting transport.",
  "DISPATCH: Copy that 10-15. Tower is watching."
];

export default function RadioChatter() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const msg = CHATTER_MESSAGES[Math.floor(Math.random() * CHATTER_MESSAGES.length)];
      setMessages(prev => [msg, ...prev].slice(0, 3));
    }, 8000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-72 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {messages.map((m, i) => (
          <motion.div
            key={m + i}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="bg-black/90 backdrop-blur-xl border-r-4 border-r-(--accent) border border-white/5 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-4 items-start pointer-events-auto relative group overflow-hidden"
          >
            {/* HUD Corner Decor */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-(--accent)/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-(--accent)/30" />
            
            <div className="bg-(--accent)/10 p-2 border border-(--accent)/20 rotate-45 group-hover:rotate-90 transition-transform duration-500">
              <MicVocal size={14} className="text-(--accent) -rotate-45 group-hover:-rotate-90 transition-transform duration-500 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-(--accent) neon-text">CH-LRP-01</span>
                    <Wifi size={10} className="text-(--accent) opacity-40" />
                 </div>
                 <span className="text-[7px] font-mono text-gray-700 tracking-tighter uppercase">{new Date().toLocaleTimeString([], { hour12: false })}</span>
              </div>
              <p className="text-[11px] font-display leading-relaxed text-white/90 italic font-black uppercase tracking-tight">
                {m}
              </p>
              {/* Decorative progress-like bar */}
              <div className="h-[1px] w-full bg-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 7, ease: "linear" }}
                   className="h-full bg-(--accent) opacity-20 shadow-[0_0_10px_var(--glow)]" 
                 />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <div className="flex justify-end mt-1 pointer-events-auto">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] transition-all border ${
            isActive ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" : "bg-red-500/10 border-red-500/40 text-red-500"
          }`}
        >
          <Radio size={10} className={isActive ? "animate-pulse" : ""} />
          Radio Channel: {isActive ? "Online" : "Paused"}
        </button>
      </div>
    </div>
  );
}
