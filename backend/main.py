import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from devices.manager import DeviceManager
from devices.hr_device import HRDevice
from devices.kickr_snap_device import KickrSnapDevice

# hr = HRDevice(name="HeartRateMonitor", mock=True)
# kickr_snap = KickrSnapDevice(name="KickrSnap", mock=True)

manager = DeviceManager()
manager.load_from_config("devices.yaml")  # Auto-load all devices


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await manager.start()
    yield
    # Shutdown
    await manager.stop()

app = FastAPI(lifespan=lifespan)


# Allow frontend dev server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    manager.subscribe(ws)
    try:
        while True:
            data = await ws.receive_json()
            if data.get("action") == "set_power":
                # set resistance for all devices that support it
                for dev in manager.devices:
                    if hasattr(dev, "set_resistance"):
                        await dev.set_resistance(data["watts"])
    except Exception:
        manager.unsubscribe(ws)


# HTTP endpoint to check current HR and power
@app.get("/current")
async def current_values():
    result = {}
    for dev in manager.devices:
        if dev.latest_data:
            result[dev.name] = dev.latest_data
    return result
