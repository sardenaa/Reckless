import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink as RouterNavLink } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, query, collection, orderBy, limit, onSnapshot, collectionGroup } from "firebase/firestore";
import { Terminal, Users, MessageSquare, Trophy, CreditCard, LayoutDashboard, Menu, X, LogIn, UserPlus, Sun, Moon, ShieldAlert, Gavel, Calendar, ChevronRight } from "lucide-react";
import { io } from "socket.io-client";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import Highscores from "./pages/Highscores";
import Donations from "./pages/Donations";
import ServerInfo from "./pages/ServerInfo";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import { ToastProvider } from "./components/Toast";
import RadioChatter from "./components/RadioChatter";
import CustomCursor from "./components/CustomCursor";

const socket = io();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banData, setBanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [serverStats, setServerStats] = useState({ online: false, maintenance: false, players: 0, maxPlayers: 500 });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let unsubUserData: (() => void) | null = null;
    let unsubBanData: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (unsubUserData) {
        unsubUserData();
        unsubUserData = null;
      }
      if (unsubBanData) {
        unsubBanData();
        unsubBanData = null;
      }

      if (u) {
        unsubUserData = onSnapshot(doc(db, "users", u.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const isAdminRole = ['Admin', 'Super Admin'].includes(data.role);
            const hasStaffPerms = data.permissions && (
              data.permissions.canEditForums || 
              data.permissions.canManageServer || 
              data.permissions.canManageUsers ||
              data.permissions.canPostAnnouncements
            );
            const isModerator = ['Moderator', 'Forum Moderator', 'Server Manager'].includes(data.role);
            setIsAdmin(isAdminRole || isModerator || !!hasStaffPerms);
          }
        });

        // Detect Bans
        unsubBanData = onSnapshot(doc(db, "bans", u.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const bannedAt = data.bannedAt?.toDate();
            const durationStr = data.duration || "Permanent";

            if (durationStr === "Permanent") {
              setIsBanned(true);
              setBanData(data);
            } else if (bannedAt) {
              const [amount, unit] = durationStr.split(" ");
              const ms = parseInt(amount) * (
                unit.startsWith("Minute") ? 60000 :
                unit.startsWith("Hour") ? 3600000 :
                unit.startsWith("Day") ? 86400000 : 0
              );
              
              if (Date.now() < bannedAt.getTime() + ms) {
                setIsBanned(true);
                setBanData(data);
              } else {
                setIsBanned(false);
                setBanData(null);
              }
            }
          } else {
            setIsBanned(false);
            setBanData(null);
          }
        });
        
        const adminDoc = await getDoc(doc(db, "admins", u.uid));
        if (adminDoc.exists() || u.email === "diamond.entertainment70@gmail.com") {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    socket.on("server_stats", (stats) => {
      setServerStats(stats);
    });

    return () => {
      unsubscribe();
      socket.off("server_stats");
    };
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-6 font-mono overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-[1000] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-(--accent) text-[10px] flex flex-col gap-1.5 max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-6 border-b border-(--accent)/30 pb-2">
            <span className="font-black italic text-lg uppercase tracking-widest">ReckLess OS v2.0</span>
            <span className="animate-pulse bg-(--accent) text-black px-2 py-0.5 font-black">BOOTING...</span>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>[OK] Initializing Firebase Auth Container...</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>[OK] Handshake: 145.239.149.102:7777</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>[OK] Verifying Community Credentials...</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>[OK] Loading Radio Frequency Hash...</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>[OK] Establishing Secure Bridge...</motion.p>
          <div className="relative h-1 bg-white/5 w-full mt-4 overflow-hidden border border-white/10">
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: "0%" }} 
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-(--accent) shadow-[0_0_15px_#f27d26]" 
            />
          </div>
          <div className="mt-4 text-(--text-secondary) flex justify-between">
            <span>KERN_5.14.0-362</span>
            <span>SYSTEM_READY</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isBanned && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
        <div className="max-w-xl w-full border border-red-500/50 bg-red-500/5 p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 bg-red-500 flex items-center justify-center animate-pulse">
            <ShieldAlert size={32} className="text-black" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic">Access Terminated</h1>
            <p className="text-gray-400 text-sm">Your account has been permanently or temporarily suspended from ReckLess RolePlay.</p>
          </div>
          
          <div className="w-full grid grid-cols-1 gap-4 text-left border-y border-red-500/20 py-6 my-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-red-500 font-black uppercase">Reason for Suspension</span>
              <span className="text-sm text-gray-200">{banData?.reason || "No reason specified."}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-red-500 font-black uppercase">Suspended By</span>
              <span className="text-sm text-gray-400">{banData?.bannedBy || "System Admin"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-red-500 font-black uppercase">Suspension Date</span>
              <span className="text-sm text-gray-400">{banData?.bannedAt?.toDate().toLocaleString() || "N/A"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <p className="text-[10px] text-gray-500 uppercase">If you believe this is an error, you can submit an appeal on our Discord.</p>
            <button 
              onClick={() => auth.signOut()}
              className="bg-white text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <CustomCursor />
        <RadioChatter />
        <div className="min-h-screen flex flex-col bg-(--bg-color) text-(--text-primary) font-sans overflow-x-hidden relative selection:bg-(--accent) selection:text-black">
          {/* Scanline Effect Overlay */}
          <div className="scanline" />
          
          {/* Cyber Grid Background */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.2] dark:opacity-[0.05]" 
               style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--accent) 1px, transparent 0)', backgroundSize: '60px 60px' }} />
          
          {/* Top Branding Bar */}
        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl md:hidden overflow-y-auto"
            >
              <div className="p-6 flex flex-col gap-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-(--accent) flex items-center justify-center rotate-45">
                      <Terminal className="-rotate-45 text-black w-5 h-5" />
                    </div>
                    <span className="font-mono text-xl font-black tracking-tighter uppercase italic">Navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleTheme}
                      className="p-2 border border-white/10 text-white rounded-sm"
                      title="Toggle Theme"
                    >
                      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 border border-white/10 text-white rounded-sm">
                      <X size={24} />
                    </button>
                  </div>
                </div>
                
                <nav className="flex flex-col gap-2">
                  <MobileNavItem to="/" icon={<LayoutDashboard size={20} />} label="News" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavItem to="/forum" icon={<MessageSquare size={20} />} label="Forum" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavItem to="/events" icon={<Calendar size={20} />} label="Events" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavItem to="/highscores" icon={<Trophy size={20} />} label="Highscores" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavItem to="/server" icon={<Users size={20} />} label="Server Status" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavItem to="/donations" icon={<CreditCard size={20} />} label="Support Us" onClick={() => setIsMenuOpen(false)} />
                </nav>

                <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                  {user ? (
                    <>
                      <Link 
                        to={`/profile/${user.uid}`} 
                        onClick={() => setIsMenuOpen(false)}
                        className="p-4 bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-(--accent)/20 border border-(--accent)/50 flex items-center justify-center text-sm font-mono">
                            {user.displayName?.[0] || user.email?.[0] || "?"}
                          </div>
                          <span className="font-mono text-sm">{user.displayName || user.email?.split('@')[0]}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                      </Link>
                      <button 
                        onClick={() => { auth.signOut(); setIsMenuOpen(false); }}
                        className="p-4 border border-red-500/30 text-red-500 font-black uppercase text-xs tracking-widest text-left"
                      >
                        Logout Account
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Link 
                        to="/login" 
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-white text-black p-4 text-center font-black uppercase text-xs tracking-widest"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-white/5 border border-white/10 p-4 text-center font-black uppercase text-xs tracking-widest"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="bg-black border-b-2 border-(--accent) px-6 py-6 flex items-center justify-between z-50 sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-white flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                 <Terminal className="text-black w-8 h-8" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-4xl font-normal tracking-tight uppercase italic leading-none text-white">
                ReckLess <span className="text-(--accent)">RolePlay</span>
              </span>
              <span className="text-[10px] font-mono tracking-[0.5em] text-(--accent) opacity-60 uppercase font-bold">Operation_Portal_v2.0</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <TopbarLink to="/" icon={<LayoutDashboard size={16} />} label="News" />
            <TopbarLink to="/forum" icon={<MessageSquare size={16} />} label="Forum" />
            <TopbarLink to="/events" icon={<Calendar size={16} />} label="Events" />
            <TopbarLink to="/highscores" icon={<Trophy size={16} />} label="Stats" />
            <TopbarLink to="/server" icon={<Users size={16} />} label="Server" />
            <TopbarLink to="/donations" icon={<CreditCard size={16} />} label="Donate" />
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/5 transition-colors text-(--text-secondary)"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link to="/admin" className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 text-xs font-black uppercase tracking-tighter">
                    <ShieldAlert size={14} /> Admin
                  </Link>
                )}
                <div className="relative group">
                  <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-(--border-color) transition-colors">
                    <div className="w-6 h-6 bg-(--accent)/20 border border-(--accent)/50 flex items-center justify-center text-[10px] font-mono">
                      {user.displayName?.[0] || user.email?.[0] || "?"}
                    </div>
                    <span className="text-xs font-mono hidden sm:inline">{user.displayName || user.email?.split('@')[0]}</span>
                  </Link>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-(--card-bg) border border-(--border-color) hidden group-hover:flex flex-col z-[100] shadow-2xl">
                    <button 
                      onClick={() => auth.signOut()}
                      className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                      Logout Account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center gap-1 text-xs font-bold uppercase hover:text-(--accent) transition-colors">
                  <LogIn size={14} /> Login
                </Link>
                <span className="opacity-20">/</span>
                <Link to="/register" className="flex items-center gap-1 text-xs font-bold uppercase hover:text-(--accent) transition-colors">
                  <UserPlus size={14} /> Join
                </Link>
              </div>
            )}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Info Ticker */}
        <div className="bg-black text-white p-2 px-6 overflow-hidden hidden sm:block relative border-b border-white/5">
          <div className="flex gap-12 whitespace-nowrap animate-marquee font-display text-xs items-center uppercase italic font-medium">
             <span className="text-(--accent) flex items-center gap-2"><div className="w-2 h-2 bg-(--accent) animate-pulse rounded-full" /> Status: Global Surveillance Active</span>
             <span>// Current Objective: Maintain Authority</span>
             <span>// Uplink: ReckLessRP.Net:7777</span>
             <span>// Warning: Excessive Force Authorized</span>
             <span className="text-(--accent) flex items-center gap-2"><div className="w-2 h-2 bg-(--accent) animate-pulse rounded-full" /> Status: Global Surveillance Active</span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex max-w-7xl mx-auto w-full p-6 gap-6 relative">
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forum/*" element={<Forum />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/highscores" element={<Highscores />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/server" element={<ServerInfo />} />
              <Route path="/profile/:uid" element={<Profile />} />
              <Route path="/admin/*" element={isAdmin ? <AdminPanel /> : <Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </div>

          {/* Persistent Sidebar */}
          <aside className="w-72 hidden lg:flex flex-col gap-6">
            <SidebarWidget title="Quick Navigation">
              <nav className="flex flex-col gap-1">
                <SidebarNavLink to="/forum" label="Discussion Forums" desc="Community talk & help" />
                <SidebarNavLink to="/events" label="Event Schedule" desc="Live OPS & operations" />
                <SidebarNavLink to="/highscores" label="Global Ranks" desc="Top player leaderboards" />
                <SidebarNavLink to="/donations" label="Store & Support" desc="Unlock vip perks" />
                <SidebarNavLink to="/server" label="Technical Info" desc="Server specs & rules" />
              </nav>
            </SidebarWidget>

            <SidebarWidget title="Server Status">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-(--text-secondary)">Status:</span>
                  <span className={clsx("font-bold flex items-center gap-1", serverStats.online ? (serverStats.maintenance ? "text-yellow-500" : "text-emerald-400") : "text-red-500")}>
                    <span className={clsx("w-2 h-2 rounded-full", serverStats.online ? (serverStats.maintenance ? "bg-yellow-500" : "bg-emerald-400 animate-pulse") : "bg-red-500")} /> {serverStats.online ? (serverStats.maintenance ? "MAINTENANCE" : "ONLINE") : "OFFLINE"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-(--text-secondary)">Players:</span>
                  <span className="font-mono">{serverStats.players} / {serverStats.maxPlayers}</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 mt-1 overflow-hidden">
                  <div className="bg-(--accent) h-full transition-all duration-500" style={{ width: `${(serverStats.players / serverStats.maxPlayers) * 100}%` }} />
                </div>
                <button className="w-full mt-2 py-2 bg-(--accent) text-white font-black uppercase text-[10px] tracking-widest hover:opacity-80 transition-colors">
                  Join Server
                </button>
              </div>
            </SidebarWidget>

            <SidebarWidget title="Social Links">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                <a href="#" className="flex items-center justify-center p-2 bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-colors">Discord</a>
                <a href="#" className="flex items-center justify-center p-2 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 transition-colors">Twitter</a>
                <a href="#" className="flex items-center justify-center p-2 bg-[#FF0000]/10 border border-[#FF0000]/20 hover:bg-[#FF0000]/20 transition-colors">YouTube</a>
                <a href="#" className="flex items-center justify-center p-2 bg-[#E1306C]/10 border border-[#E1306C]/20 hover:bg-[#E1306C]/20 transition-colors">Instagram</a>
              </div>
            </SidebarWidget>

            <SidebarWidget title="Recent Threads">
              <RecentThreadsList />
            </SidebarWidget>
          </aside>
        </main>

        <footer className="bg-(--line) border-t border-(--border-color) p-8 text-center text-(--text-secondary) text-xs">
          <p className="mb-2 font-mono font-bold tracking-widest uppercase">ReckLess RolePlay &copy; 2026</p>
          <p>Powered by Open.mp & Firebase. Not affiliated with Rockstar Games or Take-Two Interactive.</p>
        </footer>
      </div>
    </Router>
  </ToastProvider>
  );
}

function MobileNavItem({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <RouterNavLink 
      to={to} 
      onClick={onClick}
      className={({ isActive }) => clsx(
        "flex items-center gap-4 p-4 transition-all duration-300",
        isActive ? "bg-(--accent) text-black font-black" : "bg-white/5 hover:bg-white/10 text-gray-400 font-bold"
      )}
    >
      {icon}
      <span className="uppercase tracking-widest text-sm">{label}</span>
      <ChevronRight size={16} className="ml-auto opacity-50" />
    </RouterNavLink>
  );
}

function SidebarNavLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <RouterNavLink 
      to={to} 
      className={({ isActive }) => clsx(
        "flex flex-col gap-0.5 p-4 transition-all relative overflow-hidden group border-l-2",
        isActive 
          ? "bg-(--accent)/10 border-l-(--accent) text-(--accent)" 
          : "bg-black/20 border-l-transparent text-gray-500 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-b-0"
      )}
    >
      {({ isActive }) => (
        <>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] font-display italic transition-colors group-hover:text-(--accent)">{label}</span>
          <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">{desc}</span>
          {isActive && (
            <motion.div 
              layoutId="sidebar-active-glow"
              className="absolute inset-0 bg-gradient-to-r from-(--accent)/10 to-transparent pointer-events-none"
            />
          )}
        </>
      )}
    </RouterNavLink>
  );
}

function RecentThreadsList() {
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    // collectionGroup allows fetching subcollections named "threads" across all "forums"
    const q = query(collectionGroup(db, "threads"), orderBy("createdAt", "desc"), limit(4));
    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("RecentThreadsList Error:", err.message);
      // Fallback: This error usually occurs because a composite index is required for collectionGroup + orderBy.
      // The user can follow the link in the browser console to create it.
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {threads.length === 0 ? (
        <p className="text-[10px] text-gray-500 font-bold uppercase italic">No activity detected.</p>
      ) : threads.map(t => (
        <Link 
          key={t.id} 
          to={t.forumId ? `/forum/${t.forumId}` : "/forum"} 
          className="p-3 bg-black/40 border border-white/5 hover:bg-(--accent)/5 hover:border-(--accent)/30 transition-all group block relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={10} className="text-(--accent)" />
          </div>
          <h4 className="text-[11px] font-black uppercase italic group-hover:text-(--accent) transition-colors truncate mb-1 pr-4">{t.title}</h4>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
            <span>By {t.authorName || t.author || "System"}</span>
            <span>{t.createdAt?.toDate().toLocaleDateString() || "Recently"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function TopbarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <RouterNavLink 
      to={to} 
      className={({ isActive }) => clsx(
        "flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all py-3 relative group font-display italic",
        isActive ? "text-(--accent) neon-text" : "text-(--text-secondary) hover:text-white"
      )}
    >
      <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2"
      >
        {icon} 
        <span className="relative z-10">{label}</span>
      </motion.div>
      <AnimatePresence>
        {(window.location.pathname === (to === "/" ? "/" : to)) && (
          <motion.div 
            layoutId="nav-underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--accent) shadow-[0_0_10px_var(--glow)] z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </RouterNavLink>
  );
}

function SidebarWidget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="portal-card overflow-hidden bg-black/40 backdrop-blur-md relative group">
      <div className="absolute top-0 right-0 p-2 opacity-5 italic text-[8px] font-black select-none pointer-events-none group-hover:opacity-10 transition-opacity">SYS_WIDGET</div>
      <div className="portal-header bg-black/60 border-b border-white/5 py-3 px-5">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-3 bg-(--accent) shadow-[0_0_10px_var(--glow)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] font-display italic">{title}</span>
         </div>
      </div>
      <div className="p-5">
        {children}
      </div>
      {/* HUD corner lines */}
      <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-white/10" />
    </div>
  );
}

function RecentThread({ title, author, time }: { title: string; author: string; time: string }) {
  return (
    <div className="group cursor-pointer">
      <h4 className="text-xs font-bold group-hover:text-(--accent) transition-colors truncate">{title}</h4>
      <div className="flex justify-between text-[10px] text-(--text-secondary) mt-0.5">
        <span>by {author}</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
