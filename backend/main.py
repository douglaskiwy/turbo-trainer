import asyncio
from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from models.route_state import RouteState
from models.models import RouteUpload
from devices.manager import DeviceManager
from devices.hr_device import HRDevice
from devices.kickr_snap_device import KickrSnapDevice

route_state = RouteState()  # Store route and user state
manager = DeviceManager()  # Singleton instance to store device connections
manager.load_from_config("devices.yaml")  # Auto-load all devices


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.
    """
    await manager.start()
    yield
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
    """
    WebSocket endpoint to get current HR and power values.
    Clients can subscribe to this endpoint to receive real-time updates.
    """
    await ws.accept()
    manager.subscribe(ws)
    try:
        # set last power to avoid any calculations using 0
        last_power = 1
        while True:
            for device in manager.devices:
                if isinstance(device, KickrSnapDevice) and device.latest_data and "watts" in device.latest_data:
                    last_power = device.latest_data["watts"]
                    break
            if route_state.exists:
                route_state.update_progress(last_power, 1.0)
                next_point, speed, distance = route_state.get_next_point()
                if next_point:
                    await ws.send_json({
                        "type": "next_point",
                        "point": {
                            "lat": next_point.lat,
                            "lon": next_point.lon,
                            "ele": next_point.ele,
                        },
                        "speed": speed,  # meters per second
                        "distance": distance  # meters
                    })
                else:
                    await ws.send_json({"type": "route_complete"})
            await asyncio.sleep(1)  # Simulate processing delay
    except Exception:
        print(f"WebSocket disconnected {Exception}")
        manager.unsubscribe(ws)


# HTTP endpoint to check current HR and power
@app.get("/current")
async def current_values():
    """
    Test endpoint to get current values from all devices.
    """
    result = {}
    for dev in manager.devices:
        if dev.latest_data:
            result[dev.name] = dev.latest_data
    return result


@app.post("/route")
async def upload_route(route: RouteUpload):
    """
    Upload a route with points and weight.
    Points should be a list of dicts with 'lat', 'lon', 'ele', 'dist'.
    """
    route_state.set_route(route.points, route.weight)
    print(f"Route loaded: {len(route.points)} points, weight: {route.weight}")
    return {"status": "ok", "num_points": len(route.points), "weight": route.weight}
