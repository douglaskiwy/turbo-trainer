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
      setError(`Failed to parse GPX file. ${err}`);
    }
  };

  return (
     <div className="flex flex-col items-start gap-2 p-4 bg-white rounded shadow">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload GPX File
      </label>
      <input
        type="file"
        accept=".gpx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleUpload}
        disabled={!file}
        className={`mt-2 px-4 py-2 rounded font-semibold transition
          ${file
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"}
        `}
      >
        Upload & Parse GPX
      </button>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}