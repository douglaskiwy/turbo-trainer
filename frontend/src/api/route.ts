export async function getNextPoint(watts: number) {
  const res = await fetch("http://localhost:8000/next-point", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(watts),
  });
  if (!res.ok) throw new Error("Failed to get next point");
  return res.json();
}