import asyncio
from typing import Optional, Callable


class BaseDevice:
    """Abstract base for all BLE devices."""

    def __init__(self, name: str, mock: bool = True):
        self.name = name
        self.mock = mock
        self.connected = False
        self.callback: Optional[Callable[[dict], None]] = None
        self.latest_data: Optional[dict] = None

    async def connect(self):
        raise NotImplementedError(
            "Connect method must be implemented by subclasses.")

    async def disconnect(self):
        raise NotImplementedError(
            "Disconnect method must be implemented by subclasses.")

    def on_update(self, callback: Callable[[dict], None]):
        """Set a callback to be called when the device updates."""
        self.callback = callback

    def update(self, data: dict):
        """Call this method to update the device state and notify subscribers."""
        self.latest_data = data
        if self.callback:
            self.callback(data)

    async def run(self):
        raise NotImplementedError(
            "Run method must be implemented by subclasses.")
