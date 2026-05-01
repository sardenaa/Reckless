import React, { useState, useEffect } from "react";
import { Trophy, DollarSign, Clock, Zap, Skull, Shield, Briefcase, Users, Loader2, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";

type Category = "players" | "money" | "combat" | "jobs" | "crime" | "social" | "misc";

export default function Highscores() {
  const [activeTab, setActiveTab] = useState<Category>("players");
  const [activeJob, setActiveJob] = useState<string>("Trucker");
  const [activeSubCombat, setActiveSubCombat] = useState<string>("Core");
  const [activeMiscTab, setActiveMiscTab] = useState<string>("Skins");
  
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Real-time listener for current players/wealth from Firestore
  useEffect(() => {
    if (activeTab === "players" || activeTab === "money") {
      setLoading(true);
      const field = activeTab === "players" ? "level" : "money";
      const q = query(
        collection(db, "users"),
        orderBy(field, "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc, index) => {
          const userData = doc.data();
          if (activeTab === "players") {
            return {
              rank: `#${index + 1}`,
              name: userData.username,
              level: userData.level,
              hours: userData.playingHours || 0
            };
          } else {
            return {
              rank: `#${index + 1}`,
              name: userData.username,
              bank: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(userData.money || 0),
              mats: userData.materials || 0
            };
          }
        });
        setScoreData(data);
        setLoading(false);
        setLastUpdated(new Date());
      });

      return () => unsubscribe();
    } else {
      // Fetch from Server API for other categories
      const fetchHighscores = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/highscores/${activeTab}`);
          const data = await res.json();
          setScoreData(data);
          setLastUpdated(new Date());
        } catch (e) {
          console.error("Failed to fetch highscores", e);
        } finally {
          setLoading(false);
        }
      };
      
      fetchHighscores();
    }
  }, [activeTab]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin text-(--accent)" size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Accessing Mainframe...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "players":
        return <ScoreTable headers={["Rank", "Player", "Level", "Playing Hours"]} data={scoreData} />;
      case "money":
        return <ScoreTable headers={["Rank", "Player", "Bank Balance", "Materials"]} data={scoreData} />;
      case "combat":
        return (
          <div className="flex flex-col">
            <div className="bg-black/20 p-2 flex gap-2 border-b border-(--border)">
              {["Core", "Events", "Hunger Games"].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveSubCombat(t)}
                  className={clsx(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border transition-colors",
                    activeSubCombat === t ? "bg-(--accent)/20 border-(--accent) text-(--accent)" : "bg-white/5 border-white/10 text-(--text-secondary)"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <ScoreTable 
              headers={activeSubCombat === "Core" ? ["Rank", "Player", "Kills", "Deaths", "K/D"] : 
                       activeSubCombat === "Events" ? ["Rank", "Player", "Event Wins", "Recent Participation"] : 
                       ["Rank", "Player", "HG Wins", "Matches Played"]}
              data={scoreData} 
            />
          </div>
        );
      case "jobs":
        return (
          <div className="flex flex-col">
            <div className="bg-black/20 p-2 flex flex-wrap gap-2 border-b border-(--border)">
              {[
                "Trucker", "Lawyer", "Drug Dealer", "Mechanic", "Arms Dealer", 
                "Detective", "Drug Smuggler", "Fishing", "Boxing", "Carjacker"
              ].map(job => (
                <button 
                  key={job}
                  onClick={() => setActiveJob(job)}
                  className={clsx(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border transition-colors",
                    activeJob === job ? "bg-(--accent)/20 border-(--accent) text-(--accent)" : "bg-white/5 border-white/10 text-(--text-secondary) hover:text-white"
                  )}
                >
                  {job}
                </button>
              ))}
            </div>
            <ScoreTable 
              headers={["Rank", "Player", "Job", "Experience", "Total Tasks"]} 
              data={getJobData(activeJob)} 
            />
          </div>
        );
      case "crime":
        return <ScoreTable headers={["Rank", "Player", "Crimes Committed", "Total Arrests", "Primary Crime Type"]} data={mockCrime} />;
      case "social":
        return <ScoreTable headers={["Rank", "Faction/Gang", "Leader", "Members", "Net Worth"]} data={mockSocial} />;
      case "misc":
        return (
          <div className="flex flex-col">
            <div className="bg-black/20 p-2 flex gap-2 border-b border-(--border)">
              {["Skins", "Popular Cars"].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveMiscTab(t)}
                  className={clsx(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border transition-colors",
                    activeMiscTab === t ? "bg-(--accent)/20 border-(--accent) text-(--accent)" : "bg-white/5 border-white/10 text-(--text-secondary)"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <ScoreTable 
              headers={activeMiscTab === "Skins" ? ["Rank", "Skin ID", "Name", "Popularity (%)"] : ["Rank", "Model", "Class", "Total Owned"]}
              data={activeMiscTab === "Skins" ? mockSkins : mockCars} 
            />
          </div>
        );
      default:
        return null;
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

      <div className="flex flex-wrap gap-3 mb-4">
        <TabButton active={activeTab === "players"} onClick={() => setActiveTab("players")} icon={<Users size={16} />} label="Elite Operators" />
        <TabButton active={activeTab === "money"} onClick={() => setActiveTab("money")} icon={<DollarSign size={16} />} label="Wealth Index" />
        <TabButton active={activeTab === "combat"} onClick={() => setActiveTab("combat")} icon={<Skull size={16} />} label="Combat Log" />
        <TabButton active={activeTab === "jobs"} onClick={() => setActiveTab("jobs")} icon={<Briefcase size={16} />} label="Vocation Ranks" />
        <TabButton active={activeTab === "crime"} onClick={() => setActiveTab("crime")} icon={<Shield size={16} />} label="Wanted List" />
        <TabButton active={activeTab === "social"} onClick={() => setActiveTab("social")} icon={<Clock size={16} />} label="Faction Stats" />
        <TabButton active={activeTab === "misc"} onClick={() => setActiveTab("misc")} icon={<Zap size={16} />} label="Archived Ops" />
      </div>

      <div className="portal-card">
        <div className="portal-header">
          <span className="flex items-center gap-2">
            Ranking Snapshot: {activeTab.toUpperCase()}
            {activeTab === "players" || activeTab === "money" ? (
              <span className="text-[8px] bg-(--accent)/20 text-(--accent) px-2 py-0.5 border border-(--accent)/30 font-black animate-pulse">LIVE UPDATES ACTIVE</span>
            ) : (
              <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 border border-blue-500/30 font-black">FETCHED FROM MASTER SERVER</span>
            )}
          </span>
          <span className="text-[10px] opacity-50">Master DB Sync Active</span>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (activeJob && activeTab === "jobs" ? activeJob : "")}
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
    <div className="flex flex-col gap-6 p-4">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
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

const getJobData = (job: string) => {
  const players = [
    { rank: "#1", name: "Snake", job: job, exp: "142,500", total: "1,205" },
    { rank: "#2", name: "Officer_Bob", job: job, exp: "98,200", total: "852" },
    { rank: "#3", name: "Rider", job: job, exp: "45,102", total: "421" },
    { rank: "#4", name: "CJ_V2", job: job, exp: "12,400", total: "150" },
    { rank: "#5", name: "Sweet_P", job: job, exp: "5,200", total: "42" },
  ];
  
  const mappings: Record<string, any> = {
    "Trucker": { name: "Trucker_Joe", exp: "2,450,000", total: "12,402" },
    "Lawyer": { name: "Saul_Goodman", exp: "850,000", total: "1,402" },
    "Drug Dealer": { name: "Heisenberg", exp: "5,000,000", total: "8,421" },
    "Mechanic": { name: "Mac_Mechanic", exp: "1,210,400", total: "4,210" },
    "Arms Dealer": { name: "War_Lord", exp: "980,500", total: "2,105" },
    "Detective": { name: "Sherlock", exp: "450,000", total: "982" },
    "Drug Smuggler": { name: "Narco_P", exp: "3,200,000", total: "5,602" },
    "Fishing": { name: "Old_Man_Sea", exp: "120,400", total: "42,102" },
    "Boxing": { name: "Tyson_X", exp: "560,000", total: "450" },
    "Carjacker": { name: "GoneIn60", exp: "890,200", total: "1,205" },
  };

  if (mappings[job]) {
    players[0] = { rank: "#1", ...mappings[job], job };
  }
  
  return players;
};

// Mock Data
const mockPlayers = [
  { rank: "#1", name: "Snake", level: 94, hours: "4,210" },
  { rank: "#2", name: "Officer_Bob", level: 82, hours: "3,850" },
  { rank: "#3", name: "Rider", level: 75, hours: "2,100" },
  { rank: "#4", name: "CJ_V2", level: 68, hours: "1,980" },
  { rank: "#5", name: "Sweet_P", level: 55, hours: "1,200" },
  { rank: "#6", name: "Ghost_Rider", level: 52, hours: "1,150" },
  { rank: "#7", name: "Lamar_D", level: 48, hours: "980" },
];

const mockMoney = [
  { rank: "#1", name: "Snake", bank: "$42,450,000", mats: "1.2M" },
  { rank: "#2", name: "GoldDigger", bank: "$31,000,000", mats: "400K" },
  { rank: "#3", name: "Merchant_X", bank: "$18,500,000", mats: "2.1M" },
  { rank: "#4", name: "Oil_Tycoon", bank: "$12,400,000", mats: "500K" },
];

const mockCombat = [
  { rank: "#1", name: "Assassin", kills: 14502, deaths: 421, kd: "34.4" },
  { rank: "#2", name: "Hitman_V", kills: 8210, deaths: 1205, kd: "6.8" },
  { rank: "#3", name: "Rambo_99", kills: 5201, deaths: 1102, kd: "4.7" },
];

const mockEvents = [
  { rank: "#1", name: "Speedy_Gonzales", wins: 142, recent: "Race Winner" },
  { rank: "#2", name: "Deadshot", wins: 98, recent: "Last Man Standing" },
  { rank: "#3", name: "Tank_User", wins: 45, recent: "City War" },
];

const mockHungerGames = [
  { rank: "#1", name: "Katniss_RP", wins: 84, matches: 210 },
  { rank: "#2", name: "Survive_All", wins: 52, matches: 402 },
  { rank: "#3", name: "Bush_Camper", wins: 41, matches: 850 },
];

const mockCrime = [
  { rank: "#1", name: "El_Chapo_RP", crimes: 8421, arrests: 45, type: "Organized Crime" },
  { rank: "#2", name: "Heist_King", crimes: 5210, arrests: 120, type: "Bank Robbery" },
  { rank: "#3", name: "JoyRider", crimes: 4102, arrests: 210, type: "Grand Theft Auto" },
  { rank: "#4", name: "Smuggler_D", crimes: 2401, arrests: 15, type: "Narcotic Trafficking" },
];

const mockSocial = [
  { rank: "#1", faction: "Los Santos PD", leader: "Chief_Wiggum", members: 42, wealth: "$850M" },
  { rank: "#2", faction: "Grove Street Families", leader: "Sweet", members: 28, wealth: "$120M" },
  { rank: "#3", faction: "Ballas", leader: "Kane", members: 35, wealth: "$95M" },
  { rank: "#4", faction: "Vagos", leader: "Big_Poppa", members: 15, wealth: "$45M" },
];

const mockSkins = [
  { rank: "#1", id: 294, name: "The Boss", pop: "14.2%" },
  { rank: "#2", id: 299, name: "Claude (GTA3)", pop: "11.1%" },
  { rank: "#3", id: 21, name: "Street Gang", pop: "9.5%" },
  { rank: "#4", id: 46, name: "Mechanic", pop: "8.2%" },
];

const mockCars = [
  { rank: "#1", model: "Infernus", class: "Super", total: 421 },
  { rank: "#2", model: "NRG-500", class: "Bike", total: 385 },
  { rank: "#3", model: "Sultan", class: "Sports", total: 310 },
  { rank: "#4", model: "Turismo", class: "Super", total: 240 },
];
