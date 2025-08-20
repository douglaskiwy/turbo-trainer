export type RoutePoint = {
  lat: number;
  lon: number;
  ele: number;
  dist: number;
};


export async function uploadRoute(points: RoutePoint[], weight: number) {
  const res = await fetch("http://localhost:8000/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points, weight }),
  });
  if (!res.ok) throw new Error("Failed to upload route");
  return res.json();
}