import { NextResponse } from "next/server";
import { getDb, type BuyerDoc, type BuyerHistoryDoc } from "@/db/client";
import { buyerUpdateSchema } from "@/lib/validation";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { rateLimit } from "@/lib/limiter";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const ip = req.headers.get("x-forwarded-for") || "ipv6-localhost";
  const ok = rateLimit(`update:${(session.user as any).id}:${ip}`, 10, 10_000);
  if (!ok) return NextResponse.json({ message: "Rate limited" }, { status: 429 });

  const json = await req.json();
  const parse = buyerUpdateSchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ message: "Invalid input", errors: parse.error.flatten() }, { status: 400 });

  const db = await getDb();
  const existing = await db.collection<BuyerDoc>("buyers").findOne({ id: params.id });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const isOwner = (session.user as any).role === "admin" || existing.ownerId === (session.user as any).email;
  if (!isOwner) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const input = parse.data;
  if (new Date(existing.updatedAt).getTime() !== input.updatedAt.getTime()) {
    return NextResponse.json({ message: "Record changed, please refresh" }, { status: 409 });
  }

  const now = new Date();
  const tagsStr = input.tags?.join(",") ?? null;

  const updates = {
    fullName: input.fullName,
    email: input.email ?? null,
    phone: input.phone,
    city: input.city,
    propertyType: input.propertyType,
    bhk: input.bhk ?? null,
    purpose: input.purpose,
    budgetMin: input.budgetMin ?? null,
    budgetMax: input.budgetMax ?? null,
    timeline: input.timeline,
    source: input.source,
    status: (input as any).status ?? existing.status,
    notes: input.notes ?? null,
    tags: tagsStr,
    updatedAt: now,
  } as const;

  await db.collection<BuyerDoc>("buyers").updateOne({ id: params.id }, { $set: updates });

  // Build field-level diff
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
    if (key === "updatedAt") continue;
    const prev = (existing as any)[key];
    const next = (updates as any)[key];
    if (String(prev ?? "") !== String(next ?? "")) {
      diff[key as string] = { from: prev ?? null, to: next ?? null };
    }
  }

  const changedBy = (session.user as any).id as string;
  const hist: BuyerHistoryDoc = { id: randomUUID(), buyerId: params.id, changedBy, changedAt: now, diff };
  await db.collection<BuyerHistoryDoc>("buyer_history").insertOne(hist);

  return NextResponse.json({ ok: true });
}


