import math
from models.models import RoutePoint


def haversine(pt1, pt2):
    R = 6371000  # Earth radius in meters
    lat1, lon1 = math.radians(pt1.lat), math.radians(pt1.lon)
    lat2, lon2 = math.radians(pt2.lat), math.radians(pt2.lon)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


def calculate_resistance(
    prev: RoutePoint,
    curr: RoutePoint,
    weight: float,
    speed: float,
    crr: float = 0.005,
    cda: float = 0.4,
    air_density: float = 1.225
) -> float:
    # Gravity
    elevation_gain = curr.ele - prev.ele
    distance = haversine(prev, curr)  # in meters
    grade = elevation_gain / distance
    gravity = 9.81 * weight * grade

    # Rolling
    rolling = 9.81 * weight * crr

    # Air
    air = 0.5 * cda * air_density * speed ** 2

    # Total resistance (watts required to maintain speed)
    total_force = gravity + rolling + air
    resistance = total_force  # Newtons
    return resistance, distance
