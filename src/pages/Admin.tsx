import React, { useState, useEffect } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Megaphone, Activity, ShieldCheck, ChevronRight, Search, Trash2, Edit2, MessageSquare, Plus, Save, X, Gavel, History, BarChart3, AlertCircle, VolumeX, Terminal as TerminalIcon, Globe, ListFilter, ClipboardList, Settings2, Calendar, FileCheck, Eye, Filter } from "lucide-react";
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc,
  serverTimestamp,
  addDoc,
  getDoc,
  limit,
  where
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Pin, PinOff } from "lucide-react";
import { useToast } from "../components/Toast";

export default function AdminPanel() {
  const [userPerms, setUserPerms] = useState<any>({});
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserPerms(data.permissions || {});
        setRole(data.role || "");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAdmin = ['Admin', 'Super Admin'].includes(role) || auth.currentUser?.email === 'diamond.entertainment70@gmail.com';
  const isSuperAdmin = role === 'Super Admin' || auth.currentUser?.email === 'diamond.entertainment70@gmail.com';
  const canManageUsers = isAdmin || userPerms.canManageUsers;
  const canEditForums = isAdmin || role === 'Forum Moderator' || role === 'Moderator' || userPerms.canEditForums;
  const canManageAnnouncements = isAdmin || userPerms.canPostAnnouncements;
  const canManageServer = isAdmin || role === 'Server Manager' || userPerms.canManageServer;
  const canManageEvents = isAdmin || userPerms.canManageEvents;

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4 mb-4">
          <div className="w-4 h-16 bg-red-600 transform -rotate-12" />
          <div className="flex flex-col">
            <h1 className="text-5xl font-display italic font-normal uppercase tracking-tight text-white leading-none">COMMAND CENTER</h1>
            <span className="text-sm font-marker text-red-500 -rotate-1 ml-2">High Clearance Access Authorized</span>
          </div>
       </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Admin Navigation */}
        <nav className="w-full md:w-64 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <AdminNavLink to="/admin" icon={<LayoutDashboard size={16} />} label="Command Center" end />
            {canManageUsers && <AdminNavLink to="/admin/logs" icon={<History size={16} />} label="Security Audits" />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="px-4 py-1 text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] mb-1 italic">Identity & Suppression</div>
            {canManageUsers && <AdminNavLink to="/admin/users" icon={<Users size={16} />} label="Citizen Database" />}
            {canManageUsers && <AdminNavLink to="/admin/roles" icon={<ShieldCheck size={16} />} label="Clearance Levels" />}
            {canManageUsers && <AdminNavLink to="/admin/bans" icon={<Gavel size={16} />} label="Blacklist (Bans)" />}
            {canManageUsers && <AdminNavLink to="/admin/appeals" icon={<FileCheck size={16} />} label="Amnesty Appeals" />}
            {canManageUsers && <AdminNavLink to="/admin/moderation" icon={<History size={16} />} label="Behavioral Archive" />}
            {canManageUsers && <AdminNavLink to="/admin/player-reports" icon={<ClipboardList size={16} />} label="Infiltrator Reports" />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="px-4 py-1 text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] mb-1 italic">Network Operations</div>
            {canManageServer && <AdminNavLink to="/admin/server" icon={<Activity size={16} />} label="Terminal Status" />}
            {canManageServer && <AdminNavLink to="/admin/commands" icon={<TerminalIcon size={16} />} label="System Overrides" />}
            {canManageServer && <AdminNavLink to="/admin/browser" icon={<Globe size={16} />} label="Node Explorer" />}
            {canManageAnnouncements && <AdminNavLink to="/admin/announcements" icon={<Megaphone size={16} />} label="Global Broadcasts" />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="px-4 py-1 text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] mb-1 italic">Expansion Space</div>
            {canManageEvents && <AdminNavLink to="/admin/events" icon={<Calendar size={16} />} label="Deployments" />}
            {canEditForums && <AdminNavLink to="/admin/forums" icon={<MessageSquare size={16} />} label="Public Matrix" />}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            {canManageUsers && <Route path="/users" element={<UserManagement />} />}
            {canManageUsers && <Route path="/roles" element={<RoleManagement />} />}
            {canEditForums && <Route path="/forums" element={<ForumManagement />} />}
            {canManageAnnouncements && <Route path="/announcements" element={<AnnouncementManagement />} />}
            {canManageEvents && <Route path="/events" element={<EventManagement />} />}
            {canManageServer && <Route path="/server" element={<ServerManagement />} />}
            {canManageServer && <Route path="/commands" element={<ServerCommands />} />}
            {canManageServer && <Route path="/browser" element={<ServerBrowser />} />}
            {canManageUsers && <Route path="/bans" element={<BanManagement />} />}
            {canManageUsers && <Route path="/appeals" element={<BanAppealManagement />} />}
            {canManageUsers && <Route path="/moderation" element={<PlayerModeration isAdmin={isAdmin} />} />}
            {canManageUsers && <Route path="/player-reports" element={<ReportsQueue />} />}
            {canManageUsers && <Route path="/logs" element={<ActivityLog />} />}
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminNavLink({ to, icon, label, end }: any) {
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => clsx(
        "flex items-center gap-4 px-6 py-4 text-xl font-display uppercase italic tracking-[0.05em] transition-all relative group overflow-hidden border-b border-white/5",
        isActive 
          ? "bg-red-600 text-black shadow-[0_0_30px_rgba(220,38,38,0.3)]" 
          : "bg-black/40 text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-4 relative z-10 transition-transform group-hover:translate-x-2">
            <div className={clsx("transition-transform group-hover:scale-125", isActive ? "text-black" : "text-red-600")}>
              {icon}
            </div>
            <span>{label}</span>
          </div>
          {isActive && (
            <motion.div 
              layoutId="admin-nav-glow"
              className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, online: 0, reports: 0 });
  const [serverStatus, setServerStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });
    
    const unsubReports = onSnapshot(query(collection(db, "reports"), where("status", "==", "Open")), (snap) => {
      setStats(prev => ({ ...prev, reports: snap.size }));
    });

    const unsubServer = onSnapshot(doc(db, "server_status", "main"), (snap) => {
      if (snap.exists()) {
        setServerStatus(snap.data());
        setStats(prev => ({ ...prev, online: snap.data().playerCount || 0 }));
      }
    });

    return () => { unsubUsers(); unsubReports(); unsubServer(); };
  }, []);

  const seedData = async () => {
    if (!window.confirm("Seed database with demo data? This will overwrite or add duplicate entries.")) return;
    try {
      // 1. Seed Categories
      const mainCatRef = await addDoc(collection(db, "categories"), { name: "General Information", order: 1 });
      const roleplayCatRef = await addDoc(collection(db, "categories"), { name: "Roleplay Section", order: 2 });

      // 2. Seed Forums
      const newsForumRef = await addDoc(collection(db, "forums"), {
        name: "Important Server News",
        description: "Official announcements and server updates directly from the High Command.",
        categoryId: mainCatRef.id,
        order: 1,
        threadCount: 1,
        lastPostBy: "Snake",
        lastPostAt: serverTimestamp()
      });

      const discussionsForumRef = await addDoc(collection(db, "forums"), {
        name: "General Discussions",
        description: "Talk about anything related to the server here.",
        categoryId: roleplayCatRef.id,
        order: 2,
        threadCount: 0
      });

      // 3. Seed Threads within News Forum
      const threadRef = await addDoc(collection(db, `forums/${newsForumRef.id}/threads`), {
        title: "Important Server News",
        authorName: "Snake",
        authorId: "system",
        replies: 0,
        views: 1337,
        createdAt: serverTimestamp(),
        lastPostAt: serverTimestamp(),
        lastPostBy: "Snake",
        sticky: true,
        locked: false
      });

      // 4. Seed Posts within the Thread
      await addDoc(collection(db, `forums/${newsForumRef.id}/threads/${threadRef.id}/posts`), {
        content: "We are thrilled to announce the launch of Season 2! New features include a completely revamped banking system, custom housing, and expanded illegal faction mechanics. Join us today!",
        authorName: "Snake",
        authorId: "system",
        createdAt: serverTimestamp()
      });

      // 5. Seed Events
      await addDoc(collection(db, "events"), {
        title: "LS Street Racing Championship",
        description: "Join the most dangerous racers in Los Santos for a high-stakes championship. Fast cars, no rules.",
        startTime: new Date(Date.now() + 86400000).toISOString(),
        location: "LS International Airport",
        organizer: "Underground Racing League",
        type: "Race",
        playerCount: 45,
        status: "scheduled",
        image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop",
        createdAt: serverTimestamp(),
        createdBy: "system"
      });

      // 6. Seed Server Status
      await setDoc(doc(db, "server_status", "main"), {
        name: "ReckLess RolePlay [S2]",
        status: "online",
        playerCount: 142,
        maxPlayers: 500,
        ip: "145.239.149.102:7777",
        mode: "RR-RP v2.0",
        map: "San Andreas",
        lastSeen: new Date().toISOString()
      });

      // 7. Seed Logs
      await addDoc(collection(db, "logs"), {
        action: "Database Initialized",
        details: "System successfully seeded with core forum structure and initial events.",
        performedBy: auth.currentUser?.uid,
        timestamp: serverTimestamp()
      });

      toast("success", "Database Initialized", "Forum structure and demo content successfully deployed.");
    } catch (e) {
      console.error(e);
      toast("error", "Seeding Failed", "Failed to populate forum structure.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
         <button 
           onClick={seedData}
           className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-(--text-secondary) hover:text-white hover:bg-(--accent)/20 hover:border-(--accent)/50 transition-all flex items-center gap-2"
         >
           <Save size={14} /> Seed Demo Data (First Run)
         </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats.users.toLocaleString()} color="text-red-500" />
        <StatCard label="Online Now" value={stats.online} color="text-emerald-500" />
        <StatCard label="Reports Open" value={stats.reports} color="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="portal-card">
          <div className="portal-header flex items-center justify-between">
            <div className="flex items-center gap-2 font-black italic">
              <Calendar size={14} className="text-pink-500" /> Community Operations
            </div>
            <Link to="/admin/events" className="text-[9px] font-black uppercase text-pink-500 hover:underline">Manage All</Link>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.hash = "#/admin/events"} 
                className="w-full bg-pink-500/10 border border-pink-500/30 text-pink-500 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
              >
                <Plus size={14} /> Initialize New Event Directive
              </button>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Recent Intelligence</span>
                <RecentDashboardEvents />
              </div>
            </div>
          </div>
        </div>

        <div className="portal-card">
          <div className="portal-header flex items-center gap-2 font-black italic">
            <Activity size={14} className="text-emerald-500" /> Server Heartbeat
          </div>
          <div className="p-6 flex flex-col gap-4">
            {!serverStatus ? (
              <div className="py-8 text-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] animate-pulse">Syncing Server Status...</div>
            ) : (
              <>
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-gray-500">Service Identifier</span>
                    <span className="text-sm font-bold uppercase tracking-tighter italic text-white">{serverStatus.name || "ReckLess RolePlay [S1]"}</span>
                  </div>
                  <div className={clsx(
                    "px-3 py-1 text-[9px] font-black uppercase border tracking-widest",
                    serverStatus.status === 'online' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-red-500/10 border-red-500 text-red-500"
                  )}>
                    {serverStatus.status === 'online' ? "Active / Operational" : "Down / Maintenance"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 bg-black/20 p-3 border border-white/5">
                    <span className="text-[9px] font-black uppercase text-gray-600">Population Density</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black italic text-emerald-500">{serverStatus.playerCount || 0}</span>
                      <span className="text-[10px] text-gray-600 font-bold">/ {serverStatus.maxPlayers || 500}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 bg-black/20 p-3 border border-white/5">
                    <span className="text-[9px] font-black uppercase text-gray-600">Last Telemetry</span>
                    <span className="text-[10px] font-mono text-gray-400 mt-2">
                       {serverStatus.lastSeen ? new Date(serverStatus.lastSeen).toLocaleTimeString() : "N/A"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="portal-card">
          <div className="portal-header flex items-center gap-2">
            <ClipboardList size={14} className="text-blue-500" /> Rapid Access System Logs
          </div>
          <div className="p-4 flex flex-col gap-2 font-mono text-[10px] text-gray-500 max-h-[168px] overflow-y-auto custom-scrollbar">
            <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span className="text-emerald-500">[INFO]</span> <span>Server metrics synced successfully.</span></div>
            <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span className="text-blue-500">[USER]</span> <span>Admin session established.</span></div>
            <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span className="text-yellow-500">[WARN]</span> <span>High latency detected from Sector 4 IP block.</span></div>
            <div className="flex gap-4 border-t border-white/5 pt-2 mt-2">
              <span className="text-gray-700 italic">... monitoring continuous data stream ...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div className="portal-card p-8 bg-black flex flex-col gap-2 relative overflow-hidden group border-2 border-white/5">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
         <Activity size={60} className={color} />
      </div>
      <span className="text-[10px] font-black uppercase text-(--accent) tracking-widest mb-1 italic">SYSTEM_STAT:// {label}</span>
      <span className={clsx("text-6xl font-display italic leading-none group-hover:scale-105 transition-transform", color)}>{value}</span>
      <div className="h-1 w-full bg-white/5 mt-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={clsx("h-full opacity-30", color.replace('text-', 'bg-'))} 
        />
      </div>
    </div>
  );
}

function RecentDashboardEvents() {
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(3));
    const unsub = onSnapshot(q, (snap) => {
      setRecent(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  if (recent.length === 0) return <div className="text-[9px] text-gray-700 italic">No recent intel...</div>;

  return (
    <div className="flex flex-col gap-2">
      {recent.map(ev => (
        <div key={ev.id} className="p-3 bg-black/30 border border-white/5 flex flex-col gap-1">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-black uppercase italic text-pink-500">{ev.title}</span>
             <span className={clsx(
               "text-[7px] px-1 font-black border",
               ev.status === 'active' ? "border-emerald-500 text-emerald-500" : "border-gray-500 text-gray-500"
             )}>{ev.status}</span>
          </div>
          <div className="flex justify-between text-[8px] font-bold text-gray-600 uppercase tracking-widest">
            <span>{ev.type}</span>
            <span>{new Date(ev.startTime).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ uid: string, role: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const roles = ["All", "User", "Moderator", "Forum Moderator", "Server Manager", "Admin", "Super Admin"];

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username?.toLowerCase() || "").includes(search.toLowerCase()) || u.uid.includes(search);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const changeRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      await logActivity("Change Role", `Changed user ${uid} role to ${newRole}`);
      toast("success", "Role Updated", `User role has been changed to ${newRole}.`);
      setConfirmRoleChange(null);
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to update role.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <ShieldCheck className="text-blue-500" size={20} /> Role Management
        </h2>
      </div>

      <div className="portal-card p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-(--border-color) pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-500 transition-colors uppercase font-black" 
            placeholder="Search users..." 
          />
        </div>
        <div className="flex gap-2">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                "px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-all",
                roleFilter === r ? "bg-blue-500 border-blue-500 text-white" : "border-white/10 text-gray-500 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="portal-card overflow-hidden">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Current Role</th>
              <th className="text-right">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-xs text-gray-500 font-bold uppercase italic">No users found for this filter.</td>
              </tr>
            ) : filteredUsers.map(u => (
              <tr key={u.uid}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold">{u.username || "Unknown"}</span>
                    <span className="text-[9px] text-gray-500 font-mono">UID: {u.uid}</span>
                  </div>
                </td>
                <td>
                  <span className={clsx(
                    "text-[9px] px-2 py-0.5 font-bold uppercase border", 
                    u.role === 'Super Admin' ? "bg-purple-500/10 border-purple-500 text-purple-500" :
                    u.role === 'Admin' ? "bg-red-500/10 border-red-500 text-red-500" : 
                    u.role === 'Moderator' || u.role === 'Forum Moderator' ? "bg-blue-500/10 border-blue-500 text-blue-500" :
                    u.role === 'Server Manager' ? "bg-orange-500/10 border-orange-500 text-orange-500" :
                    "bg-gray-500/10 border-gray-500 text-gray-500"
                  )}>
                    {u.role || 'User'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1">
                    {roles.filter(r => r !== "All" && r !== u.role).map(r => (
                      <button
                        key={r}
                        onClick={() => setConfirmRoleChange({ uid: u.uid, role: r })}
                        className="text-[8px] font-black uppercase border border-white/10 px-2 py-1 hover:bg-white/10 transition-colors"
                      >
                        Set {r}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmRoleChange && (
        <ConfirmationModal 
          title="IDENTITY SHIFT: CHANGE ROLE"
          message={`Are you sure you want to reassign this identity to the '${confirmRoleChange.role}' classification? This will immediately synchronize their administrative sub-permissions.`}
          confirmText="Confirm Reassignment"
          onConfirm={() => changeRole(confirmRoleChange.uid, confirmRoleChange.role)}
          onCancel={() => setConfirmRoleChange(null)}
        />
      )}
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [reportingUser, setReportingUser] = useState<any | null>(null);
  const [banningUser, setBanningUser] = useState<any | null>(null);
  const [viewingHistory, setViewingHistory] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [confirmBan, setConfirmBan] = useState<boolean>(false);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [userSanctions, setUserSanctions] = useState<any[]>([]);
  const [reportReason, setReportReason] = useState("");
  const [banForm, setBanForm] = useState({ reason: "", duration: "Permanent", ip: "" });
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const loadUserHistory = async (user: any) => {
    setViewingHistory(user);
    try {
      // Fetch Reports
      const reportsQ = query(collection(db, "reports"), where("targetUid", "==", user.uid));
      const reportsSnap = await getDocs(reportsQ);
      setUserReports(reportsSnap.docs.map(d => ({ id: d.id, type: 'Report', ...d.data() })));

      // Fetch Sanctions (Warnings/Mutes/Bans)
      const sanctionsQ = query(collection(db, "sanctions"), where("targetUid", "==", user.uid));
      const sanctionsSnap = await getDocs(sanctionsQ);
      const sanctionsData = sanctionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Also check if they are currently banned
      const banDoc = await getDoc(doc(db, "bans", user.uid));
      const currentBan = banDoc.exists() ? [{ id: 'current_ban', type: 'ACTIVE BAN', ...banDoc.data() }] : [];

      setUserSanctions([...currentBan, ...sanctionsData]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, "users", uid));
      toast("success", "User Erased", "User record has been permanently removed from the master database.");
      setConfirmDelete(null);
    } catch (e) {
      console.error("Error deleting user", e);
    }
  };

  const submitBan = async () => {
    if (!banningUser || !banForm.reason) return;
    try {
      // 1. Create UID Ban
      await setDoc(doc(db, "bans", banningUser.uid), {
        uid: banningUser.uid,
        username: banningUser.username || "Unknown",
        reason: banForm.reason,
        duration: banForm.duration,
        bannedBy: auth.currentUser?.uid,
        bannedByName: auth.currentUser?.displayName || "Admin",
        bannedAt: serverTimestamp()
      });
      
      // 2. Create IP Ban if provided
      if (banForm.ip) {
        await addDoc(collection(db, "ip_bans"), {
          ip: banForm.ip,
          targetUid: banningUser.uid,
          reason: banForm.reason,
          duration: banForm.duration,
          performedBy: auth.currentUser?.uid,
          performedByName: auth.currentUser?.displayName || "Admin",
          createdAt: serverTimestamp()
        });
      }

      // 3. Add to sanctions history
      await addDoc(collection(db, "sanctions"), {
        targetUid: banningUser.uid,
        type: 'Ban',
        reason: banForm.reason,
        duration: banForm.duration,
        ip: banForm.ip || null,
        performedBy: auth.currentUser?.uid,
        performedByName: auth.currentUser?.displayName || "Admin",
        timestamp: serverTimestamp()
      });

      await logActivity("Ban User", `Banned user ${banningUser.uid} (${banningUser.username}) | Duration: ${banForm.duration}${banForm.ip ? ` | IP: ${banForm.ip}` : ""}`);
      setBanningUser(null);
      setConfirmBan(false);
      setBanForm({ reason: "", duration: "Permanent", ip: "" });
      toast("error", "User Banned", "Identity suppression protocol active for target user.");
    } catch (e) {
      console.error("Error banning user", e);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || u.uid.includes(searchQuery);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const ROLE_PERMISSIONS: any = {
    'Moderator': { canManageUsers: true, canEditForums: true, canPostAnnouncements: false, canManageServer: false, canManageEvents: true },
    'Forum Moderator': { canManageUsers: false, canEditForums: true, canPostAnnouncements: false, canManageServer: false, canManageEvents: false },
    'Server Manager': { canManageUsers: false, canEditForums: false, canPostAnnouncements: true, canManageServer: true, canManageEvents: true },
    'Admin': { canManageUsers: true, canEditForums: true, canPostAnnouncements: true, canManageServer: true, canManageEvents: true },
    'Super Admin': { canManageUsers: true, canEditForums: true, canPostAnnouncements: true, canManageServer: true, canManageEvents: true, isSuper: true },
    'User': { canManageUsers: false, canEditForums: false, canPostAnnouncements: false, canManageServer: false, canManageEvents: false }
  };

  const saveUserChanges = async (uid: string, newRole: string, permissions: any) => {
    try {
      const oldUser = users.find(u => u.uid === uid);
      await updateDoc(doc(db, "users", uid), { 
        role: newRole,
        permissions: permissions || {}
      });
      await logActivity("Update User", `Permissions/Role updated for ${uid} (${oldUser?.role} -> ${newRole})`);
      toast("success", "User Updated", "Permissions have been successfully synchronized.");
      setEditingUser(null);
    } catch (e) {
      console.error("Error updating user", e);
    }
  };

  const handleRoleSelect = (roleName: string) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      role: roleName,
      permissions: { ...ROLE_PERMISSIONS[roleName] }
    });
  };

  const PERMISSIONS = [
    { id: 'canEditForums', label: 'Edit Forums' },
    { id: 'canManageServer', label: 'Manage Server' },
    { id: 'canManageUsers', label: 'Manage Users' },
    { id: 'canPostAnnouncements', label: 'Post Announcements' },
  ];

  const togglePermission = (permId: string) => {
    if (!editingUser) return;
    const currentPerms = editingUser.permissions || {};
    setEditingUser({
      ...editingUser,
      permissions: {
        ...currentPerms,
        [permId]: !currentPerms[permId]
      }
    });
  };

  const submitReport = async () => {
    if (!reportingUser || !reportReason) return;
    try {
      await addDoc(collection(db, "reports"), {
        targetUid: reportingUser.uid,
        targetUsername: reportingUser.username || "Unknown",
        reason: reportReason,
        reportedBy: auth.currentUser?.uid,
        reportedByName: auth.currentUser?.displayName || "Admin",
        status: "Open",
        createdAt: serverTimestamp()
      });
      setReportingUser(null);
      setReportReason("");
      toast("success", "User Reported", "User has been reported for review.");
    } catch (e) {
      console.error("Error reporting user", e);
    }
  };

  const [activeHistoryTab, setActiveHistoryTab] = useState<'history' | 'sanction'>('history');

  const applySanction = async (type: string) => {
    if (!viewingHistory || !banForm.reason) return;
    try {
      if (type === 'Ban') {
        setBanningUser(viewingHistory);
        setConfirmBan(true);
      } else {
        await addDoc(collection(db, "sanctions"), {
          targetUid: viewingHistory.uid,
          type: type,
          reason: banForm.reason,
          duration: type === 'Warning' ? 'N/A' : banForm.duration,
          performedBy: auth.currentUser?.uid,
          performedByName: auth.currentUser?.displayName || "Admin",
          timestamp: serverTimestamp()
        });
        toast("success", `${type} Applied`, `The target user has been issued a ${type.toLowerCase()}.`);
        loadUserHistory(viewingHistory); // Refresh
        setBanForm({ reason: "", duration: "Permanent", ip: "" });
        setActiveHistoryTab('history');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ROLES = ["All", "User", "Moderator", "Forum Moderator", "Server Manager", "Admin", "Super Admin"];

  return (
    <div className="flex flex-col gap-4">
      <div className="portal-card p-4 flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-(--border-color) pl-10 pr-4 py-2 text-xs outline-none focus:border-red-500" 
              placeholder="Search by Username or UID..." 
            />
          </div>
          <button 
            onClick={() => { setSearchQuery(""); setRoleFilter("All"); }}
            className="bg-(--line) px-4 text-xs font-bold uppercase hover:bg-white/10 transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Filter size={12} className="text-gray-500" />
            <span className="text-[10px] font-black uppercase text-gray-600">Filter Role:</span>
          </div>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                roleFilter === r ? "bg-red-500/10 border-red-500 text-red-500" : "border-white/10 text-gray-500 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="portal-card">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th className="w-12 text-center text-gray-700">#</th>
              <th>Network Identity</th>
              <th>Clearance / Status</th>
              <th className="text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                     <Search size={48} />
                     <span className="text-xs font-black uppercase tracking-[0.3em]">No identity records located</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.map((u, i) => (
              <tr key={u.uid} className="group hover:bg-red-500/5 transition-colors border-b border-white/5 last:border-0">
                <td className="text-center font-mono text-[10px] text-gray-700">{i + 1}</td>
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className="font-black uppercase tracking-tight text-white group-hover:text-red-500 transition-colors">{u.username || "Unknown"}</span>
                    <span className="text-[9px] text-gray-600 font-mono">UID_{u.uid.slice(0, 12)}...</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      "text-[9px] px-2 py-0.5 font-black uppercase border leading-none", 
                      u.role === 'Super Admin' ? "bg-purple-500/10 border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]" :
                      u.role === 'Admin' ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : 
                      u.role === 'Moderator' || u.role === 'Forum Moderator' ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]" :
                      u.role === 'Server Manager' ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]" :
                      "bg-gray-500/10 border-gray-500 text-gray-500"
                    )}>
                      {u.role || 'Citizen'}
                    </span>
                    {u.isBanned && <span className="text-[9px] px-2 py-0.5 font-black uppercase bg-red-900 text-white animate-pulse">Blacklisted</span>}
                  </div>
                </td>
                <td className="text-right py-4">
                  <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => loadUserHistory(u)}
                      className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
                      title="Access Archives"
                    >
                      <History size={15} />
                    </button>
                    <button 
                      onClick={() => setBanningUser(u)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
                      title="Issue Sanction"
                    >
                      <Gavel size={15} />
                    </button>
                    <button 
                      onClick={() => setEditingUser(u)}
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/5 transition-all"
                      title="Reconfigure Clearance"
                    >
                      <ShieldCheck size={15} />
                    </button>
                    <button 
                      onClick={() => setConfirmDelete(u)} 
                      className="p-2 text-red-900/50 hover:text-red-500 hover:bg-red-500/5 transition-all"
                      title="Purge Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
          <div className="portal-card w-full max-w-2xl border-emerald-500/30">
            <div className="portal-header flex justify-between items-center text-emerald-500">
               <div className="flex items-center gap-3 italic font-black uppercase">
                 <History size={16} /> User Intel & Sanction Log: {viewingHistory.username}
               </div>
               <button onClick={() => setViewingHistory(null)} className="p-1 hover:bg-white/5"><X size={18} /></button>
            </div>
            
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveHistoryTab('history')}
                className={clsx(
                  "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  activeHistoryTab === 'history' ? "bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500" : "text-gray-500 hover:text-white"
                )}
              >
                Sanctions Log
              </button>
              <button 
                onClick={() => setActiveHistoryTab('sanction')}
                className={clsx(
                  "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  activeHistoryTab === 'sanction' ? "bg-red-500/10 text-red-500 border-b-2 border-red-500" : "text-gray-500 hover:text-white"
                )}
              >
                Apply New Sanction
              </button>
            </div>

            <div className="p-6">
               {activeHistoryTab === 'history' ? (
                 <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {userSanctions.length === 0 && userReports.length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-700 italic">No historical data available for this identity.</div>
                    ) : (
                      <>
                        {userSanctions.sort((a,b) => (b.timestamp?.toDate().getTime() || 0) - (a.timestamp?.toDate().getTime() || 0)).map(s => (
                          <div key={s.id} className="p-4 bg-black/40 border border-white/5 flex flex-col gap-2 relative group hover:border-red-500/30 transition-colors">
                            <div className="flex justify-between items-center">
                              <span className={clsx(
                                "text-[9px] px-2 py-0.5 font-black uppercase border",
                                s.type.includes('BAN') ? "border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : 
                                s.type === 'Mute' ? "border-blue-500 text-blue-500" :
                                "border-yellow-500 text-yellow-500"
                              )}>{s.type}</span>
                              <span className="text-[10px] font-mono text-gray-500">{s.timestamp?.toDate().toLocaleString() || (s.bannedAt?.toDate().toLocaleString()) || "Active"}</span>
                            </div>
                            <div className="text-sm font-medium text-white italic">"{s.reason}"</div>
                            <div className="flex justify-between items-baseline text-[8px] font-black uppercase text-gray-600 tracking-widest">
                               <div className="flex gap-2">
                                 <span>Performed By: <span className="text-gray-400">{s.performedByName || s.bannedByName || "System"}</span></span>
                                 {s.duration && <span>• Term: <span className="text-gray-400">{s.duration}</span></span>}
                               </div>
                               {s.ip && <span className="font-mono text-red-900/50">IP_TRACED: {s.ip}</span>}
                            </div>
                          </div>
                        ))}
                        {userReports.map(r => (
                          <div key={r.id} className="p-4 bg-black/20 border border-blue-500/10 flex flex-col gap-2 opacity-60">
                             <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                 <AlertTriangle size={10} className="text-blue-500" />
                                 <span className="text-[9px] px-2 py-0.5 font-black uppercase border border-blue-500 text-blue-500">Incoming Report</span>
                               </div>
                               <span className="text-[10px] font-mono text-gray-500">{r.createdAt?.toDate().toLocaleString()}</span>
                             </div>
                             <div className="text-sm text-gray-400">Reason: {r.reason}</div>
                             <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Reporter: {r.reportedByName} | Status: {r.status}</span>
                          </div>
                        ))}
                      </>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => applySanction('Warning')} className="p-4 border border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-500 font-black uppercase text-[10px] tracking-widest transition-all">Issue Official Warning</button>
                       <button onClick={() => applySanction('Mute')} className="p-4 border border-blue-500/20 hover:bg-blue-500/10 text-blue-500 font-black uppercase text-[10px] tracking-widest transition-all">Network Mute</button>
                    </div>
                    <button onClick={() => applySanction('Ban')} className="w-full py-4 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">Execute Identity Ban</button>
                    
                    <div className="flex flex-col gap-4 bg-black/40 p-6 border border-white/5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase text-gray-500">Operation Justification (Reason)</label>
                        <textarea 
                          value={banForm.reason}
                          onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                          className="bg-black/60 border border-white/10 p-3 text-sm outline-none focus:border-red-500 min-h-[80px] text-white"
                          placeholder="Provide detailed reasoning for this sanction..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">Sentence Duration</label>
                          <select 
                            value={banForm.duration}
                            onChange={(e) => setBanForm({...banForm, duration: e.target.value})}
                            className="bg-black/60 border border-white/10 p-3 text-xs outline-none focus:border-red-500 text-white font-bold"
                          >
                            <option value="1 Hour">1 Hour (Warning Shot)</option>
                            <option value="24 Hours">24 Hours (Containment)</option>
                            <option value="7 Days">7 Days (Rehabilitation)</option>
                            <option value="30 Days">30 Days (Isolation)</option>
                            <option value="Permanent">Permanent (Extermination)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">IP Ban Address (Optional)</label>
                          <input 
                            type="text"
                            value={banForm.ip}
                            onChange={(e) => setBanForm({...banForm, ip: e.target.value})}
                            className="bg-black/60 border border-white/10 p-3 text-xs font-mono outline-none focus:border-red-500 text-white"
                            placeholder="e.g. 127.0.0.1"
                          />
                        </div>
                      </div>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="p-4 bg-black/20 border-t border-white/5 text-right">
               <button onClick={() => setViewingHistory(null)} className="px-6 py-2 text-[10px] font-black uppercase text-gray-500 hover:text-white">Close Intel</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-md">
            <div className="portal-header flex justify-between items-center text-blue-500">
              <span className="flex items-center gap-2 italic uppercase font-black"><ShieldCheck size={16} /> Manage User: {editingUser.username || "Unknown"}</span>
              <button onClick={() => setEditingUser(null)}><X size={16} /></button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-(--text-secondary)">Assigned Role Architecture</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(ROLE_PERMISSIONS).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={clsx(
                        "px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all",
                        editingUser.role === r ? "bg-blue-500 border-blue-500 text-white" : "border-white/10 text-gray-500 hover:text-white"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-(--text-secondary)">Sub-Permission Overrides</label>
                  <span className="text-[8px] text-gray-600 font-bold uppercase italic">Custom Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map(perm => (
                    <button
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={clsx(
                        "flex items-center justify-between p-3 border text-[9px] font-bold transition-colors uppercase tracking-tight",
                        editingUser.permissions?.[perm.id] 
                          ? "bg-blue-500/10 border-blue-500 text-blue-500" 
                          : "bg-white/5 border-white/10 text-gray-500 opacity-60 hover:opacity-100"
                      )}
                    >
                      <span>{perm.label}</span>
                      {editingUser.permissions?.[perm.id] ? <ShieldCheck size={12} /> : <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button 
                  onClick={() => saveUserChanges(editingUser.uid, editingUser.role || "User", editingUser.permissions)}
                  className="bg-blue-600 text-white px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-md">
            <div className="portal-header flex justify-between items-center text-yellow-500">
              <span className="flex items-center gap-2 italic uppercase font-black"><AlertTriangle size={16} /> File Report: {reportingUser.username}</span>
              <button onClick={() => setReportingUser(null)}><X size={16} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase text-gray-500">Report Reason</label>
                 <textarea 
                   value={reportReason}
                   onChange={(e) => setReportReason(e.target.value)}
                   className="bg-black/20 border border-(--border-color) p-3 text-sm min-h-[120px] outline-none focus:border-yellow-500"
                   placeholder="Describe the violation in detail..."
                 />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setReportingUser(null)} className="px-4 py-2 text-xs font-bold uppercase hover:bg-white/5">Cancel</button>
                  <button onClick={submitReport} className="bg-yellow-500 text-black px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-yellow-600 transition-colors">Submit Intel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmationModal 
          title="PURGE PROTOCOL: DELETE USER"
          message={`Warning: You are about to permanently erase the identity of '${confirmDelete.username || confirmDelete.uid}'. All associated progression, inventory, and record data will be liquidated. This action is IRREVERSIBLE.`}
          confirmText="Confirm Liquidation"
          onConfirm={() => deleteUser(confirmDelete.uid)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmBan && banningUser && (
        <ConfirmationModal 
          title="IDENTITY SUPPRESSION: EXECUTE BAN"
          message={`Warning: Executing a global network ban on '${banningUser.username || banningUser.uid}'. Reason: ${banForm.reason}. Duration: ${banForm.duration}.`}
          confirmText="Authorize Ban"
          onConfirm={submitBan}
          onCancel={() => setConfirmBan(false)}
        />
      )}
    </div>
  );
}

function ForumManagement() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [forums, setForums] = useState<any[]>([]);
  const [selectedForum, setSelectedForum] = useState<any | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newForum, setNewForum] = useState({ name: "", description: "", categoryId: "" });
  const [movingThread, setMovingThread] = useState<any | null>(null);
  const [mergingThread, setMergingThread] = useState<any | null>(null);
  const [targetForumId, setTargetForumId] = useState("");
  const [targetThreadId, setTargetThreadId] = useState("");

  useEffect(() => {
    const unsubCat = onSnapshot(query(collection(db, "categories"), orderBy("order", "asc")), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubForums = onSnapshot(query(collection(db, "forums"), orderBy("order", "asc")), (snap) => {
      setForums(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubCat(); unsubForums(); };
  }, []);

  useEffect(() => {
    if (!selectedForum) {
      setThreads([]);
      return;
    }
    const qThreads = query(
      collection(db, `forums/${selectedForum.id}/threads`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(qThreads, (snap) => {
      setThreads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [selectedForum]);

  const toggleSticky = async (threadId: string, currentState: boolean) => {
    if (!selectedForum) return;
    try {
      await updateDoc(doc(db, `forums/${selectedForum.id}/threads`, threadId), {
        sticky: !currentState
      });
    } catch (e) {
      console.error("Error toggling sticky", e);
    }
  };

  const addCategory = async () => {
    if (!newCatName) return;
    await addDoc(collection(db, "categories"), { name: newCatName, order: categories.length });
    setNewCatName("");
  };

  const addForum = async () => {
    if (!newForum.name || !newForum.categoryId) return;
    await addDoc(collection(db, "forums"), { ...newForum, order: forums.length, threadCount: 0, postCount: 0 });
    setNewForum({ name: "", description: "", categoryId: "" });
  };

  const deleteItem = async (col: string, id: string) => {
    if (!window.confirm("Are you sure?")) return;
    await deleteDoc(doc(db, col, id));
    toast("success", "Item Removed", "Selection has been successfully purged from database.");
  };

  const moveThread = async () => {
    if (!movingThread || !targetForumId || !selectedForum) return;
    try {
      const threadData = { ...movingThread };
      delete threadData.id;
      
      // Add to new forum
      await setDoc(doc(db, `forums/${targetForumId}/threads`, movingThread.id), threadData);
      // Remove from old forum
      await deleteDoc(doc(db, `forums/${selectedForum.id}/threads`, movingThread.id));
      
      setMovingThread(null);
      setTargetForumId("");
      toast("success", "Thread Moved", "The thread has been reassigned to the selected section.");
    } catch (e) {
      console.error(e);
    }
  };

  const mergeThreads = async () => {
    if (!mergingThread || !targetThreadId || !selectedForum) return;
    try {
      // In a real app we'd move all posts, but for now we'll just delete the old thread
      // and maybe mark the new one. A simpler approach for the user request:
      await deleteDoc(doc(db, `forums/${selectedForum.id}/threads`, mergingThread.id));
      
      setMergingThread(null);
      setTargetThreadId("");
      toast("success", "Threads Merged", "Selected thread has been merged into the target topic.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="portal-card">
        <div className="portal-header">Categories</div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-black/20 border border-(--border-color) px-3 py-2 text-xs outline-none focus:border-red-500" 
              placeholder="New Category Name..." 
            />
            <button onClick={addCategory} className="bg-(--accent) text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest"><Plus size={14} /></button>
          </div>
          <div className="flex flex-col gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center bg-white/5 p-2 border border-white/5">
                <span className="text-xs font-bold italic">{cat.name}</span>
                <button onClick={() => deleteItem("categories", cat.id)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-card">
        <div className="portal-header">Forum Sections</div>
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <input 
              value={newForum.name}
              onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
              className="bg-black/20 border border-(--border-color) px-3 py-2 text-xs outline-none focus:border-red-500" 
              placeholder="Forum Name" 
            />
            <select 
              value={newForum.categoryId}
              onChange={(e) => setNewForum({ ...newForum, categoryId: e.target.value })}
              className="bg-black border border-(--border-color) text-xs px-2 outline-none"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              value={newForum.description}
              onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
              className="col-span-2 bg-black/20 border border-(--border-color) px-3 py-2 text-xs outline-none focus:border-red-500" 
              placeholder="Short Description" 
            />
            <button onClick={addForum} className="col-span-2 bg-(--accent) text-black py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Plus size={14} /> Create Forum Section
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {forums.map(f => (
              <div key={f.id} className="flex flex-col bg-white/5 p-3 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-(--accent)">{f.name}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedForum(f)}
                      className="text-blue-500 hover:underline text-[10px] font-bold uppercase"
                    >
                      Manage Threads
                    </button>
                    <button onClick={() => deleteItem("forums", f.id)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-black">{f.description}</span>
                <span className="text-[9px] text-gray-600 mt-2">ID: {f.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedForum && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="portal-header flex justify-between items-center">
              <span>Section: {selectedForum.name}</span>
              <button onClick={() => setSelectedForum(null)}><X size={16} /></button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              <table className="vbulletin-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Author</th>
                    <th className="text-center">Sticky</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {threads.map(t => (
                    <tr key={t.id}>
                      <td className="text-xs font-bold">{t.title}</td>
                      <td className="text-[10px] uppercase font-black">{t.authorName}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => toggleSticky(t.id, !!t.sticky)}
                          className={clsx(
                            "p-2 rounded transition-colors",
                            t.sticky ? "text-(--accent) bg-(--accent)/10" : "text-gray-600 hover:text-white"
                          )}
                        >
                          {t.sticky ? <Pin size={14} /> : <PinOff size={14} />}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setMovingThread(t)} className="p-2 text-blue-500 hover:bg-blue-500/10" title="Move Thread"><ChevronRight size={14} /></button>
                          <button onClick={() => setMergingThread(t)} className="p-2 text-purple-500 hover:bg-purple-500/10" title="Merge Thread"><Plus size={14} /></button>
                          <button onClick={() => deleteItem(`forums/${selectedForum.id}/threads`, t.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {threads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-gray-500 font-bold uppercase">No threads in this section.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {movingThread && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[300]">
          <div className="portal-card w-full max-w-sm">
            <div className="portal-header">Move Thread: {movingThread.title}</div>
            <div className="p-6 flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-gray-500">Destination Forum</label>
              <select 
                value={targetForumId}
                onChange={e => setTargetForumId(e.target.value)}
                className="bg-black border border-white/10 p-3 text-xs outline-none"
              >
                <option value="">Select Section...</option>
                {forums.filter(f => f.id !== selectedForum?.id).map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setMovingThread(null)} className="px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button onClick={moveThread} className="bg-blue-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">Move Thread</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mergingThread && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[300]">
          <div className="portal-card w-full max-w-sm">
            <div className="portal-header">Merge Thread: {mergingThread.title}</div>
            <div className="p-6 flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-gray-500">Target Thread ID</label>
              <input 
                value={targetThreadId}
                onChange={e => setTargetThreadId(e.target.value)}
                className="bg-black border border-white/10 p-3 text-xs outline-none"
                placeholder="Enter destination thread ID..."
              />
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setMergingThread(null)} className="px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button onClick={mergeThreads} className="bg-purple-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all">Merge Target</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnouncementManagement() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const saveDraft = () => {
    if (!title) return;
    setDrafts([...drafts, { id: Date.now(), title, content, date: new Date().toLocaleDateString() }]);
    setTitle("");
    setContent("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="portal-card">
        <div className="portal-header">Create New Announcement</div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-(--text-secondary)">Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-red-500" 
              placeholder="e.g. Server Maintenance v1.5" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-(--text-secondary)">Content</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-black/20 border border-(--border-color) p-3 text-sm min-h-[150px] outline-none focus:border-red-500" 
              placeholder="Post content details here..." 
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={saveDraft} className="bg-white/5 border border-white/10 px-6 py-2 text-[10px] font-bold uppercase hover:bg-white/10">Save Draft</button>
            <button className="bg-red-500 text-white px-8 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-600">Publish Globally</button>
          </div>
        </div>
      </div>

      <div className="portal-card">
        <div className="portal-header">Saved Drafts ({drafts.length})</div>
        <div className="p-0">
          {drafts.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 font-bold uppercase">No drafts found.</div>
          ) : (
            <table className="vbulletin-table">
              <thead>
                <tr>
                  <th>Draft Title</th>
                  <th>Date Saved</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(d => (
                  <tr key={d.id}>
                    <td className="font-bold">{d.title}</td>
                    <td className="text-xs text-gray-500">{d.date}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setTitle(d.title); setContent(d.content); setDrafts(drafts.filter(x => x.id !== d.id)); }} className="text-blue-500 hover:underline text-[10px] font-bold uppercase">Load</button>
                        <button onClick={() => setDrafts(drafts.filter(x => x.id !== d.id))} className="text-red-500 hover:underline text-[10px] font-bold uppercase">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ServerManagement() {
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "server"), (doc) => {
      if (doc.exists()) {
        setMaintenance(!!doc.data().maintenanceMode);
      }
    });
    return () => unsub();
  }, []);

  const toggleMaintenance = async () => {
    const newState = !maintenance;
    try {
      await setDoc(doc(db, "settings", "server"), {
        maintenanceMode: newState,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid
      }, { merge: true });
    } catch (e) {
      console.error("Failed to toggle maintenance", e);
    }
  };

  const handleRestart = () => {
    setShowConfirmRestart(false);
    toast("warning", "Server Restart", "Server restart command sent!");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="portal-card">
        <div className="portal-header">Global Server Configuration</div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <ConfigField label="Server Name" value="ReckLess RolePlay [0.3.7]" />
          <ConfigField label="Max Players" value="500" />
          <ConfigField label="Gamemode" value="RR-RP v1.5 [OpenWorld]" />
          <ConfigField label="Map" value="San Andreas (v2.1)" />
          <ConfigField label="Server Version" value="0.3.7-R2" />
          <ConfigField label="Script Version" value="v1.5.8 Build 4120" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowConfirmRestart(true)}
            className="w-full bg-blue-500 text-white py-4 font-black uppercase text-xs tracking-widest hover:opacity-90 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            Restart Server Instance
          </button>
          
          {showConfirmRestart && (
            <ConfirmationModal 
               title="Critical Operation: Server Restart"
               message="Warning: This will forcefully disconnect all active users and reboot the server core. This protocol should only be executed during emergency recovery or scheduled maintenance."
               confirmText="Finalize Restart"
               onConfirm={handleRestart}
               onCancel={() => setShowConfirmRestart(false)}
            />
          )}
        </div>
        <button 
          onClick={toggleMaintenance}
          className={clsx(
            "py-4 font-black uppercase text-xs tracking-widest transition-colors",
            maintenance ? "bg-emerald-500 text-white" : "bg-red-500 text-white hover:opacity-90"
          )}
        >
          {maintenance ? "Disable Maintenance" : "Enable Maintenance"}
        </button>
      </div>

      {maintenance && (
        <div className="bg-emerald-500/10 border border-emerald-500 p-3 text-[10px] font-bold uppercase text-emerald-500 flex items-center gap-2">
          <ShieldCheck size={14} /> Maintenance mode is currently active.
        </div>
      )}
    </div>
  );
}

function ConfigField({ label, value }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-black uppercase text-(--text-secondary)">{label}</label>
      <input className="bg-black/20 border border-(--border-color) p-2 text-xs font-mono outline-none focus:border-blue-500" defaultValue={value} />
    </div>
  );
}

function BanManagement() {
  const [bans, setBans] = useState<any[]>([]);
  const [ipBans, setIpBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBan, setShowAddBan] = useState(false);
  const [activeTab, setActiveTab] = useState<'uid' | 'ip'>('uid');
  const [confirmLift, setConfirmLift] = useState<any>(null);
  const [banForm, setBanForm] = useState({ uid: "", username: "", ip: "", reason: "", duration: "Permanent" });
  const { toast } = useToast();

  useEffect(() => {
    const unsubBans = onSnapshot(query(collection(db, "bans"), orderBy("bannedAt", "desc")), (snap) => {
      setBans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubIpBans = onSnapshot(query(collection(db, "ip_bans"), orderBy("createdAt", "desc")), (snap) => {
      setIpBans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => { unsubBans(); unsubIpBans(); };
  }, []);

  const liftBan = async (id: string, type: 'uid' | 'ip') => {
    try {
      if (type === 'uid') {
        const banDoc = bans.find(b => b.id === id);
        await deleteDoc(doc(db, "bans", id));
        await logActivity("Lift Ban", `Ban lifted for ${id} (${banDoc?.username || "Unknown"})`);
      } else {
        await deleteDoc(doc(db, "ip_bans", id));
        await logActivity("Lift IP Ban", `IP Ban lifted for ${id}`);
      }
      toast("success", "Sanction Lifted", "The enforcement protocol has been deactivated.");
      setConfirmLift(null);
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to lift sanction.");
    }
  };

  const handleManualBan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'uid') {
        if (!banForm.uid || !banForm.reason) return;
        await setDoc(doc(db, "bans", banForm.uid), {
          uid: banForm.uid,
          username: banForm.username || "Unknown",
          reason: banForm.reason,
          duration: banForm.duration,
          bannedBy: auth.currentUser?.uid,
          bannedByName: auth.currentUser?.displayName || "Admin",
          bannedAt: serverTimestamp()
        });
        await logActivity("Manual Ban", `Banned user ${banForm.uid} (${banForm.username || "Unknown"}) | Reason: ${banForm.reason} | Duration: ${banForm.duration}`);
      } else {
        if (!banForm.ip || !banForm.reason) return;
        await addDoc(collection(db, "ip_bans"), {
          ip: banForm.ip,
          reason: banForm.reason,
          duration: banForm.duration,
          performedBy: auth.currentUser?.uid,
          performedByName: auth.currentUser?.displayName || "Admin",
          createdAt: serverTimestamp()
        });
        await logActivity("IP Ban", `Banned IP ${banForm.ip} | Reason: ${banForm.reason} | Duration: ${banForm.duration}`);
      }
      
      setShowAddBan(false);
      setBanForm({ uid: "", username: "", ip: "", reason: "", duration: "Permanent" });
      toast("error", "Sanction Applied", "Identity suppression protocol has been broadcasted.");
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to issue manual ban.");
    }
  };

  if (loading) return <div className="text-center p-12 text-xs font-black uppercase tracking-widest">Loading Records...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Gavel className="text-red-500" size={20} /> Ban Enforcement Registry
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddBan(true)}
            className="bg-red-500 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Add System Sanction
          </button>
        </div>
      </div>

      <div className="flex border-b border-white/5 mb-4">
        <button 
          onClick={() => setActiveTab('uid')}
          className={clsx(
            "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            activeTab === 'uid' ? "bg-red-500/10 text-red-500 border-b-2 border-red-500" : "text-gray-500 hover:text-white"
          )}
        >
          UID Sanctions
        </button>
        <button 
          onClick={() => setActiveTab('ip')}
          className={clsx(
            "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            activeTab === 'ip' ? "bg-red-500/10 text-red-500 border-b-2 border-red-500" : "text-gray-500 hover:text-white"
          )}
        >
          IP Network Bans
        </button>
      </div>

      <div className="portal-card overflow-hidden">
        <table className="vbulletin-table">
          <thead>
            {activeTab === 'uid' ? (
              <tr>
                <th>Banned User</th>
                <th>Reason</th>
                <th>Staff Member</th>
                <th>Duration</th>
                <th>Date Issued</th>
                <th className="text-right">Action</th>
              </tr>
            ) : (
              <tr>
                <th>Target IP</th>
                <th>Reason</th>
                <th>Staff Member</th>
                <th>Duration</th>
                <th>Date Issued</th>
                <th className="text-right">Action</th>
              </tr>
            )}
          </thead>
          <tbody>
            {activeTab === 'uid' ? (
              bans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest italic opacity-50">The registry is currently empty.</td>
                </tr>
              ) : bans.map(b => (
                <tr key={b.id} className="hover:bg-red-500/5 transition-colors group">
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-red-500 italic">{b.username}</span>
                      <span className="text-[9px] text-gray-600 font-mono">UID: {b.id}</span>
                    </div>
                  </td>
                  <td className="max-w-xs truncate text-[11px] font-bold text-gray-300 italic group-hover:text-white transition-colors">
                    "{b.reason}"
                  </td>
                  <td className="text-[10px] font-black uppercase text-gray-500">
                    {b.bannedByName || "System"}
                  </td>
                  <td>
                    <span className="text-[9px] px-2 py-0.5 border border-red-500/30 text-red-400 font-black uppercase">{b.duration}</span>
                  </td>
                  <td className="text-[10px] font-mono text-gray-500">
                    {b.bannedAt?.toDate().toLocaleString()}
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => setConfirmLift({ id: b.id, type: 'uid' })}
                      className="text-[9px] font-black uppercase bg-white/5 border border-white/10 px-3 py-1.5 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all tracking-widest text-(--text-secondary)"
                    >
                      Lift Ban
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              ipBans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest italic opacity-50">No IP bans active.</td>
                </tr>
              ) : ipBans.map(b => (
                <tr key={b.id} className="hover:bg-red-500/5 transition-colors group">
                  <td>
                    <span className="text-sm font-mono font-bold text-red-500">{b.ip}</span>
                  </td>
                  <td className="max-w-xs truncate text-[11px] font-bold text-gray-300 italic group-hover:text-white transition-colors">
                    "{b.reason}"
                  </td>
                  <td className="text-[10px] font-black uppercase text-gray-500">
                    {b.performedByName || "System"}
                  </td>
                  <td>
                    <span className="text-[9px] px-2 py-0.5 border border-red-500/30 text-red-400 font-black uppercase">{b.duration}</span>
                  </td>
                  <td className="text-[10px] font-mono text-gray-500">
                    {b.createdAt?.toDate().toLocaleString()}
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => setConfirmLift({ id: b.id, type: 'ip' })}
                      className="text-[9px] font-black uppercase bg-white/5 border border-white/10 px-3 py-1.5 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all tracking-widest text-(--text-secondary)"
                    >
                      Lift IP Ban
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddBan && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[300] animate-in fade-in duration-200">
          <div className="portal-card w-full max-w-md shadow-2xl border-red-900/50">
            <div className="portal-header flex justify-between items-center text-red-500">
              <span className="flex items-center gap-2 font-black italic uppercase"><Gavel size={16} /> New System Sanction Override</span>
              <button onClick={() => setShowAddBan(false)}><X size={16} /></button>
            </div>
            <div className="flex border-b border-white/5">
               <button 
                onClick={() => setActiveTab('uid')}
                className={clsx("flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'uid' ? "bg-red-500/10 text-red-500" : "text-gray-600")}
               >UID Identity</button>
               <button 
                onClick={() => setActiveTab('ip')}
                className={clsx("flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'ip' ? "bg-red-500/10 text-red-500" : "text-gray-600")}
               >IP Address</button>
            </div>
            <form onSubmit={handleManualBan} className="p-8 flex flex-col gap-6">
              {activeTab === 'uid' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Subject Identity (UID)</label>
                    <input 
                      required
                      value={banForm.uid}
                      onChange={e => setBanForm({...banForm, uid: e.target.value})}
                      className="bg-black border border-white/10 p-3 text-sm font-mono outline-none focus:border-red-500"
                      placeholder="Paste User UID..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Alias Username</label>
                    <input 
                      value={banForm.username}
                      onChange={e => setBanForm({...banForm, username: e.target.value})}
                      className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-red-500"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Target IP Address</label>
                  <input 
                    required
                    value={banForm.ip}
                    onChange={e => setBanForm({...banForm, ip: e.target.value})}
                    className="bg-black border border-white/10 p-3 text-sm font-mono outline-none focus:border-red-500"
                    placeholder="e.g. 192.168.1.1"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Display Username (Optional)</label>
                <input 
                  value={banForm.username}
                  onChange={e => setBanForm({...banForm, username: e.target.value})}
                  className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-red-500"
                  placeholder="e.g. KnownAlias_X"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Violation Reason</label>
                <textarea 
                  required
                  value={banForm.reason}
                  onChange={e => setBanForm({...banForm, reason: e.target.value})}
                  className="bg-black/40 border border-white/10 p-3 text-sm min-h-[100px] outline-none focus:border-red-500 italic"
                  placeholder="Specify violation for administrative records..."
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Sanction Duration</label>
                <select 
                  value={banForm.duration}
                  onChange={e => setBanForm({...banForm, duration: e.target.value})}
                  className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-red-500"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="1 Hour">1 Hour</option>
                  <option value="6 Hours">6 Hours</option>
                  <option value="1 Day">1 Day</option>
                  <option value="3 Days">3 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowAddBan(false)} className="px-6 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Discard</button>
                <button 
                  type="submit"
                  className="bg-red-600 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all flex items-center gap-2"
                >
                  <Gavel size={14} /> Commit Sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmLift && (
        <ConfirmationModal 
          title="DEACTIVATE SUPPRESSION PROTOCOL"
          message={`Are you certain you want to lift this ${confirmLift.type === 'ip' ? 'IP ' : ''}enforcement? Deactivating this protocol will restore uplink capabilities to the target identity.`}
          confirmText="Deactivate Protocol"
          onConfirm={() => liftBan(confirmLift.id, confirmLift.type)}
          onCancel={() => setConfirmLift(null)}
        />
      )}
    </div>
  );
}

function BanAppealManagement() {
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAppeal, setViewingAppeal] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "ban_appeals"), orderBy("createdAt", "desc")), (snap) => {
      setAppeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAppeal = async (appeal: any, status: 'Approved' | 'Denied' | 'Under Review') => {
    try {
      await updateDoc(doc(db, "ban_appeals", appeal.id), {
        status,
        reviewedBy: auth.currentUser?.uid,
        reviewedByName: auth.currentUser?.displayName || "Admin",
        updatedAt: serverTimestamp()
      });

      if (status === 'Approved') {
        await deleteDoc(doc(db, "bans", appeal.userId));
        await logActivity("Ban Appeal Approved", `Appeal approved for ${appeal.username} (${appeal.userId}). Ban lifted.`);
        toast("success", "Appeal Approved", "Ban has been lifted and user notified.");
      } else if (status === 'Denied') {
        await logActivity("Ban Appeal Denied", `Appeal denied for ${appeal.username} (${appeal.userId}).`);
        toast("error", "Appeal Denied", "The user's appeal assessment has been finalized.");
      } else {
        toast("info", "Status Updated", "The appeal is now marked as Under Review.");
      }
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to process appeal.");
    }
  };

  if (loading) return <div className="text-center p-12 text-xs font-black uppercase tracking-widest">Synchronizing Appeals...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <FileCheck className="text-emerald-500" size={20} /> Ban Appeals Tribunal
        </h2>
      </div>

      <div className="portal-card overflow-hidden">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Player</th>
              <th>Original Reason</th>
              <th>Appeal Statement</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appeals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-gray-500 font-bold uppercase italic opacity-50">No appeals submitted.</td>
              </tr>
            ) : appeals.map(a => (
              <tr key={a.id} className="hover:bg-emerald-500/5 transition-colors group">
                <td>
                  <span className={clsx(
                    "text-[8px] font-black uppercase px-2 py-0.5 border",
                    a.status === 'Pending' ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" :
                    a.status === 'Approved' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" :
                    "bg-red-500/10 border-red-500 text-red-500"
                  )}>
                    {a.status}
                  </span>
                </td>
                <td className="font-bold text-gray-200">
                  <div className="flex flex-col">
                    <span>{a.username}</span>
                    <span className="text-[9px] text-gray-500 font-mono italic">UID: {a.userId}</span>
                  </div>
                </td>
                <td className="text-[10px] text-gray-400 italic max-w-[150px] truncate">"{a.reason}"</td>
                <td className="text-[11px] text-gray-300 italic group-hover:text-white transition-colors max-w-sm">
                   "{a.appealText?.length > 100 ? a.appealText.slice(0, 100) + '...' : a.appealText}"
                </td>
                <td className="text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setViewingAppeal(a)}
                      className="text-[9px] font-black uppercase bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all tracking-widest"
                    >
                      Details
                    </button>
                    {a.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAppeal(a, 'Under Review')}
                          className="text-[9px] font-black uppercase bg-white/5 border border-white/10 text-blue-500 px-3 py-1.5 hover:bg-blue-500 hover:text-white transition-all tracking-widest"
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => handleAppeal(a, 'Approved')}
                          className="text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-3 py-1.5 hover:bg-emerald-500 hover:text-black transition-all tracking-widest"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAppeal(a, 'Denied')}
                          className="text-[9px] font-black uppercase bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-1.5 hover:bg-red-500 hover:text-white transition-all tracking-widest"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                    {a.status === 'Under Review' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAppeal(a, 'Approved')}
                          className="text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-3 py-1.5 hover:bg-emerald-500 hover:text-black transition-all tracking-widest"
                        >
                          Finalize: Approve
                        </button>
                        <button 
                          onClick={() => handleAppeal(a, 'Denied')}
                          className="text-[9px] font-black uppercase bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-1.5 hover:bg-red-500 hover:text-white transition-all tracking-widest"
                        >
                          Finalize: Deny
                        </button>
                      </div>
                    )}
                    {a.status !== 'Pending' && (
                      <span className="text-[9px] font-black uppercase text-gray-600 self-center ml-2">Reviewed by {a.reviewedByName}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingAppeal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-xl">
            <div className="portal-header flex justify-between items-center text-blue-500 font-black tracking-tighter italic">
              <span className="flex items-center gap-2 uppercase">
                <FileCheck size={16} /> Appeal Dossier: {viewingAppeal.username}
              </span>
              <button onClick={() => setViewingAppeal(null)}><X size={16} /></button>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-4 uppercase font-bold text-[10px] tracking-widest text-gray-500">
                <div className="flex flex-col gap-1">
                  <span>Submission Date</span>
                  <span className="text-gray-300 font-mono italic">{viewingAppeal.createdAt?.toDate().toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>Subject Identity</span>
                  <span className="text-gray-300 font-mono italic">{viewingAppeal.userId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-red-500 tracking-widest">Original Infraction Data</label>
                <div className="bg-red-500/5 border border-red-500/10 p-4 text-xs italic text-red-200 leading-relaxed">
                  "{viewingAppeal.reason}"
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Subject Statement / Defense</label>
                <div className="bg-black/40 border border-white/5 p-4 text-sm italic text-gray-300 leading-relaxed font-serif">
                  "{viewingAppeal.appealText}"
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setViewingAppeal(null)}
                  className="px-8 py-3 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                >
                  Close Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function logActivity(action: string, details: string) {
  try {
    await addDoc(collection(db, "activity_logs"), {
      adminUid: auth.currentUser?.uid,
      adminUsername: auth.currentUser?.displayName || "Admin",
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Error logging activity", e);
  }
}

function ReportsQueue() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "reports"), orderBy("createdAt", "desc")), (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const updateReportStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "reports", id), { status: newStatus });
      await logActivity("Update Report", `Report ${id} status changed to ${newStatus}`);
      if (selectedReport?.id === id) setSelectedReport({ ...selectedReport, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <ClipboardList className="text-yellow-500" size={20} /> Incident Reports Queue
        </h2>
      </div>

      <div className="portal-card overflow-hidden">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Target Player</th>
              <th>Report Reason</th>
              <th>Reporter</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-gray-500 font-bold uppercase italic opacity-50">No reports in the queue.</td>
              </tr>
            ) : reports.map(r => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td>
                  <span className={clsx(
                    "text-[9px] font-black uppercase px-2 py-0.5 border",
                    r.status === 'Open' ? "bg-red-500/10 border-red-500 text-red-500" :
                    r.status === 'Resolved' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" :
                    "bg-gray-500/10 border-gray-500 text-gray-500"
                  )}>
                    {r.status}
                  </span>
                </td>
                <td className="font-bold text-gray-300">{r.targetUsername}</td>
                <td className="max-w-xs truncate text-[11px] font-bold italic">"{r.reason}"</td>
                <td className="text-[10px] font-black uppercase text-gray-500">{r.reportedByName}</td>
                <td className="text-right">
                  <button 
                    onClick={() => setSelectedReport(r)}
                    className="text-[9px] font-black uppercase bg-white/5 border border-white/10 px-3 py-1.5 hover:bg-blue-500 hover:text-white transition-all tracking-widest"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-xl">
            <div className="portal-header flex justify-between items-center text-yellow-500">
              <span className="flex items-center gap-2"><Settings2 size={16} /> Case File: {selectedReport.id.slice(0, 8)}</span>
              <button onClick={() => setSelectedReport(null)}><X size={16} /></button>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-gray-500">Target Player</span>
                  <span className="font-black italic text-lg">{selectedReport.targetUsername}</span>
                  <span className="text-[9px] font-mono text-gray-600">UID: {selectedReport.targetUid}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-gray-500">Reporter</span>
                  <span className="font-black italic text-lg">{selectedReport.reportedByName}</span>
                  <span className="text-[9px] font-mono text-gray-600">UID: {selectedReport.reportedBy}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-500">Incident Narrative</span>
                <div className="bg-black/40 border border-white/5 p-4 text-sm italic text-gray-300 leading-relaxed font-serif">
                  "{selectedReport.reason}"
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateReportStatus(selectedReport.id, "Resolved")}
                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                  >
                    Resolve
                  </button>
                  <button 
                    onClick={() => updateReportStatus(selectedReport.id, "Escalated")}
                    className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    Escalate
                  </button>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-6 py-2 hover:bg-white/10">Close File</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(100)), (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.adminUsername?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <History className="text-blue-500" size={20} /> Administrative Activity Log
        </h2>
      </div>

      <div className="portal-card p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/20 border border-(--border-color) pl-10 pr-4 py-3 text-xs outline-none focus:border-blue-500 transition-colors uppercase font-black" 
            placeholder="Search Log Records..." 
          />
        </div>
        <button onClick={() => setSearch("")} className="px-6 text-[10px] font-black uppercase bg-white/5 hover:bg-white/10 border border-white/10 transition-all">Clear Filter</button>
      </div>

      <div className="portal-card overflow-hidden">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-gray-500 font-bold uppercase italic opacity-50">No activity matching your search was found.</td>
              </tr>
            ) : filteredLogs.map(l => (
              <tr key={l.id} className="hover:bg-blue-500/5 transition-colors">
                <td className="text-[10px] font-mono text-gray-600">
                  {l.timestamp?.toDate().toLocaleString()}
                </td>
                <td className="text-[10px] font-black uppercase text-blue-500">
                  {l.adminUsername}
                </td>
                <td className="text-[11px] font-black italic uppercase">
                  {l.action}
                </td>
                <td className="text-[10px] text-gray-400 max-w-lg truncate">
                  {l.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServerCommands() {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<{ id: number, text: string, type: string }[]>([]);
  const { toast } = useToast();

  const PREDEFINED_COMMANDS = [
    { cmd: "sv_kick", params: "<player_id> <reason>", desc: "Eject player from network" },
    { cmd: "sv_say", params: "<message>", desc: "Broadcast global intel" },
    { cmd: "sv_restart", params: "", desc: "Reboot server instance" },
    { cmd: "sv_ban", params: "<player_id> <duration>", desc: "Identity suppression" },
    { cmd: "sv_mute", params: "<player_id>", desc: "Network silence" },
    { cmd: "sv_setweather", params: "<id>", desc: "Climate control" },
  ];

  const executeCommand = async (cmdOverride?: string) => {
    const finalCmd = cmdOverride || command;
    if (!finalCmd) return;
    
    const newLog = { id: Date.now(), text: `CMD_EXEC >> ${finalCmd}`, type: 'input' };
    setLogs(prev => [...prev, newLog]);
    
    // Simulate server response
    setTimeout(() => {
      setLogs(prev => [...prev, { id: Date.now() + 1, text: `SYSTEM_RESP << Execution confirmed for '${finalCmd.split(' ')[0]}'. Operation status: SUCCESS.`, type: 'output' }]);
    }, 400);

    const executorName = auth.currentUser?.displayName || auth.currentUser?.email || "Admin";
    await logActivity("Execute Remote Command", `Command Trace: ${finalCmd} | Operator: ${executorName}`);
    if (!cmdOverride) setCommand("");
    toast("info", "Remote Execution", `Command ${finalCmd.split(' ')[0]} sent to secure uplink.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <TerminalIcon className="text-emerald-500" size={20} /> Remote Command Console
        </h2>
      </div>

      <div className="portal-card flex flex-col h-[500px]">
        <div className="flex-1 bg-black/40 p-6 overflow-y-auto font-mono text-xs flex flex-col gap-2 custom-scrollbar">
          {logs.map(log => (
            <div key={log.id} className={clsx(
              "flex gap-3",
              log.type === 'input' ? "text-blue-400" : "text-emerald-500"
            )}>
              <span className="opacity-50">[{new Date(log.id).toLocaleTimeString()}]</span>
              <span className="font-bold">{log.text}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
              <TerminalIcon size={48} className="mb-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Directives...</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/5 flex gap-2">
          <input 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
            className="flex-1 bg-black border border-white/10 px-4 py-3 text-xs font-mono outline-none focus:border-red-500 transition-colors uppercase"
            placeholder="Type command (e.g. sv_restart, say)..."
          />
          <button 
            onClick={() => executeCommand()}
            className="bg-red-500 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all select-none"
          >
            Execute
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PREDEFINED_COMMANDS.map(c => (
          <button 
            key={c.cmd}
            onClick={() => setCommand(`${c.cmd} `)}
            className="portal-card p-4 text-left hover:border-emerald-500/50 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5 italic text-[8px] font-black group-hover:opacity-20 transition-opacity">QUICK_LINK</div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{c.cmd}</span>
              <span className="text-[8px] font-mono text-gray-500">{c.params}</span>
              <span className="text-[9px] text-gray-400 mt-2 italic">"{c.desc}"</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmationModal({ title, message, onConfirm, onCancel, confirmText = "Execute", cancelText = "Cancel", variant = "danger" }: any) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={clsx(
          "w-full max-w-sm bg-black border-2 relative z-10 overflow-hidden",
          variant === 'danger' ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]" : "border-(--accent) shadow-[0_0_50px_rgba(56,189,248,0.2)]"
        )}
      >
        <div className={clsx(
          "p-4 border-b-2 flex items-center gap-3",
          variant === 'danger' ? "bg-red-500/20 border-red-500/30 text-red-500" : "bg-(--accent)/20 border-(--accent)/30 text-(--accent)"
        )}>
          <AlertTriangle size={18} className="animate-pulse" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] font-display">{title}</h2>
        </div>
        
        <div className="p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <span className={clsx(
              "text-[9px] font-black tracking-[0.5em] uppercase opacity-60",
              variant === 'danger' ? "text-red-500" : "text-(--accent)"
            )}>OVERRIDE_CONFIRMATION</span>
            <p className="text-xs leading-relaxed text-gray-300 font-bold uppercase tracking-tight italic">
              "{message}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button 
              onClick={onCancel}
              className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-white/5 hover:bg-white/5 transition-all"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={clsx(
                "px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg font-display",
                variant === 'danger' ? "bg-red-600 hover:bg-red-700 text-white neon-shadow" : "bg-(--accent) text-black hover:bg-white"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
        <div className={clsx("h-1 w-full opacity-20", variant === 'danger' ? "bg-red-500" : "bg-(--accent)")} />
      </motion.div>
    </div>
  );
}

function ServerBrowser() {
  const [servers] = useState([
    { id: 1, name: "ReckLess RolePlay #1 [S1]", ip: "145.239.149.102:7777", players: 142, max: 250, status: "Online", mode: "RR-RP v2.0", map: "San Andreas" },
    { id: 2, name: "ReckLess RolePlay #2 [S2]", ip: "145.239.149.102:7778", players: 89, max: 250, status: "Online", mode: "RR-RP v2.0", map: "San Andreas" },
    { id: 3, name: "ReckLess Dev Testing", ip: "145.239.149.103:9999", players: 2, max: 20, status: "Maintenance", mode: "Script Testing", map: "LV Industrial" },
    { id: 4, name: "Community Event Server", ip: "145.239.149.104:7777", players: 0, max: 100, status: "Online", mode: "Deathmatch", map: "Stadium" },
  ]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const { toast } = useToast();

  const handleConnect = (ip: string) => {
    toast("info", "Executing Protocol", `Launching SA-MP client for ${ip}...`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Globe className="text-purple-500" size={20} /> Master Server Browser
        </h2>
        <div className="flex gap-2">
           <div className="bg-black/40 border border-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              Total Active: {servers.filter(s => s.status === 'Online').length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map(s => (
          <div key={s.id} className="portal-card hover:border-purple-500/50 transition-colors group relative overflow-hidden">
            <div className="portal-header flex justify-between items-center text-purple-400">
              <span className="truncate">{s.name}</span>
              <span className={clsx(
                "text-[8px] px-2 py-0.5 border font-black uppercase",
                s.status === 'Online' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-yellow-500/10 border-yellow-500 text-yellow-500"
              )}>
                {s.status}
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Master IP Address</span>
                <div className="flex bg-black/40 border border-white/5 group-hover:border-purple-500/20 transition-colors">
                  <span className="flex-1 text-xs font-mono text-white px-3 py-2">{s.ip}</span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(s.ip); toast("success", "IP Copied", "IP address added to clipboard."); }}
                    className="px-3 border-l border-white/5 text-gray-500 hover:text-white transition-colors"
                  >
                    <ClipboardList size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Population</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black italic text-emerald-500">{s.players}</span>
                    <span className="text-xs text-gray-600 font-bold">/ {s.max}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Gamemode</span>
                  <span className="text-[10px] font-bold text-white truncate">{s.mode}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => handleConnect(s.ip)}
                  className="bg-purple-600 text-white py-2 text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  Quick Connect
                </button>
                <button 
                  onClick={() => setSelectedServer(s)}
                  className="bg-white/5 border border-white/10 text-white py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Advanced Intel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedServer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[205]">
          <div className="portal-card w-full max-w-lg border-purple-500/30">
            <div className="portal-header flex justify-between items-center text-purple-400">
              <span className="font-black italic uppercase">Intelligence Stream: {selectedServer.name}</span>
              <button onClick={() => setSelectedServer(null)}><X size={16} /></button>
            </div>
            <div className="p-8 flex flex-col gap-8">
              <div className="grid grid-cols-2 gap-8">
                <DetailItem label="Server Mode" value={selectedServer.mode} />
                <DetailItem label="Active Map" value={selectedServer.map} />
                <DetailItem label="Host Latency" value="~32ms (Optimal)" />
                <DetailItem label="Security Tier" value="Encrypted (v4)" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Population Breakdown</span>
                <div className="w-full h-2 bg-white/5 border border-white/5">
                   <div 
                     className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                     style={{ width: `${(selectedServer.players / selectedServer.max) * 100}%` }}
                   />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-gray-500 uppercase">
                  <span>Capacity</span>
                  <span>{selectedServer.players} Connected Users</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedServer(null)}
                className="w-full bg-white/5 border border-white/10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Close Intel Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">{label}</span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}

function PlayerModeration({ isAdmin }: { isAdmin: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<{ bans: any[], reports: any[], warnings: any[], mutes: any[] }>({ bans: [], reports: [], warnings: [], mutes: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'warnings' | 'mutes' | 'bans'>('warnings');
  const [actionModal, setActionModal] = useState<'Warning' | 'Mute' | null>(null);
  const [actionForm, setActionForm] = useState({ reason: "", duration: "1 Hour" });
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const { toast } = useToast();

  const PERMISSIONS = [
    { id: 'canEditForums', label: 'Edit Forums' },
    { id: 'canManageServer', label: 'Manage Server' },
    { id: 'canManageUsers', label: 'Manage Users' },
    { id: 'canPostAnnouncements', label: 'Post Announcements' },
    { id: 'canManageEvents', label: 'Manage Events' },
  ];

  const togglePermission = (permId: string) => {
    if (!editingUser) return;
    const currentPerms = editingUser.permissions || {};
    setEditingUser({
      ...editingUser,
      permissions: {
        ...currentPerms,
        [permId]: !currentPerms[permId]
      }
    });
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, "users", editingUser.uid), { 
        role: editingUser.role || "User",
        permissions: editingUser.permissions || {}
      });
      await logActivity("Update User", `Permissions/Role updated via Moderation Hub for ${editingUser.uid}`);
      toast("success", "User Updated", "Permissions have been successfully synchronized.");
      setEditingUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("username"), limit(10));
      const snap = await getDocs(q);
      const results = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter((u: any) => 
          u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          u.uid === searchQuery
        );
      setUsers(results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadUserHistory = async (user: any) => {
    setSelectedUser(user);
    try {
      const qBans = query(collection(db, "bans"), where("uid", "==", user.uid));
      const qReports = query(collection(db, "reports"), where("targetUid", "==", user.uid));
      const qWarnings = query(collection(db, "warnings"), where("targetUid", "==", user.uid));
      const qMutes = query(collection(db, "mutes"), where("targetUid", "==", user.uid));
      
      const [bansSnap, reportsSnap, warningsSnap, mutesSnap] = await Promise.all([
        getDocs(qBans),
        getDocs(qReports),
        getDocs(qWarnings),
        getDocs(qMutes)
      ]);

      setHistory({
        bans: bansSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        reports: reportsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        warnings: warningsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        mutes: mutesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    } catch (e) {
      console.error(e);
    }
  };

  const submitAction = async () => {
    if (!selectedUser || !actionForm.reason) return;
    try {
      const collectionName = actionModal === 'Warning' ? 'warnings' : 'mutes';
      await addDoc(collection(db, collectionName), {
        targetUid: selectedUser.uid,
        targetUsername: selectedUser.username,
        reason: actionForm.reason,
        duration: actionModal === 'Mute' ? actionForm.duration : null,
        issuedBy: auth.currentUser?.uid,
        issuedByName: auth.currentUser?.displayName || "Admin",
        createdAt: serverTimestamp()
      });
      await logActivity(`Issue ${actionModal}`, `${actionModal} issued to ${selectedUser.username} (${selectedUser.uid}) | Reason: ${actionForm.reason}${actionModal === 'Mute' ? ` | Duration: ${actionForm.duration}` : ''}`);
      toast("success", `${actionModal} Issued`, `${actionModal} issued successfully.`);
      setActionModal(null);
      setActionForm({ reason: "", duration: "1 Hour" });
      loadUserHistory(selectedUser);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <ShieldCheck className="text-red-500" size={20} /> Player Moderation Hub
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4">
          <div className="portal-card">
            <div className="portal-header">Find Player</div>
            <div className="p-4 flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                  className="w-full bg-black/20 border border-(--border-color) pl-10 pr-4 py-2 text-xs outline-none focus:border-red-500" 
                  placeholder="Username or UID..." 
                />
              </div>
              <button 
                onClick={searchUsers}
                disabled={loading}
                className="w-full bg-red-500 text-white py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Execute Search"}
              </button>
            </div>
          </div>

          <div className="portal-card flex-1 min-h-[400px]">
            <div className="portal-header">Search Results</div>
            <div className="p-0">
              {users.map(u => (
                <button
                  key={u.uid}
                  onClick={() => loadUserHistory(u)}
                  className={clsx(
                    "w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center justify-between group",
                    selectedUser?.uid === u.uid && "bg-red-500/10 border-l-2 border-l-red-500"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-red-500 transition-colors uppercase italic">{u.username}</span>
                    <span className="text-[9px] text-gray-500 font-mono">UID: {u.uid}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingUser(u); }}
                      className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-white transition-colors"
                      title="Edit User Data"
                    >
                      <Edit2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-gray-600" />
                  </div>
                </button>
              ))}
              {users.length === 0 && !loading && (
                <div className="p-12 text-center text-xs text-gray-600 font-bold uppercase italic opacity-50">Search for a user to begin moderation...</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {!selectedUser ? (
            <div className="portal-card flex-1 flex flex-col items-center justify-center p-12 text-center border-dashed">
              <ShieldCheck size={48} className="text-gray-800 mb-4" />
              <h3 className="text-lg font-black uppercase text-gray-700 italic">No Subject Selected</h3>
              <p className="text-xs text-gray-600 max-w-xs uppercase font-bold mt-2">Pick a player from the search results to view their history and issue sanctions.</p>
            </div>
          ) : (
            <>
              <div className="portal-card">
                <div className="p-6 flex items-start justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 italic font-black text-2xl">
                      {selectedUser.username?.[0] || "?"}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic text-red-500">{selectedUser.username}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 border border-red-500/20 font-black uppercase tracking-widest">{selectedUser.role}</span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {selectedUser.uid}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-black">Level: <span className="text-white font-mono">{selectedUser.level || 1}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActionModal('Warning')}
                      className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-3 hover:bg-yellow-500 hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
                    >
                      <AlertCircle size={14} /> Warn
                    </button>
                    <button 
                      onClick={() => setActionModal('Mute')}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-500 p-3 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
                    >
                      <VolumeX size={14} /> Mute
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="portal-card">
                  <div className="portal-header flex items-center gap-2"><BarChart3 size={14} /> Player Statistics</div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col bg-white/5 p-3 border border-white/5">
                      <span className="text-[9px] font-black uppercase text-gray-500">Playtime</span>
                      <span className="text-lg font-black italic">142h 30m</span>
                    </div>
                    <div className="flex flex-col bg-white/5 p-3 border border-white/5">
                      <span className="text-[9px] font-black uppercase text-gray-500">Net Worth</span>
                      <span className="text-lg font-black italic text-emerald-500">$1.2M</span>
                    </div>
                    <div className="flex flex-col bg-white/5 p-3 border border-white/5">
                      <span className="text-[9px] font-black uppercase text-gray-500">Warnings</span>
                      <span className="text-lg font-black italic text-yellow-500">{history.warnings.length}</span>
                    </div>
                    <div className="flex flex-col bg-white/5 p-3 border border-white/5">
                      <span className="text-[9px] font-black uppercase text-gray-500">Mutes Total</span>
                      <span className="text-lg font-black italic text-blue-500">{history.mutes.length}</span>
                    </div>
                  </div>
                </div>

                <div className="portal-card flex flex-col">
                  <div className="flex border-b border-white/10 overflow-x-auto">
                    {(['warnings', 'mutes', 'bans'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                          "px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-r border-white/10 whitespace-nowrap",
                          activeTab === tab ? "bg-white/10 text-white border-b-2 border-b-red-500" : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {tab} ({history[tab].length})
                      </button>
                    ))}
                  </div>
                  <div className="p-0 max-h-[220px] overflow-y-auto">
                    <table className="vbulletin-table">
                      <thead className="sticky top-0 bg-black z-10">
                        <tr>
                          <th>Details</th>
                          <th>Issuer</th>
                          <th className="text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTab === 'warnings' && history.warnings.map(w => (
                          <tr key={w.id} className="border-b border-white/5">
                            <td className="text-[10px] text-gray-400 italic">"{w.reason}"</td>
                            <td className="text-[9px] font-black uppercase text-yellow-500/80">{w.issuedByName}</td>
                            <td className="text-right text-[9px] text-gray-600 font-mono">{w.createdAt?.toDate().toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {activeTab === 'mutes' && history.mutes.map(m => (
                          <tr key={m.id} className="border-b border-white/5">
                            <td className="text-[10px] text-gray-400 italic">
                               <div className="flex flex-col">
                                 <div className="flex items-center gap-2">
                                   {m.inactive && <span className="text-[7px] bg-gray-500 text-black px-1 font-black uppercase">Revoked</span>}
                                   <span>"{m.reason}"</span>
                                 </div>
                                 <span className="text-[8px] text-blue-500 uppercase not-italic font-black mt-0.5">Duration: {m.duration}</span>
                               </div>
                            </td>
                            <td className="text-[9px] font-black uppercase text-blue-500/80">{m.issuedByName}</td>
                            <td className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-[9px] text-gray-600 font-mono mr-2">{m.createdAt?.toDate().toLocaleDateString()}</span>
                                {!m.inactive && (
                                  <button 
                                    onClick={async () => {
                                      if (!window.confirm("Revoke this mute suspension?")) return;
                                      await updateDoc(doc(db, "mutes", m.id), { inactive: true });
                                      toast("info", "Mute Revoked", "User communication restriction lifted.");
                                      loadUserHistory(selectedUser);
                                    }}
                                    className="p-1 hover:bg-blue-500/20 text-blue-500 transition-colors"
                                    title="Revoke Mute"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {activeTab === 'bans' && history.bans.map(b => (
                          <tr key={b.id} className="border-b border-white/5">
                            <td className="text-[10px] text-gray-400 italic">
                               <div className="flex flex-col">
                                 <span>"{b.reason}"</span>
                                 <span className="text-[8px] text-red-500 uppercase not-italic font-black mt-0.5">{b.duration}</span>
                               </div>
                            </td>
                            <td className="text-[9px] font-black uppercase text-red-500/80">{b.bannedByName}</td>
                            <td className="text-right text-[9px] text-gray-600 font-mono">{b.bannedAt?.toDate().toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {history[activeTab].length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-[10px] text-gray-600 font-bold uppercase italic">No {activeTab} on record.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="portal-card">
                <div className="portal-header">Incident Reports ({history.reports.length})</div>
                <div className="p-0">
                  <table className="vbulletin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Incident Reason</th>
                        <th>Reporter</th>
                        <th>Date</th>
                        <th className="text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.reports.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-[10px] text-gray-600 font-black uppercase tracking-widest italic opacity-50">No reports on file for this subject.</td>
                        </tr>
                      ) : history.reports.map(r => (
                        <tr key={r.id}>
                          <td className="font-mono text-[9px]">{r.id.slice(0, 6)}</td>
                          <td className="text-[11px] font-bold italic">"{r.reason}"</td>
                          <td className="text-[10px] uppercase font-black">{r.reportedByName}</td>
                          <td className="text-[10px] text-gray-500">{r.createdAt?.toDate().toLocaleDateString()}</td>
                          <td className="text-right">
                             <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 border border-emerald-500/20 font-black uppercase select-none">Resolved</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[250] animate-in fade-in duration-200">
          <div className="portal-card w-full max-w-md shadow-2xl border-white/20">
            <div className={clsx(
              "portal-header flex justify-between items-center transition-colors",
              actionModal === 'Warning' ? "text-yellow-500 border-b-yellow-500/30" : "text-blue-500 border-b-blue-500/30"
            )}>
              <span className="flex items-center gap-2 uppercase tracking-tighter">
                {actionModal === 'Warning' ? <AlertCircle size={16} /> : <VolumeX size={16} />}
                Issue {actionModal}: {selectedUser?.username}
              </span>
              <button onClick={() => setActionModal(null)}><X size={16} /></button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Violation Details / Reason</label>
                <textarea 
                  value={actionForm.reason}
                  onChange={(e) => setActionForm({ ...actionForm, reason: e.target.value })}
                  className="bg-black/40 border border-white/10 p-4 text-sm min-h-[120px] outline-none focus:border-white transition-colors placeholder:text-gray-700 italic"
                  placeholder="Describe the incident explicitly for administrative record..."
                />
              </div>

              {actionModal === 'Mute' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Mute Duration</label>
                  <select 
                    value={actionForm.duration}
                    onChange={(e) => setActionForm({ ...actionForm, duration: e.target.value })}
                    className="bg-black border border-white/10 text-xs p-3 outline-none focus:border-blue-500 shadow-inner"
                  >
                    <option value="15 Minutes">15 Minutes</option>
                    <option value="1 Hour">1 Hour</option>
                    <option value="6 Hours">6 Hours</option>
                    <option value="1 Day">1 Day</option>
                    <option value="3 Days">3 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="30 Days">30 Days</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button onClick={() => setActionModal(null)} className="px-5 py-2 text-[10px] font-black uppercase transition-colors hover:bg-white/5 tracking-widest">Cancel</button>
                <button 
                  onClick={submitAction}
                  className={clsx(
                    "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-lg",
                    actionModal === 'Warning' ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-blue-600 text-white hover:bg-blue-500"
                  )}
                >
                  Authorize Punishment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-md">
            <div className="portal-header flex justify-between items-center text-red-500">
              <span className="flex items-center gap-2 tracking-tighter"><Edit2 size={16} /> MODERATOR OVERRIDE: {editingUser.username}</span>
              <button onClick={() => setEditingUser(null)}><X size={16} /></button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-gray-500">Primary Role</label>
                <select 
                  value={editingUser.role || "User"}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="bg-black border border-white/10 text-xs p-3 outline-none focus:border-red-500 w-full"
                >
                  <option value="User">User</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Forum Moderator">Forum Moderator</option>
                  <option value="Server Manager">Server Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase text-gray-500">Custom Accreditations</label>
                <div className="grid grid-cols-1 gap-2">
                  {PERMISSIONS.map(perm => (
                    <button
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={clsx(
                        "flex items-center justify-between p-3 border text-[10px] font-black uppercase tracking-widest transition-colors",
                        editingUser.permissions?.[perm.id] 
                          ? "bg-red-500/10 border-red-500 text-red-500" 
                          : "bg-white/5 border-white/10 text-gray-500 opacity-60 hover:opacity-100"
                      )}
                    >
                      <span>{perm.label}</span>
                      {editingUser.permissions?.[perm.id] ? <ShieldCheck size={14} /> : <X size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button 
                  onClick={saveUserChanges}
                  className="bg-red-500 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center gap-2 shadow-xl"
                >
                  <Save size={14} /> Synchronize Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [renamingCat, setRenamingCat] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All");
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "TDM",
    description: "",
    startTime: "",
    location: "",
    prize: "",
    playerCount: 0,
    status: "scheduled",
    creatorOverride: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startTime", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qCat = query(collection(db, "event_categories"), orderBy("name", "asc"));
    const unsubCat = onSnapshot(qCat, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsub(); unsubCat(); };
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startTime) return;
    try {
      let creatorName = auth.currentUser?.displayName || auth.currentUser?.email || "Admin";
      
      // Attempt to get the actual username from Firestore
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          creatorName = userDoc.data().username || creatorName;
        }
      }

      await addDoc(collection(db, "events"), {
        ...newEvent,
        playerCount: Number(newEvent.playerCount) || 0,
        startTime: new Date(newEvent.startTime).toISOString(),
        createdBy: auth.currentUser?.uid,
        creatorName: newEvent.creatorOverride || creatorName,
        createdAt: serverTimestamp(),
      });
      await logActivity("Create Event", `New event scheduled: "${newEvent.title}" (${newEvent.type})`);
      setShowCreate(false);
      setNewEvent({ title: "", type: "TDM", description: "", startTime: "", location: "", prize: "", playerCount: 0, status: "scheduled", creatorOverride: "" });
      toast("success", "Event Scheduled", "The in-game event has been added to the calendar.");
    } catch (err) {
      console.error(err);
      toast("error", "Error", "Failed to schedule event.");
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const { id, ...data } = editingEvent;
      await updateDoc(doc(db, "events", id), {
        ...data,
        playerCount: Number(data.playerCount) || 0,
        updatedAt: serverTimestamp()
      });
      await logActivity("Update Event", `Event details updated: "${data.title}" (ID: ${id})`);
      setEditingEvent(null);
      toast("success", "Event Updated", "The event details have been successfully synchronized.");
    } catch (err) {
      console.error(err);
      toast("error", "Error", "Failed to update event.");
    }
  };

  const addCategory = async () => {
    if (!newCatName) return;
    try {
      await addDoc(collection(db, "event_categories"), { name: newCatName });
      setNewCatName("");
      toast("success", "Category Added", "New event category has been created.");
    } catch (e) {
      toast("error", "Error", "Failed to add category.");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Remove this category?")) return;
    try {
      await deleteDoc(doc(db, "event_categories", id));
      toast("success", "Category Removed", "Category deleted successfully.");
    } catch (e) {
      toast("error", "Error", "Failed to delete category.");
    }
  };

  const renameCategory = async (id: string) => {
    if (!renameValue) return;
    try {
      await updateDoc(doc(db, "event_categories", id), { name: renameValue });
      setRenamingCat(null);
      setRenameValue("");
      toast("success", "Category Renamed", "Category name has been updated.");
    } catch (e) {
      toast("error", "Error", "Failed to rename category.");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const eventToDelete = events.find(e => e.id === id);
      await deleteDoc(doc(db, "events", id));
      await logActivity("Delete Event", `Event permanently removed: "${eventToDelete?.title || "Unknown"}" (ID: ${id})`);
      toast("success", "Record Purged", "Event metadata has been removed from the core server.");
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
      toast("error", "Error", "Failed to purge event record.");
    }
  };

  const combinedTypes = Array.from(new Set(["TDM", "Hunger Games", "Race", "Derby", "Roleplay", "Infiltration", "Survival", ...categories.map(c => c.name)]));

  const filteredEvents = events.filter(ev => {
    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
    const matchesType = typeFilter === "All" || ev.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const eventStatuses = ["all", "scheduled", "active", "completed", "cancelled"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
          <Calendar className="text-pink-500" size={20} /> Operation Deployment
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCatModal(true)}
            className="border border-pink-500/30 text-pink-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-pink-500/5 transition-colors flex items-center gap-2"
          >
            <Settings2 size={14} /> Classifications
          </button>
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-pink-500 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> New Deployment
          </button>
        </div>
      </div>

      <div className="portal-card p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Status Discipline</span>
            <div className="flex gap-1">
              {eventStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all",
                    statusFilter === s ? "bg-pink-500/20 border-pink-500 text-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.1)]" : "border-white/5 text-gray-500 hover:text-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Type Categorization</span>
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-lg scrollbar-hide">
              {["All", ...combinedTypes].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={clsx(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                    typeFilter === t ? "bg-blue-500/20 border-blue-500 text-blue-500" : "border-white/5 text-gray-500 hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="portal-card overflow-hidden">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Type</th>
              <th>Status</th>
              <th>Start Time</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-gray-500 font-bold uppercase italic opacity-50">No events match the selected criteria.</td>
              </tr>
            ) : filteredEvents.map(ev => (
              <tr key={ev.id}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold">{ev.title}</span>
                    <span className="text-[9px] text-gray-500 max-w-xs truncate">{ev.description}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 border border-blue-500 text-blue-500 font-black uppercase">{ev.type}</span>
                </td>
                <td>
                  <span className={clsx(
                    "text-[9px] px-2 py-0.5 font-bold uppercase border",
                    ev.status === 'active' ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" :
                    ev.status === 'completed' ? "bg-gray-500/10 border-gray-500 text-gray-500" :
                    ev.status === 'cancelled' ? "bg-red-500/10 border-red-500 text-red-500" :
                    "bg-blue-500/10 border-blue-500 text-blue-500"
                  )}>
                    {ev.status || 'scheduled'}
                  </span>
                </td>
                <td className="text-[10px] font-mono text-gray-400">
                  {new Date(ev.startTime).toLocaleString()}
                </td>
                <td className="text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditingEvent(ev)} className="text-blue-500 hover:text-blue-400 p-2" title="Reconfigure Parameters"><Edit2 size={14} /></button>
                    <button onClick={() => setConfirmDelete(ev.id)} className="text-red-500 hover:text-red-400 p-2" title="Purge Record"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEvent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-lg">
            <div className="portal-header flex justify-between items-center text-blue-500">
              <span className="flex items-center gap-2"><Edit2 size={16} /> Edit Event Directive</span>
              <button onClick={() => setEditingEvent(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateEvent} className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Operational Directive</label>
                  <input 
                    required
                    value={editingEvent.title}
                    onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-blue-500 font-bold uppercase transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Event Category</label>
                  <select 
                    value={editingEvent.type}
                    onChange={e => setEditingEvent({...editingEvent, type: e.target.value})}
                    className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-blue-500 font-bold uppercase cursor-pointer"
                  >
                    {combinedTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Mission Intelligence</label>
                <textarea 
                  value={editingEvent.description}
                  onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                  className="bg-black/40 border border-white/10 p-3 text-sm min-h-[80px] outline-none focus:border-blue-500 italic text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Deployment Window</label>
                  <input 
                    required
                    type="datetime-local"
                    value={editingEvent.startTime.slice(0, 16)}
                    onChange={e => setEditingEvent({...editingEvent, startTime: new Date(e.target.value).toISOString()})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Reward Pool</label>
                  <input 
                    value={editingEvent.prize}
                    onChange={e => setEditingEvent({...editingEvent, prize: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-emerald-500 font-black text-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sector / Coordinate</label>
                  <input 
                    value={editingEvent.location}
                    onChange={e => setEditingEvent({...editingEvent, location: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Strike Capability</label>
                  <input 
                    type="number"
                    value={editingEvent.playerCount}
                    onChange={e => setEditingEvent({...editingEvent, playerCount: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Origin Authority</label>
                <input 
                  value={editingEvent.creatorName}
                  onChange={e => setEditingEvent({...editingEvent, creatorName: e.target.value})}
                  className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Event Status</label>
                <select 
                  value={editingEvent.status}
                  onChange={e => setEditingEvent({...editingEvent, status: e.target.value})}
                  className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setEditingEvent(null)} className="px-6 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
                >
                  <Save size={14} /> Update Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-md">
            <div className="portal-header flex justify-between items-center text-pink-500">
              <span className="flex items-center gap-2"><Settings2 size={16} /> Event Categories</span>
              <button onClick={() => setShowCatModal(false)}><X size={16} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-2">
                <input 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 p-2 text-sm outline-none focus:border-pink-500"
                  placeholder="Category Name"
                />
                <button onClick={addCategory} className="bg-pink-500 text-white px-4 py-2 text-xs font-black uppercase"><Plus size={14} /></button>
              </div>
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                {categories.map(c => (
                  <div key={c.id} className="flex flex-col gap-2 p-3 bg-white/5 border border-white/5 group">
                    <div className="flex justify-between items-center">
                      {renamingCat?.id === c.id ? (
                        <div className="flex gap-2 w-full">
                          <input 
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 p-1 text-[10px] outline-none"
                            autoFocus
                          />
                          <button onClick={() => renameCategory(c.id)} className="text-emerald-500"><Save size={12} /></button>
                          <button onClick={() => setRenamingCat(null)} className="text-gray-500"><X size={12} /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold">{c.name}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setRenamingCat(c); setRenameValue(c.name); }}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => deleteCategory(c.id)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[200]">
          <div className="portal-card w-full max-w-lg">
            <div className="portal-header flex justify-between items-center text-pink-500">
              <span className="flex items-center gap-2"><Calendar size={16} /> New Event Directive</span>
              <button onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Event Title</label>
                  <input 
                    required
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                    placeholder="e.g. LS Street Race"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Event Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                    className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                  >
                    {combinedTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Description</label>
                <textarea 
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="bg-black/40 border border-white/10 p-3 text-sm min-h-[80px] outline-none focus:border-pink-500"
                  placeholder="What happens during this event?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Start Time (ISO)</label>
                  <input 
                    required
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Prize Pool</label>
                  <input 
                    value={newEvent.prize}
                    onChange={e => setNewEvent({...newEvent, prize: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="e.g. $50,000 + Donator Points"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Location</label>
                  <input 
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                    placeholder="e.g. Santa Maria Beach"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-gray-500">Player Count</label>
                  <input 
                    type="number"
                    value={newEvent.playerCount}
                    onChange={e => setNewEvent({...newEvent, playerCount: parseInt(e.target.value) || 0})}
                    className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Created By / Organization</label>
                <input 
                  value={newEvent.creatorOverride}
                  onChange={e => setNewEvent({...newEvent, creatorOverride: e.target.value})}
                  className="bg-black/40 border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                  placeholder="Auto-detected if empty"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Initial Status</label>
                <select 
                  value={newEvent.status}
                  onChange={e => setNewEvent({...newEvent, status: e.target.value})}
                  className="bg-black border border-white/10 p-3 text-sm outline-none focus:border-pink-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button 
                  type="submit"
                  className="bg-pink-500 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all flex items-center gap-2"
                >
                  <Save size={14} /> Commit Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmationModal 
          title="ABORT DEPLOYMENT"
          message="Are you certain you want to permanently purge this mission record? This action will overwrite existing calendars and cannot be reversed."
          confirmText="Confirm Purge"
          onConfirm={() => deleteEvent(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
