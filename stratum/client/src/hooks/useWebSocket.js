import { useEffect, useRef, useCallback, useState } from "react";
import useAuthStore from "../store/authStore";

const WS_URL = import.meta.env.VITE_WS_URL;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export const useWebSocket = (onMessage) => {
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log("⚡ WebSocket connected");
        setConnected(true);
        reconnectAttempts.current = 0;

        // Authenticate
        if (token) {
          ws.current.send(JSON.stringify({ type: "AUTH", token }));
        }

        // Heartbeat
        const heartbeat = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "PING" }));
          }
        }, 30000);

        ws.current._heartbeat = heartbeat;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.current.onclose = () => {
        setConnected(false);
        clearInterval(ws.current?._heartbeat);
        console.log("🔌 WebSocket disconnected");

        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          const delay = Math.min(RECONNECT_DELAY * reconnectAttempts.current, 30000);
          reconnectTimer.current = setTimeout(connect, delay);
        }
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };
    } catch (err) {
      console.error("WS connection error:", err);
    }
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearInterval(ws.current?._heartbeat);
      ws.current?.close();
    };
  }, [connect]);

  const send = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { connected, send };
};
