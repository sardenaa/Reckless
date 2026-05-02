import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { User, Shield, Briefcase, Clock, Calendar, Hash, MapPin, Award, Edit3, Check, X, MessageSquare } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "../components/Toast";

export default function Profile() {
  const { uid } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("Snake");
  const [skinId, setSkinId] = useState(294);
  const [userRole, setUserRole] = useState("User");
  const [stats, setStats] = useState({ 
    money: 0, 
    bank: 0,
    crimes: 0, 
    hours: 0,
    kills: 0,
    deaths: 0,
    arrests: 0,
    level: 1,
    job: "Unemployed",
    faction: "None",
    materials: 0
  });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const isOwner = auth.currentUser?.uid === uid;
  const { toast } = useToast();

  useEffect(() => {
    if (!uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || "Unknown");
          setSkinId(data.skin || 294);
          setUserRole(data.role || "User");
          setStats({
            money: data.money || 500,
            bank: data.bank || 0,
            crimes: data.crimes || 0,
            hours: data.playingHours || data.hours || 0,
            kills: data.kills || 0,
            deaths: data.deaths || 0,
            arrests: data.arrests || 0,
            level: data.level || 1,
            job: data.job || "Unemployed",
            faction: data.faction || "None",
            materials: data.materials || 0
          });
        }

        // Fetch assets
        const [vSnap, pSnap] = await Promise.all([
          getDocs(query(collection(db, "vehicles"), where("ownerId", "==", uid))),
          getDocs(query(collection(db, "properties"), where("ownerId", "==", uid)))
        ]);

        setVehicles(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setProperties(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (e) {
        console.error("Error fetching profile", e);
      }
    };
    fetchProfile();
  }, [uid]);

  const handleSave = async () => {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        username,
        skin: skinId
      });
      toast("success", "Profile Updated", "Your profile changes have been saved successfully.");
      setIsEditing(false);
    } catch (e) {
      console.error("Error updating profile", e);
      // Fallback for demo if users collection isn't seeded
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 pb-4 border-b border-white/5 gap-4">
        <div className="flex items-center gap-4">
            <div className="w-4 h-16 bg-(--accent) transform -rotate-12" />
              <div className="flex flex-col">
                <h1 className="text-3xl sm:text-5xl font-display italic font-normal uppercase tracking-tight text-white leading-none">CHARACTER DOSSIER</h1>
                <span className="text-[10px] sm:text-sm font-marker text-(--accent) -rotate-1 ml-1 sm:ml-2">Internal identity token: {uid?.slice(0, 12).toUpperCase()}</span>
              </div>
        </div>
        {isOwner && (
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display italic"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all font-display italic neon-shadow"
                >
                  <Check size={16} /> Sync Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-display italic"
                >
                  <X size={16} /> Abort
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <div className="portal-card relative overflow-hidden group">
            <div className="aspect-square bg-white/[0.03] border-4 border-white/5 flex items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/60 z-0" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0" />
              <div className="w-full h-full relative z-20">
                <img 
                  src={`https://www.gta-san-andreas.pl/grafika/skiny/skin_${skinId}.png`} 
                  alt={`Skin ${skinId}`} 
                  className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(242,125,38,0.3)] group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.src = "https://www.gta-san-andreas.pl/grafika/skiny/skin_294.png")}
                />
              </div>
            </div>
            <div className="p-8 bg-black/40 backdrop-blur-md relative border-t border-white/5">
              {isEditing ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Callsign</label>
                    <input 
                      value={username} 
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-black border border-white/10 p-3 text-center text-xl font-black uppercase outline-none focus:border-(--accent) transition-all font-display italic"
                      placeholder="Username"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Identity ID (Skin)</label>
                    <input 
                      type="number"
                      value={skinId} 
                      onChange={e => setSkinId(parseInt(e.target.value))}
                      className="w-full bg-black border border-white/10 p-3 text-center font-mono text-xs outline-none focus:border-(--accent) transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic font-display mb-1 neon-text">{username}</h2>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <span className={clsx(
                        "text-[10px] px-4 py-1.5 font-black uppercase tracking-[0.2em] border-2 italic font-display",
                        userRole === 'Super Admin' ? "bg-purple-500/10 border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]" :
                        userRole === 'Admin' ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                        userRole === 'Moderator' || userRole === 'Forum Moderator' ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" :
                        userRole === 'Server Manager' ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]" :
                        "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      )}>
                        {userRole}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-white/5 my-2" />
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 font-mono">Assigned Role & Affiliation</span>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white italic">{stats.job} <span className="text-gray-700 mx-2">//</span> {stats.faction}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="portal-card">
             <div className="portal-header">Connected Accounts</div>
             <div className="p-4 flex flex-col gap-3">
               <div className="flex items-center justify-between p-2 bg-[#5865F2]/5 border border-[#5865F2]/20">
                 <div className="flex items-center gap-2">
                   <MessageSquare size={14} className="text-[#5865F2]" />
                   <span className="text-[10px] font-black uppercase tracking-wider">Discord</span>
                 </div>
                 <span className="text-[9px] text-[#5865F2] font-black uppercase">Linked: Snake#0001</span>
               </div>
               <div className="flex items-center justify-between p-2 bg-white/5 border border-white/10 opacity-50">
                 <div className="flex items-center gap-2">
                   <Shield size={14} />
                   <span className="text-[10px] font-black uppercase tracking-wider">Steam</span>
                 </div>
                 <button className="text-[9px] font-black uppercase hover:text-(--accent)">Link Account</button>
               </div>
             </div>
          </div>

          <div className="portal-card">
            <div className="portal-header">Statistics Overview</div>
            <div className="p-4 flex flex-col gap-3">
              <ProfileStat icon={<Hash size={12} />} label="Player ID" value={uid?.slice(0, 8).toUpperCase() || "00000"} />
              <ProfileStat icon={<Shield size={12} />} label="Level" value={stats.level} />
              <ProfileStat icon={<Briefcase size={12} />} label="Faction" value={stats.faction} />
              <ProfileStat icon={<Award size={12} />} label="Job" value={stats.job} />
              <ProfileStat icon={<MapPin size={12} />} label="Residence" value="San Andreas" />
              <ProfileStat icon={<Calendar size={12} />} label="Joined" value="Jan 24, 2024" />
              <ProfileStat icon={<Clock size={12} />} label="Hours" value={`${stats.hours} hrs`} />
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-4">
            <QuickStat label="Cash" value={`$${stats.money.toLocaleString()}`} color="text-emerald-400" />
            <QuickStat label="Bank" value={`$${stats.bank.toLocaleString()}`} color="text-emerald-500" />
            <QuickStat label="Level" value={stats.level} color="text-cyan-400" />
            <QuickStat label="Hours" value={stats.hours} color="text-purple-400" />
            <QuickStat label="Kills" value={stats.kills} color="text-red-500" />
            <QuickStat label="Deaths" value={stats.deaths} color="text-gray-500" />
            <QuickStat label="Arrests" value={stats.arrests} color="text-blue-500" />
            <QuickStat label="Crimes" value={stats.crimes} color="text-yellow-500" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="portal-card">
              <div className="portal-header tracking-widest uppercase">Registered Vehicles ({vehicles.length})</div>
              <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {vehicles.length === 0 ? (
                  <div className="py-8 text-center text-[10px] text-gray-500 font-bold uppercase italic border border-dashed border-white/5">No vehicles in transport database.</div>
                ) : (
                  vehicles.map((v, i) => (
                    <AssetCard key={i} type="V" name={v.model} value={`PLATE: ${v.plate || "N/A"}`} status={v.color || "Active"} />
                  ))
                )}
              </div>
            </div>

            <div className="portal-card">
              <div className="portal-header tracking-widest uppercase">Property Portfolio ({properties.length})</div>
              <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {properties.length === 0 ? (
                  <div className="py-8 text-center text-[10px] text-gray-500 font-bold uppercase italic border border-dashed border-white/5">No real estate holdings found.</div>
                ) : (
                  properties.map((p, i) => (
                    <AssetCard key={i} type="P" name={p.name} value={p.location || "San Andreas"} status={`$${p.price?.toLocaleString() || "N/A"}`} />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="portal-card">
            <div className="portal-header">Achievements & Awards</div>
            <div className="p-8 flex items-center justify-center gap-12 flex-wrap opacity-40 hover:opacity-100 transition-opacity">
              <AwardBadge icon={<Award />} label="Veteran" />
              <AwardBadge icon={<Award />} label="Top Gun" />
              <AwardBadge icon={<Award />} label="Billionaire" />
              <AwardBadge icon={<Award />} label="Pacifist" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ icon, label, value }: any) {
  return (
    <div className="flex justify-between items-center text-[10px] font-bold uppercase py-1 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-(--text-secondary)">{icon} {label}</div>
      <div className="text-white">{value}</div>
    </div>
  );
}

function QuickStat({ label, value, color }: any) {
  return (
    <div className="portal-card p-6 bg-black/40 backdrop-blur-md flex flex-col gap-3 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-5 italic text-[8px] font-black group-hover:opacity-10 transition-opacity">SYS_STAT</div>
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1 group-hover:text-white transition-colors">{label}</span>
      <span className={`text-2xl font-black font-display italic tracking-tight truncate leading-none ${color} neon-text`}>{value}</span>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "100%" }}
           transition={{ duration: 1, delay: 0.5 }}
           className={clsx("h-full opacity-40", color.replace('text-', 'bg-'))} 
         />
      </div>
    </div>
  );
}

function AssetCard({ type, name, value, status }: any) {
  return (
    <div className="flex items-center gap-5 bg-black/40 backdrop-blur-sm border border-white/5 p-4 group hover:bg-(--accent)/5 transition-all">
      <div className="w-12 h-12 bg-black/40 border-2 border-white/5 flex items-center justify-center text-xs font-black text-(--accent) shrink-0 group-hover:border-(--accent)/30 transition-colors shadow-lg">
        {type[0]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black uppercase tracking-tight truncate text-white italic group-hover:text-(--accent) transition-colors">{name}</h4>
        <div className="flex justify-between items-end mt-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 font-mono italic">{value}</span>
          <span className="text-[10px] font-black uppercase text-(--accent) neon-text">{status}</span>
        </div>
      </div>
    </div>
  );
}

function AwardBadge({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-help">
      <div className="text-(--accent) group-hover:scale-120 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
