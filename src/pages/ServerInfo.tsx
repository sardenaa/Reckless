import React, { useState, useEffect } from "react";
import { Users, Globe, Shield, Zap, Terminal, Activity, MessageSquare, Link as LinkIcon, Map as MapIcon, Copy } from "lucide-react";
import { clsx } from "clsx";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useToast } from "../components/Toast";

// Fix Leaflet marker icon issue
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { BRANDING } from "../constants";

const socket = io();

export default function ServerInfo() {
  const [status, setStatus] = useState<any>(null);
  const [serverList, setServerList] = useState<any[]>([]);
  const [playerMarkers, setPlayerMarkers] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/server-status")
        .then(res => res.json())
        .then(data => setStatus(data))
        .catch(err => console.error("Poll error:", err));

      fetch("/api/servers")
        .then(res => res.json())
        .then(data => setServerList(data))
        .catch(err => console.error("Server list error:", err));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Polling every 15s for the browser list

    socket.on("server_stats", (stats) => {
      setStatus((prev: any) => ({ ...prev, ...stats }));
    });

    socket.on("player_locations", (locations) => {
      setPlayerMarkers(locations);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "server"), (doc) => {
      if (doc.exists()) {
        setMaintenance(!!doc.data().maintenanceMode);
      }
    });

    return () => {
      clearInterval(interval);
      socket.off("server_stats");
      socket.off("player_locations");
      unsubSettings();
    };
  }, []);

  const copyIp = () => {
    navigator.clipboard.writeText(status?.ip || `${BRANDING.IP}:${BRANDING.PORT}`);
    toast("info", "IP Copied", "Server IP copied to clipboard!");
  };

  const handleConnect = () => {
    setIsConnecting(true);
    toast("info", "Connecting to Server", "Opening GTA: San Andreas...");
    setTimeout(() => {
      setIsConnecting(false);
      toast("success", "Connected!", "Game started. Have fun!");
    }, 2500);
  };

  const handleLinkDiscord = () => {
    setIsLinking(true);
    toast("info", "Discord Login", "Sending you to Discord...");
    setTimeout(() => {
      setIsLinking(false);
      toast("success", "Account Linked", "Your Discord account is now connected.");
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="text-(--accent)" size={20} />
        <h1 className="text-xl font-black uppercase tracking-tighter italic text-white drop-shadow-[0_0_10px_rgba(242,125,38,0.3)]">
          Server Status
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="portal-card group">
            <div className="portal-header">How to Join</div>
            <div className="p-6 md:p-8 bg-black/20 flex flex-col items-center gap-6 text-center overflow-hidden relative">
              {/* Animated background lines */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,#f27d26_50%,transparent_100%)] h-[1px] w-full animate-[scan_3s_linear_infinite]" />
              </div>

              <div className="w-16 h-16 md:w-20 md:h-20 bg-(--accent)/10 border-2 border-(--accent)/20 rounded-full flex items-center justify-center relative z-10">
                <Terminal className="text-(--accent) group-hover:scale-110 transition-transform" size={28} />
              </div>
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="flex items-center justify-center gap-3 mb-1 flex-wrap">
                  <div className={clsx(
                    "w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]",
                    maintenance ? "text-yellow-500 bg-yellow-500" : (status?.online ? "text-emerald-400 bg-emerald-400 animate-pulse" : "text-red-500 bg-red-500")
                  )} />
                  <h2 className="text-xl md:text-2xl font-black font-mono tracking-wider text-white break-all">{status?.ip || `${BRANDING.IP}:${BRANDING.PORT}`}</h2>
                  <button 
                    onClick={copyIp}
                    className="p-1.5 bg-white/10 border border-white/20 text-white hover:bg-(--accent) hover:border-(--accent) transition-all rounded-sm group/copy"
                    title="Copy IP Address"
                  >
                    <Copy size={14} className="group-hover/copy:scale-110 transition-transform" />
                  </button>
                </div>
                <p className="text-[10px] md:text-xs text-(--text-secondary) font-bold uppercase tracking-widest">Official SA-MP Server IP</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 bg-(--accent) text-white py-3 font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all shadow-[0_0_20px_rgba(242,125,38,0.2)] disabled:opacity-50"
                >
                  {isConnecting ? "Connecting..." : "Quick Connect"}
                </button>
                <button 
                  onClick={copyIp}
                  className="flex-1 bg-white/5 border border-white/10 text-white py-3 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
                >
                  Copy IP
                </button>
              </div>
            </div>
          </div>

          <div className="portal-card bg-(--accent)/5 border-(--accent)/30">
            <div className="p-6 flex flex-col gap-4 text-center">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">Community Guidelines</h3>
              <p className="text-xs text-gray-400 font-medium">To ensure a high-quality roleplay experience, all citizens must adhere to our legal code and community standards.</p>
              <a href="/server/rules" className="bg-white text-black py-3 font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <Shield size={14} /> Server Rules
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="portal-card flex-1">
            <div className="portal-header flex items-center gap-2">
               <Activity size={10} className="animate-pulse text-emerald-500" /> Server Stats
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Metric 
                icon={<Activity size={16} />} 
                label="Status" 
                value={maintenance ? "Maintenance" : (status?.online ? "Online" : "Connecting...")} 
                color={maintenance ? "text-yellow-500" : (status?.online ? "text-emerald-400" : "text-red-500")} 
              />
              <Metric icon={<Users size={16} />} label="Players" value={`${status?.players ?? 0} / ${status?.maxPlayers ?? 500}`} />
              <Metric icon={<Shield size={16} />} label="Mode" value={status?.mode || `${BRANDING.NAME} v2.0`} />
              <Metric icon={<MapIcon size={16} />} label="Map" value={status?.map || "San Andreas"} />
              <Metric icon={<Zap size={16} />} label="Ping" value="~32ms" />
              <Metric icon={<Terminal size={16} />} label="Version" value="0.3.7-R2" />
            </div>
          </div>

          <div className="portal-card">
            <div className="portal-header">Discord Integration (Bot)</div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5865F2]/10 rounded flex items-center justify-center border border-[#5865F2]/20">
                   <MessageSquare className="text-[#5865F2]" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Bot Status: Active</h4>
                  <p className="text-[9px] text-(--text-secondary) font-bold uppercase">Linked to #community-announcements</p>
                </div>
              </div>
              <div className="bg-black/20 border border-(--border-color) p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-300">
                   <LinkIcon size={12} className="text-(--accent)" /> Account Linking
                </div>
                <button 
                  onClick={handleLinkDiscord}
                  disabled={isLinking}
                  className="bg-[#5865F2] text-white px-3 py-1 text-[9px] font-black uppercase rounded shadow-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isLinking ? "Linking..." : "Link Discord"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-card shadow-2xl overflow-hidden">
        <div className="portal-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-(--accent)" /> Other Communities
          </div>
          <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">{serverList.length} SERVERS FOUND</span>
        </div>
        <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-(--accent)/20 scrollbar-track-transparent">
          <table className="vbulletin-table min-w-[800px] lg:min-w-full">
            <thead>
              <tr className="bg-black/40">
                <th className="w-12 text-center"></th>
                <th className="text-left font-display tracking-widest text-[10px] uppercase py-4 px-4">Server Name</th>
                <th className="text-center font-display tracking-widest text-[10px] uppercase w-32">Status</th>
                <th className="text-center font-display tracking-widest text-[10px] uppercase w-32">Players</th>
                <th className="text-center font-display tracking-widest text-[10px] uppercase w-48">Mode / Map</th>
                <th className="text-right font-display tracking-widest text-[10px] uppercase w-40 pr-8">Join</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {serverList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-gray-500 font-black uppercase tracking-[0.2em]">Finding more servers...</td>
                </tr>
              ) : serverList.map((srv) => (
                <tr key={srv.id} className="hover:bg-(--accent)/5 transition-all group border-b border-white/5 last:border-0 h-16">
                  <td className="text-center px-2">
                    <div className={clsx(
                      "w-2 h-2 mx-auto rounded-full",
                      srv.online ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500"
                    )} />
                  </td>
                  <td className="px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic tracking-tight text-white group-hover:text-(--accent) transition-colors truncate max-w-[200px]">{srv.name}</span>
                      <span className="text-[10px] font-mono text-gray-500">{srv.host}:{srv.port}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={clsx(
                      "text-[9px] font-black uppercase border px-2 py-1",
                      srv.online ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"
                    )}>
                      {srv.online ? "Active" : "Offline"}
                    </span>
                  </td>
                  <td className="text-center font-mono text-xs font-bold">
                    <span className="text-white">{srv.players}</span>
                    <span className="text-gray-600"> / {srv.maxPlayers}</span>
                  </td>
                  <td className="text-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-300 truncate max-w-[150px] mx-auto">{srv.gamemode}</span>
                      <span className="text-[8px] font-bold uppercase text-gray-600 tracking-widest">{srv.mapname}</span>
                    </div>
                  </td>
                  <td className="text-right pr-6">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${srv.host}:${srv.port}`);
                        toast("info", "IP Copied", `Server IP copied to clipboard.`);
                        handleConnect();
                      }}
                      disabled={!srv.online}
                      className="bg-white/5 border border-white/10 text-white px-4 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-(--accent) hover:border-(--accent) hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2 ml-auto"
                    >
                      <Zap size={10} /> Join
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="md:hidden flex flex-col divide-y divide-white/5">
          {serverList.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-black uppercase tracking-[0.2em]">Finding more servers...</div>
          ) : serverList.map((srv) => (
            <div key={srv.id} className="p-5 flex flex-col gap-4 bg-black/10 hover:bg-(--accent)/5 transition-colors group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    srv.online ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500"
                  )} />
                  <div className="flex flex-col">
                    <span className="text-sm font-black italic text-white uppercase tracking-tight group-hover:text-(--accent) transition-colors">{srv.name}</span>
                    <span className="text-[10px] font-mono text-gray-500">{srv.host}:{srv.port}</span>
                  </div>
                </div>
                <span className={clsx(
                  "text-[8px] font-black uppercase border px-2 py-0.5",
                  srv.online ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" : "border-red-500/30 text-red-500 bg-red-500/10"
                )}>
                  {srv.online ? "Online" : "Offline"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-black/20 p-2 border border-white/5">
                    <span className="text-[8px] text-gray-500 font-black uppercase block mb-0.5">Players</span>
                    <span className="text-xs font-mono font-bold text-white">{srv.players} / {srv.maxPlayers}</span>
                 </div>
                 <div className="bg-black/20 p-2 border border-white/5">
                    <span className="text-[8px] text-gray-500 font-black uppercase block mb-0.5">Gamemode</span>
                    <span className="text-xs font-bold text-white truncate">{srv.gamemode}</span>
                 </div>
              </div>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${srv.host}:${srv.port}`);
                  toast("info", "IP Copied", `Server IP copied to clipboard.`);
                  handleConnect();
                }}
                disabled={!srv.online}
                className="w-full bg-white/5 border border-white/10 text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-(--accent) hover:border-(--accent) transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                <Zap size={12} /> Join
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="portal-card shadow-2xl">
        <div className="portal-header">Discord Community</div>
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-(--border-color)">
          <div className="flex-1 p-8 bg-black/20 text-center flex flex-col gap-4">
            <div className="text-3xl font-black text-[#5865F2]">1,204 MEMBERS</div>
            <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest">Active & Growing Community</p>
            <a 
              href={BRANDING.DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-[#5865F2] text-white py-3 font-black uppercase text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              Join Discord Server
            </a>
          </div>
          <div className="w-full md:w-64 bg-black/40 p-4">
            <h4 className="text-[10px] font-black uppercase mb-3 opacity-50">Online Helpers</h4>
            <div className="flex flex-col gap-2">
              <DiscordUser name="Snake" status="Admin" />
              <DiscordUser name="DevTeam" status="Developer" />
              <DiscordUser name="Officer_Bob" status="Moderator" />
              <DiscordUser name="Support_01" status="Support" />
            </div>
          </div>
        </div>
      </div>

      <div className="portal-card shadow-2xl">
        <div className="portal-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapIcon size={12} /> Live Map
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-widest">Live Updates</span>
          </div>
        </div>
        <div className="h-[350px] md:h-[500px] relative bg-(--bg-color) border-b border-(--border-color)">
          <MapContainer 
            center={[34.0522, -118.2437]} 
            zoom={12} 
            scrollWheelZoom={false}
            className="h-full w-full z-10"
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {playerMarkers.map(p => (
              <Marker key={p.id} position={[p.lat, p.lng]}>
                <Popup>
                  <div className="font-sans text-xs p-1">
                    <div className="font-black uppercase text-(--accent) text-sm mb-1">{p.name}</div>
                    <div className="text-(--text-secondary) font-bold">ID: <span className="text-(--text-primary)">{p.id}</span></div>
                    <div className="text-(--text-secondary) font-bold">POS: <span className="text-(--text-primary)">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span></div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend/Overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/80 border border-white/10 p-3 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-tighter text-(--accent)">Area: Los Santos</div>
              <div className="text-xl font-black italic text-white tracking-widest">LIVE MAP</div>
            </div>
            <div className="bg-black/80 border border-white/10 p-3 backdrop-blur-md">
              <div className="text-[8px] font-bold uppercase text-gray-500 mb-1">Players Online</div>
              <div className="text-lg font-mono text-emerald-400">{playerMarkers.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, color }: any) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-(--text-secondary)">
        {icon} {label}
      </div>
      <div className={`text-sm font-black font-mono tracking-tighter ${color || "text-white"}`}>{value}</div>
    </div>
  );
}

function DiscordUser({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="text-[10px] font-bold truncate">{name}</span>
      <span className="text-[8px] opacity-30 italic ml-auto">{status}</span>
    </div>
  );
}
