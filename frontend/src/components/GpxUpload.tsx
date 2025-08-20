import React, { useState } from "react";
import GPXParser from "gpxparser";

// Haversine formula to calculate distance between two lat/lon points in meters
function haversineDistance(pt1: any, pt2: any) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(pt2.lat - pt1.lat);
  const dLon = toRad(pt2.lon - pt1.lon);
  const lat1 = toRad(pt1.lat);
  const lat2 = toRad(pt2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function GpxUpload({ onRouteParsed }: { onRouteParsed: (route: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const text = await file.text();
      const parser = new GPXParser();
      parser.parse(text);
      // Extract track points: [{lat, lon, ele, distance}]
      const points = parser.tracks[0]?.points.map((pt: any, idx: number, arr: any[]) => ({
        lat: pt.lat,
        lon: pt.lon,
        ele: pt.ele,
        dist: idx === 0 ? 0 : haversineDistance(arr[idx - 1], pt),
      })) || [];
      onRouteParsed(points);
    } catch (err) {
      setError(`Failed to parse GPX file. $}{}`);
    }
  };

  return (
    <div>
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Upload & Parse GPX</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}