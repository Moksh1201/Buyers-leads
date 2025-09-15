import { getDb, type BuyerDoc } from "@/db/client";

function toLike(value: string) { return `%${value.replace(/[%_]/g, "")}%`; }

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const city = url.searchParams.get("city") || "";
  const propertyType = url.searchParams.get("propertyType") || "";
  const status = url.searchParams.get("status") || "";
  const timeline = url.searchParams.get("timeline") || "";

  const db = await getDb();
  const filter: any = {};
  if (q) filter.$or = [{ fullName: { $regex: toLike(q), $options: "i" } }, { phone: { $regex: toLike(q), $options: "i" } }, { email: { $regex: toLike(q), $options: "i" } }];
  if (city) filter.city = city;
  if (propertyType) filter.propertyType = propertyType;
  if (status) filter.status = status;
  if (timeline) filter.timeline = timeline;
  const rows = await db.collection<BuyerDoc>("buyers").find(filter).sort({ updatedAt: -1 }).toArray();

  const header = ["fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const vals = [r.fullName, r.email ?? "", r.phone, r.city, r.propertyType, r.bhk ?? "", r.purpose, r.budgetMin ?? "", r.budgetMax ?? "", r.timeline, r.source, (r as any).notes ?? "", (r.tags ?? []).join(","), r.status];
    lines.push(vals.map((v) => typeof v === "string" && v.includes(",") ? `"${v.replaceAll('"', '""')}"` : String(v)).join(","));
  }
  const csv = lines.join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=buyers.csv" } });
}


