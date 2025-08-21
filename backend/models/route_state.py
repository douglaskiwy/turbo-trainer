from typing import List, Optional
from models.models import RoutePoint
from models.simple_resistance import calculate_resistance


class RouteState:
    def __init__(self):
        """
        Initialize the route state.
        """
        self.points = []
        self.weight = 90.0
        self.current_idx = 0
        self.speed = 0.0
        self.distance_covered = 0.0
        self.exists = False

    def set_route(self, points, weight) -> None:
        """
        Set the route points and weight.
        """
        self.points = points
        self.weight = weight
        self.speed = 0.0
        self.current_idx = 0
        self.distance_covered = 0.0
        self.exists = True

    def update_progress(self, watts, dt) -> None:
        """
        Update the progress of the route.
        """
        if not self.exists or self.current_idx == len(self.points)-1:
            return

        prev = self.points[self.current_idx]
        curr = self.points[self.current_idx + 1]

        # Estimate speed (m/s)
        resistance, segment_dist = calculate_resistance(
            prev, curr, self.weight, 1.0)  # initial guess
        self.speed = max(watts / resistance, 0.1)  # avoid div by zero

        # Advance distance
        self.distance_covered += self.speed * dt

        # If covered enough distance, move to next point
        if self.distance_covered >= segment_dist:
            self.current_idx += 1
            self.distance_covered = 0.0

    def get_next_point(self) -> Optional[tuple]:
        """
        Get the next route point along with the current speed and distance covered.
        """
        if not self.exists:
            return None
        return (self.points[self.current_idx], self.speed, self.distance_covered)
