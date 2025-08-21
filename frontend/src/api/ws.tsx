import { useRef, useState } from "react";
import type { RoutePoint } from "./uploadRoute";


interface WsProps {
  onNextPoint: (point: RoutePoint, distance: number, speed: number) => void;
}

export default function Ws({ onNextPoint }: WsProps) {
    const [hr, setHr] = useState(0);
    const [power, setPower] = useState(0);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    const handleToggle = () => {
        if (connected) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
                setHr(0);
                setPower(0);
            }
            setConnected(false);
        } else {
            connectWS();
        }
    }

    const connectWS = () => {
        const ws = new WebSocket("ws://127.0.0.1:8000/ws");
        wsRef.current = ws;

        ws.onopen = () :void => {
            console.log("WebSocket connection established");
            setConnected(true);
        }

        ws.onmessage = (event) :void => {
            try {
                const msg = JSON.parse(event.data);
                // console.log("Received WebSocket message:", msg);
                if (msg.type === "hr") {
                    setHr(msg.hr);
                } else if (msg.type === "power") {
                    setPower(msg.watts);
                } else if (msg.type === "next_point") {
                    onNextPoint(msg.point, msg.distance, msg.speed);
                }
            }
            catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        }

        ws.onerror = (error) :void => {
            console.error("WebSocket error:", error);
        }

        ws.onclose = () :void => {
            console.log("WebSocket connection closed");
            setConnected(false);
        }
    }  
    return (
        <div>
            <button onClick={handleToggle} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                {connected ? "Disconnect Websocket" : "Connect WebSocket"}
            </button>
            <div className="mt-4">
                <h2 className="text-xl font-semibold">Heart Rate: {hr} bpm</h2>
                <h2 className="text-xl font-semibold">Power: {power} W</h2>
                <h2 className="text-xl font-semibold">Connected: {connected ? "Yes" : "No"}</h2>
            </div>
        </div>
    );
}
