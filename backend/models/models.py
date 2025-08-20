from pydantic import BaseModel
from typing import List


class RoutePoint(BaseModel):
    lat: float
    lon: float
    ele: float
    dist: float


class RouteUpload(BaseModel):
    points: List[RoutePoint]
    weight: float
