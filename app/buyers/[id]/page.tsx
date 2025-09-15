import { getDb, type BuyerDoc, type BuyerHistoryDoc } from "@/db/client";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import EditForm from "./edit-form";

function safeParseJSON(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export default async function BuyerDetail({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const db = await getDb();
  const buyer = await db.collection<BuyerDoc>("buyers").findOne({ id: p.id });
  if (!buyer) return notFound();
  const history = await db.collection<BuyerHistoryDoc>("buyer_history").find({ buyerId: p.id }).sort({ changedAt: -1 }).limit(5).toArray();
  const session = await auth();
  const userEmail = session?.user?.email ?? "";
  const userRole = (session as any)?.user?.role ?? "user";
  const canEdit = userRole === "admin" || buyer.ownerId === userEmail;
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">{buyer.fullName}</h1>
      {canEdit ? (
        <EditForm buyer={{ ...buyer, _id: undefined, tags: buyer.tags ?? [], updatedAt: buyer.updatedAt.toISOString() }} />
      ) : (
        <p className="text-sm text-gray-600">Read-only: only the owner can edit.</p>
      )}
      <h2 className="text-xl font-semibold mt-8 mb-2">Recent Changes</h2>
      <ul className="list-disc ml-6 text-sm">
        {history.map((h) => {
          const raw = (h as any).diff;
          const d = typeof raw === "string" ? (safeParseJSON(raw) as any) : raw;
          const entries = d ? Object.entries(d as Record<string, { from: unknown; to: unknown }>) : [];
          return (
            <li key={h.id} className="mb-1">
              {new Date(h.changedAt).toLocaleString()} – {entries.length ? entries.map(([k, v]: any) => `${k}: ${v?.from ?? ""} → ${v?.to ?? ""}`).join(", ") : "(no field changes)"}
            </li>
          );
        })}
        {history.length === 0 && <li>No changes yet.</li>}
      </ul>
    </div>
  );
}


