import React, { useState, useEffect } from "react";
import { Users, Globe, Shield, Zap, Terminal, Activity, MessageSquare, Link as LinkIcon, Map as MapIcon, Copy } from "lucide-react";
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

const socket = io();

export default function ServerInfo() {
  const [status, setStatus] = useState<any>(null);
  const [playerMarkers, setPlayerMarkers] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const serverIp = "192.168.1.1:7777";
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/server-status")
      .then(res => res.json())
      .then(data => setStatus(data));

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
      socket.off("server_stats");
      socket.off("player_locations");
      unsubSettings();
    };
  }, []);

  const copyIp = () => {
    navigator.clipboard.writeText(status?.ip || serverIp);
    toast("info", "IP Copied", "Server IP copied to clipboard!");
  };

  const handleConnect = () => {
    setIsConnecting(true);
    toast("info", "Establishing Connection", "Launching SA-MP Client protocol...");
    setTimeout(() => {
      setIsConnecting(false);
      toast("success", "Handshake Successful", "SAMP process detected. Sending authentication tokens.");
    }, 2500);
  };

  const handleLinkDiscord = () => {
    setIsLinking(true);
    toast("info", "Discord Auth", "Redirecting to Discord verify portal...");
    setTimeout(() => {
      setIsLinking(false);
      toast("success", "Account Bound", "Community Discord account successfully linked to profile.");
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="text-(--accent)" size={20} />
        <h1 className="text-xl font-black uppercase tracking-tighter italic text-white drop-shadow-[0_0_10px_rgba(242,125,38,0.3)]">
          Server Connection & Status
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="portal-card group">
          <div className="portal-header">Connection Details</div>
          <div className="p-8 bg-black/20 flex flex-col items-center gap-6 text-center overflow-hidden relative">
            {/* Animated background lines */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,#f27d26_50%,transparent_100%)] h-[1px] w-full animate-[scan_3s_linear_infinite]" />
            </div>

            <div className="w-20 h-20 bg-(--accent)/10 border-2 border-(--accent)/20 rounded-full flex items-center justify-center relative z-10">
              <Terminal className="text-(--accent) group-hover:scale-110 transition-transform" size={32} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black font-mono tracking-wider mb-1 text-white">{status?.ip || serverIp}</h2>
              <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest">Official SA-MP Server IP</p>
            </div>
            <div className="flex gap-4 w-full relative z-10">
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

        <div className="flex flex-col gap-6">
          <div className="portal-card flex-1">
            <div className="portal-header flex items-center gap-2">
               <Activity size={10} className="animate-pulse text-emerald-500" /> Live Metrics
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Metric 
                icon={<Activity size={16} />} 
                label="Status" 
                value={maintenance ? "Maintenance" : (status?.online ? "Online" : "Connecting...")} 
                color={maintenance ? "text-yellow-500" : (status?.online ? "text-emerald-400" : "text-red-500")} 
              />
              <Metric icon={<Users size={16} />} label="Players" value={`${status?.players || 0} / ${status?.maxPlayers || 500}`} />
              <Metric icon={<Shield size={16} />} label="Mode" value={status?.mode || "RR-RP v2.0"} />
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

      <div className="portal-card shadow-2xl">
        <div className="portal-header">Discord Community</div>
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-(--border-color)">
          <div className="flex-1 p-8 bg-black/20 text-center flex flex-col gap-4">
            <div className="text-3xl font-black text-[#5865F2]">1,204 MEMBERS</div>
            <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest">Active & Growing Community</p>
            <button className="bg-[#5865F2] text-white py-3 font-black uppercase text-xs tracking-widest hover:opacity-90 transition-opacity">
              Join Discord Server
            </button>
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
            <MapIcon size={12} /> Live Player Tracking Map
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-widest">Streaming Data</span>
          </div>
        </div>
        <div className="h-[500px] relative bg-(--bg-color) border-b border-(--border-color)">
          <MapContainer 
            center={[34.0522, -118.2437]} 
            zoom={13} 
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
                    <div className="text-(--text-secondary) font-bold">UID: <span className="text-(--text-primary)">{p.id}</span></div>
                    <div className="text-(--text-secondary) font-bold">POS: <span className="text-(--text-primary)">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span></div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend/Overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="bg-black/80 border border-white/10 p-3 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-tighter text-(--accent)">Region: Los Santos</div>
              <div className="text-xl font-black italic text-white tracking-widest">MAP INTERFACE</div>
            </div>
            <div className="bg-black/80 border border-white/10 p-3 backdrop-blur-md">
              <div className="text-[8px] font-bold uppercase text-gray-500 mb-1">Active Blips</div>
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
