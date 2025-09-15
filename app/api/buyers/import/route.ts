import { NextResponse } from "next/server";
import { getDb, type BuyerDoc, type BuyerHistoryDoc } from "@/db/client";
import Papa from "papaparse";
import { buyerCreateSchema } from "@/lib/validation";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const text = await req.text();
  const parsed = Papa.parse(text, { header: true });
  const rows = parsed.data as any[];
  if (rows.length > 200) return NextResponse.json({ message: "Max 200 rows" }, { status: 400 });

  const errors: { row: number; message: string }[] = [];
  const valid: any[] = [];
  rows.forEach((r, idx) => {
    const row = { ...r, tags: r.tags ? String(r.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : undefined };
    const res = buyerCreateSchema.safeParse(row);
    if (!res.success) {
      errors.push({ row: idx + 2, message: res.error.issues.map((i) => i.path.join(".")+": "+i.message).join("; ") });
    } else {
      valid.push(res.data);
    }
  });

  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  // Transactional insert
  const ownerId = (session.user as any).id as string;
  const now = new Date();
  const db = await getDb();
  const buyerDocs: BuyerDoc[] = [];
  const histDocs: BuyerHistoryDoc[] = [];
  for (const v of valid) {
    const id = randomUUID();
    buyerDocs.push({
      id,
      fullName: v.fullName,
      email: v.email ?? null,
      phone: v.phone,
      city: v.city,
      propertyType: v.propertyType,
      bhk: v.bhk ?? null,
      purpose: v.purpose,
      budgetMin: v.budgetMin ?? null,
      budgetMax: v.budgetMax ?? null,
      timeline: v.timeline,
      source: v.source,
      status: (v as any).status ?? "New",
      notes: v.notes ?? null,
      tags: v.tags ?? null,
      ownerId,
      updatedAt: now,
    });
    histDocs.push({ id: randomUUID(), buyerId: id, changedBy: ownerId, changedAt: now, diff: { imported: true } });
  }
  const sessionDb = db; // single-node; skipping multi-doc ACID transaction for simplicity
  await sessionDb.collection<BuyerDoc>("buyers").insertMany(buyerDocs);
  await sessionDb.collection<BuyerHistoryDoc>("buyer_history").insertMany(histDocs);

  return NextResponse.json({ inserted: valid.length });
}


