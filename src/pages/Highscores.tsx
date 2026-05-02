import React, { useState, useEffect } from "react";
import { Trophy, DollarSign, Clock, Zap, Skull, Shield, Briefcase, Users, Loader2, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";

type Category = "players" | "money" | "combat" | "jobs" | "crime" | "social" | "misc";

export default function Highscores() {
  const [activeTab, setActiveTab] = useState<Category>("players");
  const [activeSubCombat, setActiveSubCombat] = useState<string>("Core");
  
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    let field = "level";
    let collectionName = "users";

    if (activeTab === "money") field = "money";
    if (activeTab === "combat") field = "kills";

    const q = query(
      collection(db, collectionName),
      orderBy(field, "desc"),
      limit(15)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, index) => {
        const userData = doc.data();
        if (activeTab === "players") {
          return {
            rank: `#${index + 1}`,
            name: userData.username || "Unknown",
            level: userData.level || 0,
            hours: userData.playingHours || 0
          };
        } else if (activeTab === "money") {
          return {
            rank: `#${index + 1}`,
            name: userData.username || "Unknown",
            bank: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(userData.money || 0),
            mats: userData.materials || 0
          };
        } else if (activeTab === "combat") {
          return {
            rank: `#${index + 1}`,
            name: userData.username || "Unknown",
            kills: userData.kills || 0,
            deaths: userData.deaths || 0,
            kd: ((userData.kills || 0) / (Math.max(1, userData.deaths || 0))).toFixed(2)
          };
        }
        return null;
      }).filter(Boolean);

      setScoreData(data);
      setLoading(false);
      setLastUpdated(new Date());
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin text-(--accent)" size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Loading Rankings...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "players":
        return <ScoreTable headers={["Rank", "Player", "Level", "Hours"]} data={scoreData} />;
      case "money":
        return <ScoreTable headers={["Rank", "Player", "Bank", "Items"]} data={scoreData} />;
      case "combat":
        return <ScoreTable headers={["Rank", "Player", "Kills", "Deaths", "K/D"]} data={scoreData} />;
      default:
        return (
          <div className="p-20 text-center opacity-30 italic uppercase font-black tracking-widest text-[10px]">
            Data coming soon...
          </div>
        );
    }
  };

  const syncHighscores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync-highscores", { method: "POST" });
      const result = await res.json();
      // Reload current category
      const catRes = await fetch(`/api/highscores/${activeTab}`);
      const data = await catRes.json();
      setScoreData(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Trophy className="text-(--accent)" size={20} />
          <h1 className="text-xl font-black uppercase tracking-tighter italic">World Highscores</h1>
        </div>
        {lastUpdated && (
          <button 
            onClick={syncHighscores}
            disabled={loading}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-(--text-secondary) bg-black/40 px-3 py-1.5 border border-white/5 hover:border-(--accent)/30 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={10} className={clsx(loading && "animate-spin")} />
            Last Synced: {lastUpdated.toLocaleTimeString()}
          </button>
        )}
      </div>

      <div className="flex flex-nowrap md:flex-wrap gap-3 mb-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        <TabButton active={activeTab === "players"} onClick={() => setActiveTab("players")} icon={<Users size={16} />} label="Levels" />
        <TabButton active={activeTab === "money"} onClick={() => setActiveTab("money")} icon={<DollarSign size={16} />} label="Wealth" />
        <TabButton active={activeTab === "combat"} onClick={() => setActiveTab("combat")} icon={<Skull size={16} />} label="Combat" />
      </div>

      <div className="portal-card">
        <div className="portal-header">
          <span className="flex items-center gap-2">
            Top Players: {activeTab.toUpperCase()}
            <span className="text-[8px] bg-(--accent)/20 text-(--accent) px-2 py-0.5 border border-(--accent)/30 font-black animate-pulse uppercase">Live Data</span>
          </span>
          <span className="text-[10px] opacity-50 uppercase">Synched</span>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border-2 transition-all relative overflow-hidden group",
        active ? "bg-(--accent) text-black border-(--accent) shadow-[0_0_20px_var(--glow)]" : "bg-black/40 border-white/10 hover:border-white/30 text-gray-400 hover:text-white"
      )}
    >
      <div className={clsx("transition-transform group-hover:scale-125", active ? "text-black" : "text-(--accent)")}>
        {icon}
      </div>
      {label}
      {active && (
        <motion.div 
          layoutId="tab-active-pill"
          className="absolute inset-0 bg-white/10"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}

function ScoreTable({ headers, data }: { headers: string[]; data: any[] }) {
  // Extract top 3 for podium highlight
  const top3 = data.slice(0, 3);
  const remaining = data.slice(3);

  return (
    <div className="flex flex-col gap-6 p-2 md:p-4">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
        {top3.map((player, idx) => {
          const values = Object.values(player);
          return (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className={clsx(
                "relative p-6 border-2 overflow-hidden group",
                idx === 0 ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : 
                idx === 1 ? "bg-slate-300/10 border-slate-300/50" : 
                "bg-orange-700/10 border-orange-700/50"
              )}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Trophy size={48} className={clsx(
                   idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-300" : "text-orange-700"
                 )} />
              </div>
              <div className="relative z-10">
                <span className={clsx(
                  "text-3xl font-black italic tracking-tighter font-display mb-1 block",
                  idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-300" : "text-orange-700"
                )}>#{idx + 1}</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">{values[1] as string}</h3>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{headers[2]}</span>
                  <span className="text-lg font-black italic text-white font-mono">{values[2] as string}</span>
                </div>
              </div>
              {idx === 0 && <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />}
            </motion.div>
          );
        })}
      </div>

      {/* Remaining List */}
      <div className="portal-card">
        <table className="vbulletin-table">
          <thead>
            <tr>
              {headers.map(h => <th key={h} className="font-display tracking-[0.1em]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {remaining.map((row, idx) => (
              <tr key={idx} className="hover:bg-(--accent)/5 transition-colors border-b border-white/5 last:border-0 group">
                {Object.values(row).map((val: any, vIdx) => (
                  <td key={vIdx} className={clsx(
                    vIdx === 0 && "font-mono font-black text-gray-500 group-hover:text-white transition-colors", 
                    vIdx === 1 && "font-black uppercase italic group-hover:text-(--accent) transition-colors",
                    "py-4"
                  )}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

