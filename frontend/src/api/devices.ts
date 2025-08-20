import type { DevicesMap } from "./types";

const BASE_URL = "http://127.0.0.1:8000";

export async function fetchCurrentDevices(): Promise<DevicesMap> {
  const res = await fetch(`${BASE_URL}/current`);
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
}

export function connectWebSocket(
  onMessage: (data: DevicesMap) => void
): WebSocket {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws");

  ws.onopen = () => console.log("WebSocket connected");
  ws.onmessage = (event) => {
    const data: DevicesMap = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onclose = () => console.log("WebSocket closed");
  ws.onerror = (err) => console.error("WebSocket error", err);

  return ws;
}
