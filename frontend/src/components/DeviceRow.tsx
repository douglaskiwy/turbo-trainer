import React, { useState } from "react";
import type { Device } from "../api/types";

interface Props {
  device: Device;
  onSetPower?: (watts: number) => void;
}

export const DeviceRow: React.FC<Props> = ({ device, onSetPower }) => {
  const [powerInput, setPowerInput] = useState<number>(
    device.type === "power" ? device.watts : 0
  );

  return (
    <tr>
      <td>{device.type === "hr" ? "Heart Rate" : "Power"}</td>
      <td>{device.type === "hr" ? `${device.hr} bpm` : `${device.watts} W`}</td>
      {device.type === "power" && onSetPower && (
        <td>
          <input
            type="number"
            value={powerInput}
            onChange={(e) => setPowerInput(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          />
          <button
            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            onClick={() => onSetPower(powerInput)}
          >
            Set
          </button>
        </td>
      )}
    </tr>
  );
};
