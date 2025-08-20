import asyncio
import random
from bleak import BleakClient, BleakScanner

from devices.registry import register_device
from .base_device import BaseDevice


# Standard GATT Heart Rate Service UUID
HR_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb"
HR_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb"


@register_device
class HRDevice(BaseDevice):
    """
    Heart Rate Device class that extends BaseDevice.
    This class is responsible for handling heart rate specific functionalities.
    """

    def __init__(self, name: str, mock: bool = True):
        super().__init__(name, mock)
        print(f"Initializing HRDevice: {name}, Mock: {mock}")
        self.client = None

    async def connect(self):
        if self.mock:
            print(f"[Mock] Connecting to {self.name}")
            self.connected = True
            return

        print(f"Looking for HR device: {self.name}")
        devices = await BleakScanner.discover()
        for id, device in enumerate(devices):
            print(f"Found device: {device.name}")
            if device.name and self.name.lower() in device.name.lower():
                found_device = True
                print(f"Found HR device: {device.name}")
                break
        if found_device is None:
            raise RuntimeError(f"Device {self.name} not found.")

        self.client = BleakClient(device.address)
        await self.client.connect()
        self.connected = True

        async def _hr_handler(_, data: bytearray):
            hr_value = data[1]
            self.update({"type": "hr", "hr": hr_value, "name": device.name})

        await self.client.start_notify(HR_CHARACTERISTIC, _hr_handler)
        print(f"Connected to {device.name}")

    async def disconnect(self):
        if self.client and self.client.is_connected:
            await self.client.disconnect()
        self.connected = False
        print(f"Disconnected from {self.name}")

    async def run(self):
        if self.mock:
            print("[Mock] Running HR device simulation.")
            while self.connected:
                await asyncio.sleep(1)
                self.update({"type": "hr", "hr": 60 +
                            random.randint(-5, 5), "name": self.name})
        else:
            print(f"Running HR device: {self.name}")
            while self.connected:
                await asyncio.sleep(1)
