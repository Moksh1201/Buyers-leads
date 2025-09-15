import { NextResponse } from "next/server";
import { getDb, type BuyerDoc, type BuyerHistoryDoc } from "@/db/client";
import { buyerCreateSchema, type BuyerCreateInput } from "@/lib/validation";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { rateLimit } from "@/lib/limiter";


export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") || "ipv6-localhost";
  const ok = rateLimit(`create:${(session.user as any).id}:${ip}`, 10, 10_000);
  if (!ok) return NextResponse.json({ message: "Rate limited" }, { status: 429 });

  const json = await req.json();
  const parse = buyerCreateSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ message: "Invalid input", errors: parse.error.flatten() }, { status: 400 });
  }
  const input = parse.data as BuyerCreateInput;

  const id = randomUUID();
  const now = new Date();
  const ownerId = (session.user as any).email as string;

  // tags stored as comma separated string
  const tagsStr = input.tags?.join(",") ?? null;

  const db = await getDb();
  const buyer: BuyerDoc = {
    id,
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
    status: (input as any).status ?? "New",
    notes: input.notes ?? null,
    tags: input.tags ?? null,
    ownerId,
    updatedAt: now,
  };
  await db.collection<BuyerDoc>("buyers").insertOne(buyer);
  const hist: BuyerHistoryDoc = { id: randomUUID(), buyerId: id, changedBy: ownerId, changedAt: now, diff: { created: true, by: ownerId } };
  await db.collection<BuyerHistoryDoc>("buyer_history").insertOne(hist);

  return NextResponse.json({ id }, { status: 201 });
}


