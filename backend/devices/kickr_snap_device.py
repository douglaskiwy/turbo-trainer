import asyncio
import random
from bleak import BleakClient, BleakScanner

from devices.registry import register_device
from .base_device import BaseDevice

# Standard FTMS UUIDs
FTMS_SERVICE = "00001826-0000-1000-8000-00805f9b34fb"
# cycling power measurement
FTMS_CHARACTERISTIC_POWER = "00002a63-0000-1000-8000-00805f9b34fb"
FTMS_CHARACTERISTIC_CONTROL = "00002ad9-0000-1000-8000-00805f9b34fb"  # control point


@register_device
class KickrSnapDevice(BaseDevice):
    def __init__(self, name: str, mock: bool = True):
        super().__init__(name, mock)
        self.client = None
        self.resistance = 150

    async def connect(self):
        if self.mock:
            print(f"[Mock] Connecting to {self.name}")
            self.connected = True
            return

        print(f"Looking for Kickr Snap device: {self.name}")
        devices = await BleakScanner.discover()

        for id, device in enumerate(devices):
            print(f"Found device: {device.name}")
            if device.name and self.name.lower() in device.name.lower():
                found_device = True
                print(f"Found KICKR device: {device.name}")
                break
        if found_device is None:
            raise RuntimeError(f"Device {self.name} not found.")

        print(f"Connecting to device: {device.name} {device.address}")
        self.client = BleakClient(device.address)
        await self.client.connect(timeout=20)
        self.connected = True

        async def power_handler(_, data: bytearray):
            watts = int.from_bytes(data[2:4], byteorder='little')
            self.update({"type": "power", "watts": watts, "name": device.name})

        await self.client.start_notify(FTMS_CHARACTERISTIC_POWER, power_handler)
        print(f"Connected to Kickr {self.name}")

    async def disconnect(self):
        if self.client and self.client.is_connected:
            await self.client.disconnect()
        self.connected = False
        print(f"Disconnected from {self.name}")

    async def set_resistance(self, watts: int):
        self.resistance = watts
        if self.mock:
            print(f"[Mock] Setting resistance to {watts} watts")
        else:
            # Kickr expects FTMS Control Point commands (opcodes)
            # Simplified example: set target power
            # opcode 0x05 = set target power
            data = bytearray([0x05]) + watts.to_bytes(2, byteorder="little")
            await self.client.write_gatt_char(FTMS_CHARACTERISTIC_CONTROL, data, response=True)

    async def run(self):
        if self.mock:
            while self.connected:
                power = 200
                self.update(
                    {"type": "power", "watts": power + random.randint(-50, 50), "name": self.name})
                await asyncio.sleep(1)
        else:
            while self.connected:
                await asyncio.sleep(1)
