// import { useEffect, useState, useRef } from "react";
// import { getCurrentDevices, connectWebSocket, sendWebSocket } from "../api/devices";
// import type { DeviceData } from "../api/types";

// export function useDevices() {
//   const [devices, setDevices] = useState<Record<string, DeviceData>>({});
//   const wsRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     getCurrentDevices().then(setDevices);
//     console.log("Current devices fetched:", devices.name);
//     wsRef.current = connectWebSocket((data) => {
//       setDevices((prev) => ({ ...prev, [data.name]: data }));
//     });

//     return () => wsRef.current?.close();
//   }, []);

//   const setPower = (name: string, watts: number) => {
//     if (wsRef.current) sendWebSocket(wsRef.current, { action: "set_power", watts, name });
//   };

//   return { devices, setPower };
// }
