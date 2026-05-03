import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Trophy, ChevronLeft, Zap, Shield, User, Info, AlertTriangle, Users, CheckCircle2, LogIn } from "lucide-react";
import { doc, getDoc, collection, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "../components/Toast";
import Countdown from "../components/Countdown";

export default function EventDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [userJoined, setUserJoined] = useState(false);

  useEffect(() => {
    if (!id) return;

    const eventUnsub = onSnapshot(doc(db, "events", id), (snap) => {
      if (snap.exists()) {
        setEvent({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    const rsvpsUnsub = onSnapshot(collection(db, `events/${id}/rsvps`), (snap) => {
      const rsvpData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRsvps(rsvpData);
      
      if (auth.currentUser) {
        setUserJoined(rsvpData.some(r => r.id === auth.currentUser?.uid));
      }
    });

    return () => {
      eventUnsub();
      rsvpsUnsub();
    };
  }, [id]);

  const handleRSVP = async () => {
    if (!auth.currentUser || !id) {
      toast("error", "Login Required", "You must be signed in to join events.");
      return;
    }

    setIsJoining(true);
    try {
      if (userJoined) {
        await deleteDoc(doc(db, `events/${id}/rsvps`, auth.currentUser.uid));
        toast("info", "Left Event", "You have successfully unregistered from this operation.");
      } else {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        await setDoc(doc(db, `events/${id}/rsvps`, auth.currentUser.uid), {
          username: userData.username || auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
          skin: userData.skin || 294,
          joinedAt: serverTimestamp()
        });
        toast("success", "Operation Joined", "Your participation has been logged in the mission manifest.");
      }
    } catch (err) {
      console.error(err);
      toast("error", "Protocol Error", "Failed to synchronize participation data.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-12 h-12 border-4 border-(--accent) border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Decrypting Mission Data...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6">
        <AlertTriangle size={48} className="text-red-500" />
        <div className="text-center">
          <h1 className="text-xl font-black uppercase italic text-white mb-2">Data Fragment Corrupted</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">The requested mission intelligence could not be retrieved.</p>
        </div>
        <Link to="/events" className="bg-white/5 border border-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Return to Ops Center</Link>
      </div>
    );
  }

  const isExpired = new Date(event.startTime) < new Date() && event.status !== "active";
  const status = event.status || (isExpired ? "completed" : "scheduled");

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      <Link to="/events" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-(--accent) transition-colors w-fit">
        <ChevronLeft size={14} /> Back to Briefings
      </Link>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[300px] md:h-[400px] portal-card overflow-hidden group">
        {event.bannerUrl ? (
          <img 
            src={event.bannerUrl} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
            <Zap size={120} className="text-white opacity-5" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-(--accent) text-black px-3 py-1 -rotate-2">{event.type}</span>
              {event.tags?.map((tag: string, i: number) => (
                <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none text-white drop-shadow-2xl">
              {event.title}
            </h1>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-white/60">
                <MapPin size={16} className="text-(--accent)" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">{event.location || "Confidential"}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Users size={16} className="text-(--accent)" />
                <span className="text-xs font-black uppercase tracking-widest font-mono">{rsvps.length} Personnel Linked</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 self-end">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 min-w-[200px]">
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Countdown to Deployment</span>
              <Countdown targetDate={event.startTime} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section className="portal-card overflow-hidden bg-black/40 backdrop-blur-md">
            <div className="portal-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-(--accent)" /> Mission Objective
              </div>
              <span className="text-[8px] font-mono opacity-30">SEC_LEVEL_4</span>
            </div>
            <div className="p-8 md:p-10">
              <p className="text-gray-300 leading-relaxed italic text-xl border-l-[6px] border-(--accent)/30 pl-8 py-4 bg-white/[0.02]">
                "{event.description || "In-depth intelligence pending. Stand by for encrypted updates."}"
              </p>
            </div>
          </section>

          {/* Personnel List */}
          <section className="portal-card bg-black/40">
            <div className="portal-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-(--accent)" /> Active Personnel Manifest
              </div>
              <span className="text-[10px] font-black text-(--accent)">{rsvps.length} REGISTERED</span>
            </div>
            <div className="p-8">
              {rsvps.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-white/5 bg-white/[0.01]">
                   <Users size={32} className="mx-auto text-gray-700 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 italic">Manifest is currently empty. Awaiting first volunteer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {rsvps.map((rsvp, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={rsvp.id} 
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:border-(--accent)/30 transition-all group"
                    >
                      <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center shrink-0">
                         {/* Static fallback for skin representation */}
                         <div className="w-6 h-6 rounded-full bg-(--accent)/20 border border-(--accent)/40 flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform">
                            {rsvp.username?.[0] || "?"}
                         </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-black uppercase italic text-white truncate">{rsvp.username}</span>
                        <span className="text-[7px] text-gray-500 font-mono tracking-tighter">ID: {rsvp.id.slice(0, 8)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className={clsx(
            "portal-card shadow-2xl transition-all duration-500",
            userJoined ? "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5" : "border-(--accent)/30 bg-(--accent)/5 shadow-(--accent)/5"
          )}>
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-4">
                {userJoined ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={32} className="text-black" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-400">MANIFESTED</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">You are cleared for deployment</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-(--accent) flex items-center justify-center shadow-[0_0_30px_rgba(242,125,38,0.3)]">
                      <Zap size={32} className="text-black" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Join Operation</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Register your interest now</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {auth.currentUser ? (
                  <button 
                    disabled={isJoining || status === 'completed' || status === 'cancelled'}
                    onClick={handleRSVP}
                    className={clsx(
                      "w-full py-4 text-xs font-black uppercase tracking-[0.3em] transition-all relative group h-14",
                      userJoined 
                        ? "bg-white/5 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" 
                        : "bg-(--accent) text-black hover:opacity-90 shadow-[0_4px_20px_rgba(242,125,38,0.2)]",
                      (isJoining || status === 'completed' || status === 'cancelled') && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    {isJoining ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : userJoined ? (
                      "LEAVE OPERATION"
                    ) : (
                      "COMMENCE JOINING"
                    )}
                  </button>
                ) : (
                  <Link 
                    to="/login"
                    className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.3em] text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} /> LOGIN TO JOIN
                  </Link>
                )}
                
                {status === 'completed' && <p className="text-[9px] text-red-500 font-black text-center uppercase tracking-widest">Operation has concluded.</p>}
                {status === 'cancelled' && <p className="text-[9px] text-red-500 font-black text-center uppercase tracking-widest">Operation was aborted.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">Status</span>
                  <span className={clsx(
                    "text-xs font-black uppercase italic",
                    status === 'active' ? "text-emerald-400" : "text-(--accent)"
                  )}>{status}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">Prize</span>
                  <span className="text-xs font-black uppercase italic text-white truncate max-w-full">{event.prize || "Glory"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="portal-card">
            <div className="portal-header flex items-center gap-2">
              <Clock size={14} /> Briefing History
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Commencement</span>
                <div className="text-white font-mono text-xs">
                  {new Date(event.startTime).toLocaleString()}
                </div>
              </div>
              {event.createdAt && (
                <div className="pt-4 border-t border-white/5 flex flex-col">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Intel Logged</span>
                  <div className="text-gray-500 font-mono text-[10px]">
                    {event.createdAt.toDate().toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

