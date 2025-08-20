export type DeviceType = "hr" | "power";

export interface BaseDevice {
  type: DeviceType;
}

export interface HRDevice extends BaseDevice {
  type: "hr";
  hr: number;
}

export interface PowerDevice extends BaseDevice {
  type: "power";
  watts: number;
}

export type Device = HRDevice | PowerDevice;

export interface DevicesMap {
  [name: string]: Device;
}
