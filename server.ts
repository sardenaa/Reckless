import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import query from "samp-query";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Server Status
  app.get("/api/server-status", (req, res) => {
    const options = {
      host: "51.83.49.125",
      port: 10735
    };

    query(options, (err, response) => {
      if (err) {
        console.error("SAMP Query Error:", err);
        return res.status(500).json({ 
          online: false, 
          error: "Failed to fetch server status",
          ip: "51.83.49.125:10735"
        });
      }

      res.json({
        online: true,
        hostname: response.hostname,
        players: response.players,
        maxPlayers: response.maxplayers,
        gamemode: response.gamemode,
        mapname: response.mapname,
        ip: "51.83.49.125:10735"
      });
    });
  });

  // API Route for multiple servers
  app.get("/api/servers", async (req, res) => {
    const servers = [
      { id: "main", name: "ReckLess RolePlay [MAIN]", host: "51.83.49.125", port: 10735, type: "Roleplay" },
      { id: "dev", name: "ReckLess RP [DEVELOPMENT]", host: "51.83.49.125", port: 10735, type: "Testing" }, // Using same IP for demo/realism if no dev IP
    ];

    const results = await Promise.all(servers.map(srv => {
      return new Promise((resolve) => {
        query({ host: srv.host, port: srv.port }, (err, response) => {
          if (err) {
            resolve({ ...srv, online: false, players: 0, maxPlayers: 0, gamemode: "N/A", mapname: "N/A" });
          } else {
            resolve({
              ...srv,
              online: true,
              players: response.players,
              maxPlayers: response.maxplayers,
              gamemode: response.gamemode,
              mapname: response.mapname,
              hostname: response.hostname
            });
          }
        });
      });
    }));

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
