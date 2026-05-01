import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // WebSocket for Live Server Stats
  let playerCount = 142;
  let maintenanceMode = false;

  // Mock player locations for the map
  const players = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    name: `Player_${i + 1}`,
    lat: 34.0522 + (Math.random() - 0.5) * 0.1,
    lng: -118.2437 + (Math.random() - 0.5) * 0.1,
  }));

  setInterval(() => {
    // Emulate organic fluctuation
    const change = Math.floor(Math.random() * 5) - 2;
    playerCount = Math.max(0, Math.min(500, playerCount + change));

    // Update player positions slightly
    players.forEach(p => {
      p.lat += (Math.random() - 0.5) * 0.001;
      p.lng += (Math.random() - 0.5) * 0.001;
    });

    io.emit("server_stats", {
      online: true,
      maintenance: maintenanceMode,
      players: playerCount,
      maxPlayers: 500,
      timestamp: new Date().toISOString()
    });

    io.emit("player_locations", players);
  }, 3000);

  io.on("connection", (socket) => {
    socket.emit("server_stats", {
      online: true,
      maintenance: maintenanceMode,
      players: playerCount,
      maxPlayers: 500,
      timestamp: new Date().toISOString()
    });
    socket.emit("player_locations", players);
  });

  // API Route: Server Status (Mocked/Proxy)
  app.get("/api/server-status", (req, res) => {
    res.json({
      online: true,
      maintenance: maintenanceMode,
      players: playerCount,
      maxPlayers: 500,
      ip: "server.recklessrp.net:7777",
      mode: "ReckLess RP v1.0",
      map: "San Andreas"
    });
  });

  // API Route: Highscores (Real-ish aggregation or mock)
  app.get("/api/highscores/:category", (req, res) => {
    const { category } = req.params;
    
    // In a real app, this would query Firestore or a SQL DB
    // For the demo, we'll return structured data that looks "server-side"
    // Highscore data map
    const highscoreMap: Record<string, any> = {
      players: [
        { rank: "#1", name: "Snake", level: 94, hours: "4,210" },
        { rank: "#2", name: "Officer_Bob", level: 82, hours: "3,850" },
        { rank: "#3", name: "Rider", level: 75, hours: "2,100" },
        { rank: "#4", name: "CJ_V2", level: 68, hours: "1,980" },
        { rank: "#5", name: "Sweet_P", level: 55, hours: "1,200" },
      ],
      money: [
        { rank: "#1", name: "Snake", bank: "$42,450,000", key: "Wealth" },
        { rank: "#2", name: "GoldDigger", bank: "$31,000,000", key: "Wealth" },
        { rank: "#3", name: "Merchant_X", bank: "$18,500,000", key: "Wealth" },
      ],
      combat: [
        { rank: "#1", name: "Assassin", kills: 14502, deaths: 421, kd: "34.4" },
        { rank: "#2", name: "Hitman_V", kills: 8210, deaths: 1205, kd: "6.8" },
      ],
      jobs: [
        { rank: "#1", name: "Trucker_Joe", job: "Trucker", exp: "2,450,000", total: "12,402" },
        { rank: "#2", name: "Saul_Goodman", job: "Lawyer", exp: "850,000", total: "1,402" },
      ],
      crime: [
        { rank: "#1", name: "El_Chapo_RP", crimes: 8421, arrests: 45, type: "Organized Crime" },
        { rank: "#2", name: "Heist_King", crimes: 5210, arrests: 120, type: "Bank Robbery" },
      ],
      social: [
        { rank: "#1", faction: "Los Santos PD", leader: "Chief_Wiggum", members: 42, wealth: "$850M" },
        { rank: "#2", faction: "Grove Street Families", leader: "Sweet", members: 28, wealth: "$120M" },
      ],
      misc: [
        { rank: "#1", detail: "Infernus", value: "421 Owned", type: "Car" },
        { rank: "#2", detail: "Skin 294", value: "14.2% Popularity", type: "Skin" },
      ]
    };

    res.json(highscoreMap[category] || []);
  });

  // API to toggle maintenance
  app.post("/api/admin/maintenance", (req, res) => {
    maintenanceMode = req.body.enabled;
    io.emit("server_stats", {
      online: true,
      maintenance: maintenanceMode,
      players: playerCount,
      maxPlayers: 500,
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, maintenanceMode });
  });

  // API Route: Sync Highscores
  app.post("/api/sync-highscores", (req, res) => {
    console.log("Starting master database sync...");
    // Artificial delay to simulate processing
    setTimeout(() => {
      console.log("Highscores synchronized with SA-MP Game Server.");
    }, 2000);
    res.json({ message: "Sync initialized", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
