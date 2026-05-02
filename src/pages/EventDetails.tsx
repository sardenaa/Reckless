import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Trophy, ChevronLeft, Zap, Shield, User, Info, AlertTriangle, Users } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { clsx } from "clsx";
import { motion } from "motion/react";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <Link to="/events" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-(--accent) transition-colors w-fit">
        <ChevronLeft size={14} /> Back to Briefings
      </Link>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-(--accent)/10 p-2 border border-(--accent)/20">
                <Zap size={20} className="text-(--accent)" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-(--accent)">{event.type}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none group-hover:text-(--accent) transition-colors">
              {event.title}
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Deployment Status</span>
            {status === 'active' ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-xs font-black uppercase tracking-widest">Live Operation</span>
              </div>
            ) : status === 'completed' ? (
              <div className="bg-gray-500/10 text-gray-500 border border-gray-500/30 px-6 py-2 rounded-sm">
                <span className="text-xs font-black uppercase tracking-widest">Concluded</span>
              </div>
            ) : status === 'cancelled' ? (
              <div className="bg-red-500/10 text-red-500 border border-red-500/30 px-6 py-2 rounded-sm">
                <span className="text-xs font-black uppercase tracking-widest">Aborted</span>
              </div>
            ) : (
              <div className="bg-(--accent)/10 text-(--accent) border border-(--accent)/30 px-6 py-2 rounded-sm">
                <span className="text-xs font-black uppercase tracking-widest">Scheduled Deployment</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-8">
            <section className="portal-card overflow-hidden">
              <div className="portal-header flex items-center gap-2">
                <Info size={14} /> Mission Briefing
              </div>
              <div className="p-8">
                <p className="text-gray-400 leading-relaxed italic text-lg border-l-4 border-(--accent)/50 pl-6 py-2">
                  "{event.description || "Mission briefing classified. No further details available at this time."}"
                </p>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="portal-card bg-black/20 p-6 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-600 truncate tracking-widest flex items-center gap-2">
                  <User size={12} /> Issued By
                </span>
                <span className="text-sm font-bold text-white">{event.creatorName || "High Command"}</span>
              </div>
              <div className="portal-card bg-black/20 p-6 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-gray-600 truncate tracking-widest flex items-center gap-2">
                  <Shield size={12} /> Intelligence ID
                </span>
                <span className="text-sm font-mono text-gray-400 uppercase">{event.id.slice(0, 12)}</span>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="portal-card shadow-xl border-(--accent)/20">
              <div className="portal-header bg-(--accent)/5 text-(--accent) flex items-center gap-2">
                <Clock size={14} /> Deployment Timer
              </div>
              <div className="p-6 flex flex-col gap-6">
                <div>
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-2">Commencement Time</span>
                  <div className="text-white font-black italic text-xl tracking-tighter">
                    {new Date(event.startTime).toLocaleString()}
                  </div>
                </div>
                
                {event.createdAt && (
                  <>
                    <div className="pt-4 border-t border-white/5">
                      <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Intelligence Filed</span>
                      <div className="text-gray-500 text-[10px] font-bold">
                        {event.createdAt.toDate().toLocaleString()}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Active Personnel</span>
                        <div className="text-(--accent) font-black italic text-lg tracking-tighter">
                          {event.playerCount || 0} Registered
                        </div>
                      </div>
                      <Users size={18} className="text-gray-700" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="portal-card">
              <div className="portal-header flex items-center gap-2">
                <MapPin size={14} /> Operation Area
              </div>
              <div className="p-6">
                <div className="text-white font-black uppercase italic text-lg tracking-tight">
                  {event.location || "Location Confidential"}
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">San Andreas District</p>
              </div>
            </div>

            {event.prize && (
              <div className="portal-card border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.05)]">
                <div className="portal-header bg-emerald-500/5 text-emerald-400 flex items-center gap-2">
                  <Trophy size={14} /> Reward Pool
                </div>
                <div className="p-6">
                  <div className="text-emerald-400 font-black italic text-2xl tracking-tighter drop-shadow-sm">
                    {event.prize}
                  </div>
                  <p className="text-[9px] text-gray-600 font-black uppercase mt-1 tracking-widest">Authorized Compensation</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
