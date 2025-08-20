import React, { useEffect, useState } from "react";
import type { DevicesMap } from "./api/types";
import { fetchCurrentDevices, connectWebSocket } from "./api/devices";
import { DeviceTable } from "./components/DeviceTable";

const App: React.FC = () => {
  const [devices, setDevices] = useState<DevicesMap>({});
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch initial devices
  useEffect(() => {
    fetchCurrentDevices()
      .then(setDevices)
      .catch(console.error);
  }, []);

  // Connect WebSocket
  const handleConnect = () => {
    if (ws) return;
    const socket = connectWebSocket(setDevices);
    setWs(socket);
  };

  const handleDisconnect = () => {
    ws?.close();
    setWs(null);
  };

  // Power control (dummy for now)
  const handleSetPower = (name: string, watts: number) => {
    console.log(`Set ${name} to ${watts} W`);
    // TODO: call backend /power endpoint
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Device Dashboard</h1>
      <div className="mb-4">
        {!ws ? (
          <button
            onClick={handleConnect}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Connect WebSocket
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        )}
      </div>
      <DeviceTable devices={devices} onSetPower={handleSetPower} />
    </div>
  );
};

export default App;
