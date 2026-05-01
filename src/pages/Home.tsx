import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit, doc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Megaphone, Calendar, User, Terminal, Copy, ShieldAlert, Zap, Trophy, Users, ChevronRight, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "../components/Toast";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
}

interface Event {
  id: string;
  title: string;
  type: string;
  startTime: string;
  status: string;
  prize?: string;
}

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const serverIp = "SERVER.RECKLESSRP.NET:7777";
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5));
    const unsubAnnouncements = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "server"), (doc) => {
      if (doc.exists()) {
        setMaintenance(!!doc.data().maintenanceMode);
      }
    });

    const qEvents = query(
      collection(db, "events"), 
      orderBy("startTime", "asc"), 
      limit(1)
    );
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      if (!snap.empty) {
        setFeaturedEvent({ id: snap.docs[0].id, ...snap.docs[0].data() } as Event);
      }
    });

    return () => { unsubAnnouncements(); unsubSettings(); unsubEvents(); };
  }, []);

  const copyIp = () => {
    navigator.clipboard.writeText(serverIp);
    toast("info", "IP Copied", "Server IP copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[650px] flex items-center overflow-hidden bg-black">
        <img 
          src="https://images.unsplash.com/photo-1614850715649-1d01062939d7?auto=format&fit=crop&q=80&w=2000" 
          alt="Gaming City" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 contrast-125 saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-(--bg-color) via-transparent to-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        
        <div className="relative z-20 px-8 md:px-16 flex flex-col gap-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-(--accent) text-xl font-marker -rotate-3 mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Welcome to the Jungle</span>
            <h1 className="text-8xl md:text-[160px] font-display font-normal uppercase leading-[0.8] text-white tracking-tighter mix-blend-difference">
              RECKLESS<br/>
              <span className="text-(--accent)">LEGACY</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/60 font-medium max-w-2xl mt-8 italic border-l-4 border-(--accent) pl-8 py-2 font-display uppercase tracking-widest">
              High Stakes. Zero Rules.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-6 mt-8"
          >
            <button 
              onClick={copyIp}
              className="gta-button group"
            >
              <span>Connect: {serverIp}</span>
            </button>
            <Link 
              to="/highscores"
              className="relative overflow-hidden px-10 py-4 bg-white/5 border-2 border-white/20 text-white font-display text-xl uppercase tracking-widest hover:bg-white/10 transition-all italic transform -skew-x-12"
            >
              <span className="inline-block skew-x-12">Leaderboards</span>
            </Link>
          </motion.div>
        </div>

        {/* HUD Elements */}
        <div className="absolute top-12 right-12 z-30 hidden xl:flex flex-col gap-4">
           <div className="hud-box">
              <span className="text-[10px] font-black uppercase text-(--accent-secondary) tracking-widest mb-2 block">Surveillance Link</span>
              <div className="flex gap-1">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 wanted-star"><Trophy size={16} /></div>)}
              </div>
           </div>
           <div className="hud-box bg-(--accent)/90 text-black border-none text-right">
              <span className="text-4xl font-display italic leading-none">$1,245,900</span>
              <span className="text-[10px] font-black uppercase block mt-1 tracking-widest">Global Pool</span>
           </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 px-2 md:px-0">
        <div className="flex-1 min-w-0 flex flex-col gap-10">
          {/* Featured Content Row */}
          {featuredEvent && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-pink-500" size={20} />
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Featured Operation</h2>
              </div>
              <Link to={`/events/${featuredEvent.id}`} className="group">
                <div className="portal-card relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20 hover:border-pink-500/40 transition-all p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-pink-500 tracking-widest">Next Engagement</span>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight group-hover:text-pink-500 transition-colors">{featuredEvent.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase mt-2">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(featuredEvent.startTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-emerald-400"><Trophy size={12} /> {featuredEvent.prize || "Glory & Respect"}</span>
                    </div>
                  </div>
                  <div className="bg-pink-500 text-black px-6 py-3 font-black uppercase text-[10px] tracking-widest group-hover:bg-white transition-colors flex items-center gap-2 select-none">
                    Mission Briefing <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Announcements */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Megaphone className="text-(--accent)" size={20} />
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Radio Los Santos</h2>
            </div>

            {maintenance && (
              <div className="bg-red-500/10 border border-red-500 p-4 mb-8 flex items-center gap-4 text-red-500">
                <ShieldAlert size={24} />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest">Maintenance Mode Active</h4>
                  <p className="text-[10px] font-bold uppercase opacity-80">The game server is currently offline for scheduled updates.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-8">
              {loading ? (
                <div className="portal-card p-20 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-(--accent) border-t-transparent rounded-full animate-spin shadow-[0_0_15px_var(--glow)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Decrypting Files...</span>
                </div>
              ) : announcements.length === 0 ? (
                <div className="portal-card p-12 text-center text-xs text-gray-500 font-bold uppercase border-dashed border-white/5">
                   No transmissions received from HQ yet.
                </div>
              ) : announcements.map((post, idx) => (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="portal-card group bg-black/40 border-white/5"
                >
                  <div className="portal-header bg-black/80">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-(--accent) flex items-center justify-center -rotate-6">
                        <Megaphone size={20} className="text-black rotate-6" />
                      </div>
                      <span className="text-(--accent) text-3xl italic font-display">{post.title}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-white/40 text-[11px] font-black uppercase tracking-[0.2em] italic">
                      <span className="flex items-center gap-2"><User size={14} className="text-(--accent)" /> {post.author}</span>
                      <span className="flex items-center gap-2"><Calendar size={14} className="text-(--accent)" /> {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="p-12 text-lg md:text-xl leading-relaxed text-white/90 whitespace-pre-line font-display tracking-tight border-b border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
                    {post.content}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-8">
          <div className="portal-card">
            <div className="portal-header">Quick Navigation</div>
            <div className="p-4 flex flex-col gap-2">
              <SidebarNavLink to="/forum" label="Community Forum" icon={<MessageSquare size={14} />} />
              <SidebarNavLink to="/events" label="Upcoming Events" icon={<Calendar size={14} />} />
              <SidebarNavLink to="/highscores" label="Player Rankings" icon={<Trophy size={14} />} />
              <SidebarNavLink to="/donations" label="Support Server" icon={<Zap size={14} />} />
              <SidebarNavLink to="/server" label="Technical Docs" icon={<Terminal size={14} />} />
            </div>
          </div>

          <div className="portal-card overflow-hidden">
            <div className="portal-header">Connection Node</div>
            <div className="p-8 bg-gradient-to-b from-black/60 to-black/90 flex flex-col items-center gap-8 text-center border-b border-white/5 relative">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
                <div className="absolute top-0 right-0 w-1 h-4 bg-(--accent)" />
                <div className="absolute top-0 right-0 w-4 h-1 bg-(--accent)" />
              </div>

              <div className="w-24 h-24 bg-(--accent)/5 border border-(--accent)/20 flex items-center justify-center rotate-6 shadow-[0_0_30px_rgba(56,189,248,0.1)] relative group">
                <Terminal className="text-(--accent) -rotate-6 transition-transform group-hover:scale-125" size={40} />
                <div className="absolute inset-0 border-2 border-(--accent) opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-xl font-black italic tracking-tighter text-white neon-text">{serverIp}</h4>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] leading-relaxed opacity-60">Authentication Layer Protocol<br/>Sector: San Andreas [7777]</p>
              </div>
              <button 
                onClick={copyIp}
                className="w-full bg-(--accent) text-black py-5 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white transition-all transform hover:-translate-y-1 shadow-[0_10px_20px_rgba(56,189,248,0.2)] group"
              >
                <Copy size={18} className="group-hover:rotate-12 transition-transform" /> Copy IP Identity
              </button>
            </div>
          </div>

          <div className="portal-card">
            <div className="portal-header">Discord Community</div>
            <div className="p-8 text-center flex flex-col gap-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#5865F2] blur-xl opacity-20 rounded-full" />
                  <img src="https://assets-global.website-files.com/6257adef93867e3ed1089209/631616f733158c5c709ad947_discord-mark-blue.svg" alt="Discord" className="w-16 h-16 relative" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed italic">Join 12,000+ members on our official Discord for live updates and support.</p>
              <a 
                href="https://discord.gg/recklessrp"
                target="_blank"
                rel="noreferrer"
                className="bg-[#5865F2] text-white py-3 font-black uppercase text-[10px] tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                Launch Discord
              </a>
            </div>
          </div>

          <div className="portal-card">
            <div className="portal-header">Recent Performance</div>
            <div className="p-0">
               <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-500">Record Online</span>
                    <span className="text-lg font-black italic">412 Players</span>
                  </div>
                  <Users size={18} className="text-gray-700" />
               </div>
               <div className="p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-500">Global Events</span>
                    <span className="text-lg font-black italic">2,142 Hosted</span>
                  </div>
                  <Zap size={18} className="text-gray-700" />
               </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HeroStat({ label, value, sub, color = "text-white" }: { label: string, value: string, sub: string, color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">{label}</span>
      <span className={clsx("text-4xl font-black italic tracking-tighter uppercase leading-none font-display", color)}>{value}</span>
      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mt-1">{sub}</span>
    </div>
  );
}

function SidebarNavLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link 
      to={to} 
      className="flex items-center justify-between p-3 bg-black/40 border border-white/5 hover:border-(--accent)/50 hover:bg-(--accent)/5 transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="text-(--accent) group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ChevronRight size={12} className="text-gray-600 group-hover:text-(--accent) group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
