import { createServer } from "node:http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import { REALTIME } from "@dvb/config";

/**
 * M0 realtime server bootstrap.
 *
 * Boots the Colyseus server with a single HTTP health endpoint. NO game rooms
 * are registered yet — the authoritative BirthdayRoom (presence, movement,
 * chat, cake) lands in M3. This file only proves the server app starts.
 */

const port = Number(process.env.PORT) || 2567;

const app = express();

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "dvb-realtime",
    maxGuestsPerInstance: REALTIME.maxGuestsPerInstance,
  });
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server: createServer(app) }),
});

// gameServer.define("birthday_room", BirthdayRoom) — registered in M3.

gameServer.listen(port);
console.log(`[dvb-server] listening on ws://localhost:${port} (health: http://localhost:${port}/health)`);
