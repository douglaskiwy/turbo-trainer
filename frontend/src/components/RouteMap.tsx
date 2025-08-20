import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { RoutePoint } from "../api/uploadRoute";

export default function RouteMap({ points, nextPoint, distance, speed }: { points: RoutePoint[]; nextPoint?: RoutePoint | null; distance?: number; speed?: number }) {

  if (points.length === 0) return null;

  const center = [points[0].lat, points[0].lon];
  const polyline = points.map((pt) => [pt.lat, pt.lon]);

  const progressIdx = nextPoint
    ? points.findIndex(
        (pt) =>
          pt.lat === nextPoint.lat &&
          pt.lon === nextPoint.lon &&
          pt.ele === nextPoint.ele
      )
    : -1;

  return (
    <MapContainer center={center} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={polyline} color="blue" />
      {nextPoint && (
        <Marker position={[nextPoint.lat, nextPoint.lon]}>
          <Popup>
            <div>
              <strong>Current Position</strong>
              <br />
              Lat: {nextPoint.lat}
              <br />
              Lon: {nextPoint.lon}
              <br />
              Ele: {nextPoint.ele ?? "?"} m
              <br />
              Dist: {distance ? distance.toFixed(2) : "?"} 
              <br />
              Speed: {speed ? speed.toFixed(2) : "?"} m/s
            </div>
          </Popup>
        </Marker>
      )}
      {/* Optionally, show start and end markers */}
      <Marker position={[points[0].lat, points[0].lon]}>
        <Popup>Start</Popup>
      </Marker>
      <Marker position={[points[points.length - 1].lat, points[points.length - 1].lon]}>
        <Popup>Finish</Popup>
      </Marker>
    </MapContainer>
  );
}