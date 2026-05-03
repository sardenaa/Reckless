import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Trophy, ChevronRight, Zap, ListFilter, Users } from "lucide-react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";

import Countdown from "../components/Countdown";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "active" | "all" | "scheduled" | "completed" | "cancelled">("upcoming");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startTime", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qCat = query(collection(db, "event_categories"), orderBy("name", "asc"));
    const unsubCat = onSnapshot(qCat, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsub(); unsubCat(); };
  }, []);

  const eventTypes = ["All", "TDM", "Hunger Games", "Race", "Derby", "Roleplay", "Other", ...categories.map(c => c.name)];

  const now = new Date();
  const filteredEvents = events.filter(ev => {
    const startTime = new Date(ev.startTime);
    const matchesTime = filter === "all" || 
                       (filter === "upcoming" ? startTime >= now : 
                        filter === "past" ? startTime < now : 
                        filter === "active" ? ev.status === "active" :
                        ev.status === filter);
    const matchesType = typeFilter === "All" || ev.type === typeFilter;
    return matchesTime && matchesType;
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-4 h-16 bg-(--accent) transform -rotate-12" />
             <div className="flex flex-col">
               <h1 className="text-4xl sm:text-6xl font-display italic font-normal uppercase tracking-tight text-white leading-none">SERVER EVENTS</h1>
               <span className="text-xs sm:text-sm font-marker text-(--accent) -rotate-1 ml-1 sm:ml-2">Join upcoming events</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest px-1">Event Time</span>
            <div className="flex flex-wrap gap-1 p-1 bg-black/40 border border-white/5 h-fit">
              <FilterButton active={filter === "upcoming"} onClick={() => setFilter("upcoming")} label="Upcoming" />
              <FilterButton active={filter === "active"} onClick={() => setFilter("active")} label="Live Now" />
              <FilterButton active={filter === "past"} onClick={() => setFilter("past")} label="Past Events" />
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Everything" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest px-1">Event Type</span>
            <div className="relative">
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-black/40 border border-white/5 pl-8 pr-12 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-(--accent) transition-colors appearance-none"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-(--accent) border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <Calendar size={48} />
                  <span className="text-sm font-black uppercase tracking-[0.3em]">No events found {filter !== "all" ? `in ${filter}` : ""} section.</span>
                </div>
              </motion.div>
            ) : filteredEvents.map((ev, index) => (
              <EventCard key={ev.id} event={ev} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "px-3 sm:px-4 md:px-8 py-2 md:py-4 text-xs sm:text-sm md:text-xl font-display uppercase tracking-widest transition-all relative overflow-hidden group italic transform -skew-x-12",
        active 
          ? "bg-white text-black" 
          : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <span className="relative z-10 inline-block skew-x-12">{label}</span>
    </button>
  );
}

function EventCard({ event, index }: any) {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const isExpired = startTime < now && event.status !== "active";
  const status = event.status || (isExpired ? "completed" : "scheduled");
  
  const isActive = status === 'active';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className={clsx(
        "portal-card group relative overflow-hidden transition-all duration-500 cursor-pointer bg-black/60",
        status === 'completed' && "opacity-80 border-emerald-500/20",
        isActive && "border-(--accent) shadow-[0_0_40px_rgba(242,125,38,0.1)]",
        (!isActive) && "hover:border-(--accent)/50"
      )}
    >
      <Link to={`/events/${event.id}`}>
        <div className="absolute top-0 right-0 p-4 z-30">
           {isActive ? (
             <div className="bg-(--accent) text-black px-4 py-1 font-display italic text-lg animate-pulse -rotate-3">LIVE NOW</div>
           ) : status === 'completed' ? (
             <div className="bg-emerald-500 text-black px-4 py-1 font-display italic text-lg -rotate-3">FINISHED</div>
           ) : status === 'cancelled' ? (
             <div className="bg-red-600 text-white px-4 py-1 font-display italic text-lg -rotate-3">CANCELLED</div>
           ) : (
             <div className="bg-white text-black px-4 py-1 font-display italic text-lg -rotate-3">UPCOMING</div>
           )}
        </div>

        {/* Banner Section */}
        <div className="h-32 sm:h-40 w-full relative overflow-hidden bg-black/20">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
              <Calendar size={64} className="group-hover:scale-110 transition-transform duration-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
          
          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="absolute bottom-4 left-6 flex flex-wrap gap-1.5 z-20">
              {event.tags.map((tag: string, i: number) => (
                <span key={i} className="text-[7px] font-black uppercase tracking-widest bg-(--accent)/20 border border-(--accent)/40 text-(--accent) px-1.5 py-0.5 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-display italic font-normal uppercase leading-none group-hover:text-(--accent) transition-colors text-white truncate">{event.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-marker text-(--accent-secondary) opacity-80">{event.type}</span>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <Countdown targetDate={event.startTime} className="text-[10px]" showLabels={false} />
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 relative group-hover:bg-white/[0.02] transition-all">
             <p className="text-xs text-gray-400 italic leading-relaxed uppercase tracking-tight line-clamp-2">
              {event.description || "Join the event to see what's happening!"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-5 border-b border-white/10">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">DATE</span>
                <span className="text-base font-display italic text-white truncate">{new Date(event.startTime).toLocaleDateString()}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">LOCATION</span>
                <span className="text-base font-display italic text-(--accent-secondary) truncate">{event.location || "LOS SANTOS"}</span>
             </div>
          </div>

          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-(--accent) flex items-center justify-center text-black font-display text-lg -rotate-6">
                   {event.playerCount || "0"}
                </div>
                <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">PERSONNEL</span>
             </div>
             <div className="gta-button py-2 px-4 text-sm group-hover:scale-105">
                <span>View Details</span>
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EventMeta({ icon, label, value, color }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className={clsx("mt-0.5", color || "text-gray-500")}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase text-gray-700 tracking-widest">{label}</span>
        <span className={clsx("text-[10px] font-bold", color || "text-gray-300")}>{value}</span>
      </div>
    </div>
  );
}
