import { useState } from "react";
import Ws from "./api/ws";
import GpxUpload from "./components/GpxUpload";
import RouteMap from "./components/RouteMap";
import { uploadRoute, type RoutePoint } from "./api/uploadRoute";


const App = () => {
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [weight] = useState<number>(90);
  const [distance, setDistance] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [nextPoint, setNextPoint] = useState<RoutePoint | null>(null);

  const progressIdx = nextPoint
    ? route.findIndex(
        (pt) =>
          pt.lat === nextPoint.lat &&
          pt.lon === nextPoint.lon &&
          pt.ele === nextPoint.ele
      )
    : -1;
  const progressPercent =
    route.length > 0 && progressIdx >= 0
      ? ((progressIdx + 1) / route.length) * 100
      : 0;

  const handleRouteParsed = async (points: RoutePoint[]) => {
    setRoute(points);
    setUploadStatus(null);
    try {
      const res = await uploadRoute(points, weight);
      setUploadStatus(`Route uploaded! Points: ${res.num_points}, Weight: ${res.weight}`);
    } catch (err: unknown) {
      setUploadStatus(`Failed to upload route. Error:${String(err)}`);
    }
  };

  return (
    <div>
      <h1>GPX Route Upload</h1>
      <Ws onNextPoint={(point, distance, speed) => {
        setNextPoint(point);
        setDistance(distance);
        setSpeed(speed);
      }} />
      <GpxUpload onRouteParsed={handleRouteParsed} />
      {uploadStatus && <div style={{ color: uploadStatus.startsWith("Failed") ? "red" : "green" }}>{uploadStatus}</div>}
      {route.length > 0 && (
        <>
          <h1 className="text-3xl font-bold mb-4">Turbo Trainer Dashboard</h1>
          <h2>Route Map</h2>
          <RouteMap points={route} nextPoint={nextPoint} distance={distance} speed={speed} />
          {nextPoint && (
            <div className="mt-4 p-2 border rounded bg-gray-100">
              <strong>Next Route Point:</strong>
              <div>Lat: {nextPoint.lat}</div>
              <div>Lon: {nextPoint.lon}</div>
              <div>Ele: {nextPoint.ele} m</div>
              <div>Dist: {distance.toFixed(2)} m</div>
              <div>Speed: {speed.toFixed(2)} m/s</div>
              <div>
                <strong>Progress:</strong>{" "}
                {progressIdx + 1} / {route.length} (
                {progressPercent.toFixed(1)}%)
              </div>
              <div style={{ width: "100%", background: "#eee", height: "10px", borderRadius: "5px", marginTop: "8px" }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    background: "#3b82f6",
                    height: "100%",
                    borderRadius: "5px",
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
