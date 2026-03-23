const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");
const { AlertService } = require("../services/alertService");
const { ReadingService } = require("../services/readingService");

class WSServer {
  constructor(httpServer) {
    this.wss = new WebSocketServer({ server: httpServer, path: "/ws" });
    this.clients = new Map(); // ws -> { userId, role, subscriptions }
    this._init();
  }

  _init() {
    this.wss.on("connection", (ws, req) => {
      console.log(`WS client connected`);

      // Store client with default guest access
      this.clients.set(ws, { userId: null, role: "VIEWER", subscriptions: new Set(["ALL"]) });

      ws.on("message", (data) => this._handleMessage(ws, data));
      ws.on("close", () => {
        this.clients.delete(ws);
        console.log("WS client disconnected");
      });
      ws.on("error", (err) => console.error("WS error:", err.message));

      // Send welcome and current state
      this._sendInitialState(ws);
    });
  }

  async _sendInitialState(ws) {
    try {
      const [stats, alerts] = await Promise.all([
        ReadingService.getSystemStats(),
        AlertService.getActive(),
      ]);

      this._send(ws, { type: "INITIAL_STATE", payload: { stats, alerts } });
    } catch (err) {
      console.error("Initial state error:", err.message);
    }
  }

  _handleMessage(ws, data) {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case "AUTH":
          this._handleAuth(ws, msg.token);
          break;
        case "SUBSCRIBE":
          const client = this.clients.get(ws);
          if (client) client.subscriptions.add(msg.channel);
          break;
        case "UNSUBSCRIBE":
          const c = this.clients.get(ws);
          if (c) c.subscriptions.delete(msg.channel);
          break;
        case "PING":
          this._send(ws, { type: "PONG", timestamp: new Date().toISOString() });
          break;
      }
    } catch (err) {
      this._send(ws, { type: "ERROR", message: "Invalid message format" });
    }
  }

  _handleAuth(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const client = this.clients.get(ws);
      if (client) {
        client.userId = decoded.sub;
        client.role = decoded.role;
      }
      this._send(ws, { type: "AUTH_SUCCESS", userId: decoded.sub, role: decoded.role });
    } catch {
      this._send(ws, { type: "AUTH_ERROR", message: "Invalid token" });
    }
  }

  broadcast(message, channel = "ALL") {
    const data = JSON.stringify(message);
    let sent = 0;
    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN &&
          (client.subscriptions.has("ALL") || client.subscriptions.has(channel))) {
        ws.send(data);
        sent++;
      }
    });
    return sent;
  }

  broadcastAlert(alert) {
    this.broadcast({ type: "ALERT", payload: alert }, "ALERTS");
  }

  _send(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  getConnectedCount() {
    return this.clients.size;
  }
}

module.exports = { WSServer };
