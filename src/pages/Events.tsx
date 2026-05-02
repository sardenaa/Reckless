import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Trophy, ChevronRight, Zap, ListFilter, Users } from "lucide-react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";

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
                className="bg-black/40 border border-white/5 pl-8 pr-12 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-pink-500 transition-colors appearance-none"
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
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
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
  
  // Logic for "Upcoming within 24 hours"
  const isImminent = !isExpired && status !== 'cancelled' && (startTime.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;
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
        <div className="absolute top-0 right-0 p-4 z-20">
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

        <div className="p-6 md:p-8 flex flex-col gap-6 pt-16">
          <div>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-display italic font-normal uppercase mb-2 leading-none group-hover:text-(--accent) transition-colors text-white">{event.title}</h3>
            <span className="text-[10px] sm:text-sm font-marker text-(--accent-secondary) opacity-80">{event.type}</span>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 md:p-6 relative group-hover:bg-white/[0.02] transition-all">
             <p className="text-xs md:text-sm text-gray-400 italic leading-relaxed uppercase tracking-tight line-clamp-3">
              {event.description || "Join the event to see what's happening!"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 pb-6 border-b border-white/10">
             <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">DATE</span>
                <span className="text-lg md:text-xl font-display italic text-white">{new Date(event.startTime).toLocaleDateString()}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">LOCATION</span>
                <span className="text-lg md:text-xl font-display italic text-(--accent-secondary)">{event.location || "LOS SANTOS"}</span>
             </div>
          </div>

          <div className="flex justify-between items-center group">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-(--accent) flex items-center justify-center text-black font-display text-xl -rotate-6">
                   {event.playerCount || "0"}
                </div>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">PLAYERS JOINED</span>
             </div>
             <div className="gta-button py-2 px-6 text-base group-hover:scale-110">
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
