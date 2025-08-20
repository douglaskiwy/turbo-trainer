from typing import List, Optional
from models.models import RoutePoint
from models.simple_resistance import calculate_resistance


class RouteState:
    def __init__(self):
        self.points = []
        self.weight = 90.0
        self.current_idx = 0
        self.speed = 0.0
        self.distance_covered = 0.0
        self.exists = False

    def set_route(self, points, weight):
        self.points = points
        self.weight = weight
        self.speed = 0.0
        self.current_idx = 0
        self.distance_covered = 0.0
        self.exists = True

    def update_progress(self, watts, dt):
        print(
            f"Exists = {self.exists} current_idx = {self.current_idx} points = {len(self.points)}")
        if not self.exists or self.current_idx == len(self.points)-1:
            return

        prev = self.points[self.current_idx]
        curr = self.points[self.current_idx + 1]

        print("calculating resistance")

        # Estimate speed (m/s)
        resistance, segment_dist = calculate_resistance(
            prev, curr, self.weight, 1.0)  # initial guess
        self.speed = max(watts / resistance, 0.1)  # avoid div by zero

        # Advance distance
        self.distance_covered += self.speed * dt
        print(f"Distance covered: {self.distance_covered} m")
        print(f"Segment distance: {segment_dist} m")
        print(f"Speed: {self.speed} m/s")

        # If covered enough distance, move to next point
        if self.distance_covered >= segment_dist:
            self.current_idx += 1
            self.distance_covered = 0.0

    def get_next_point(self):
        if not self.exists:
            return None
        return (self.points[self.current_idx], self.speed, self.distance_covered)
