# backend/devices/manager.py
import asyncio
import yaml
from pathlib import Path
from devices.registry import DEVICE_REGISTRY


class DeviceManager:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(DeviceManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "devices"):
            self.devices = []
            self.subscribers = []
            self._started = False

    def load_from_config(self, path="devices.yaml"):
        cfg = yaml.safe_load(Path(path).read_text())

        for dev_cfg in cfg.get("devices", []):
            cls_name = dev_cfg.get("type")
            print(f"Loading device type: {cls_name}")
            if not cls_name:
                raise ValueError("Device entry missing 'type' field")

            cls = DEVICE_REGISTRY.get(cls_name)
            print(f"Found device class: {cls_name} -> {cls}")
            if not cls:
                raise ValueError(f"Unknown device type '{cls_name}'")

            name = dev_cfg.get("name")
            print(f"Device name: {name}")
            # Ensure name is always a string
            if not name:
                raise ValueError(
                    f"Device entry for '{cls_name}' missing 'name' field")

            # Ensure mock is always a proper bool
            raw_mock = dev_cfg.get("mock", False)
            print(f"Device mock flag: {raw_mock}")
            if isinstance(raw_mock, str):
                # convert 'true'/'false' strings to bool
                mock_flag = raw_mock.lower() == "true"
            else:
                mock_flag = bool(raw_mock)

            instance = cls(name=name, mock=mock_flag)
            self.register(instance)

    def register(self, device):
        device.on_update(self.broadcast)
        self.devices.append(device)

    def subscribe(self, ws):
        self.subscribers.append(ws)

    def unsubscribe(self, ws):
        if ws in self.subscribers:
            self.subscribers.remove(ws)

    def broadcast(self, data: dict):
        dead = []
        for ws in self.subscribers:
            try:
                asyncio.create_task(ws.send_json(data))
            except Exception:
                dead.append(ws)
        for d in dead:
            self.unsubscribe(d)

    async def start(self):
        if self._started:
            return
        for device in self.devices:
            await device.connect()
            asyncio.create_task(device.run())
        self._started = True

    async def stop(self):
        if not self._started:
            return
        for device in self.devices:
            await device.disconnect()
        self._started = False
