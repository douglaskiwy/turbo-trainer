import React from "react";
import type { DevicesMap } from "../api/types";
import { DeviceRow } from "./DeviceRow";

interface Props {
  devices: DevicesMap;
  onSetPower?: (name: string, watts: number) => void;
}

export const DeviceTable: React.FC<Props> = ({ devices, onSetPower }) => {
  return (
    <table className="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Type</th>
          <th className="border px-4 py-2">Value</th>
          <th className="border px-4 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(devices).map(([name, device]) => (
          <DeviceRow
            key={name}
            device={device}
            onSetPower={
              device.type === "power" && onSetPower
                ? (watts) => onSetPower(name, watts)
                : undefined
            }
          />
        ))}
      </tbody>
    </table>
  );
};
