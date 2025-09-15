import { getDb, type BuyerDoc } from "@/db/client";
import { ObjectId } from "mongodb";
import Link from "next/link";
import SearchInput from "./SearchInput";

const PAGE_SIZE = 10;

function toRegex(value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
}

export default async function BuyersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const q = (sp.q as string) || "";
  const city = (sp.city as string) || "";
  const propertyType = (sp.propertyType as string) || "";
  const status = (sp.status as string) || "";
  const timeline = (sp.timeline as string) || "";

  const db = await getDb();
  const filter: any = {};
  if (q) filter.$or = [{ fullName: toRegex(q) }, { phone: toRegex(q) }, { email: toRegex(q) }];
  if (city) filter.city = city;
  if (propertyType) filter.propertyType = propertyType;
  if (status) filter.status = status;
  if (timeline) filter.timeline = timeline;

  const count = await db.collection<BuyerDoc>("buyers").countDocuments(filter);
  const rows = await db
    .collection<BuyerDoc>("buyers")
    .find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (city) params.set("city", city);
  if (propertyType) params.set("propertyType", propertyType);
  if (status) params.set("status", status);
  if (timeline) params.set("timeline", timeline);
  const exportUrl = `/buyers/export?${params.toString()}`;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Buyers</h1>
      <Filters q={q} city={city} propertyType={propertyType} status={status} timeline={timeline} exportUrl={exportUrl} />
      <div className="mb-2 flex gap-2">
        <a className="border px-3 py-2" href="/buyers/import">Import CSV</a>
        <a className="border px-3 py-2" href={exportUrl}>Export CSV</a>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">City</th>
            <th className="p-2 text-left">Property</th>
            <th className="p-2 text-left">Budget</th>
            <th className="p-2 text-left">Timeline</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Updated</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.fullName}</td>
              <td className="p-2">{r.phone}</td>
              <td className="p-2">{r.city}</td>
              <td className="p-2">{r.propertyType}</td>
              <td className="p-2">{r.budgetMin ?? "-"} – {r.budgetMax ?? "-"}</td>
              <td className="p-2">{r.timeline}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{new Date(r.updatedAt).toLocaleString()}</td>
              <td className="p-2"><Link className="text-blue-600 underline" href={`/buyers/${r.id}`}>View / Edit</Link></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center text-gray-500">No buyers found</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination current={page} total={totalPages} />
    </div>
  );
}

function Filters({ q, city, propertyType, status, timeline, exportUrl }: { q: string; city: string; propertyType: string; status: string; timeline: string; exportUrl: string }) {
  return (
    <form className="flex gap-2 mb-3" action="/buyers" method="get">
      <SearchInput defaultValue={q} />
      <select className="border p-2" name="city" defaultValue={city}><option value="">City</option><option>Chandigarh</option><option>Mohali</option><option>Zirakpur</option><option>Panchkula</option><option>Other</option></select>
      <select className="border p-2" name="propertyType" defaultValue={propertyType}><option value="">Property</option><option>Apartment</option><option>Villa</option><option>Plot</option><option>Office</option><option>Retail</option></select>
      <select className="border p-2" name="status" defaultValue={status}><option value="">Status</option><option>New</option><option>Qualified</option><option>Contacted</option><option>Visited</option><option>Negotiation</option><option>Converted</option><option>Dropped</option></select>
      <select className="border p-2" name="timeline" defaultValue={timeline}><option value="">Timeline</option><option>0-3m</option><option>3-6m</option><option>&gt;6m</option><option>Exploring</option></select>
      <button className="border px-3">Apply</button>
      <a className="border px-3 py-2" href="/buyers">Reset</a>
      <a className="border px-3 py-2" href={exportUrl}>Export CSV</a>
    </form>
  );
}


function Pagination({ current, total }: { current: number; total: number }) {
  const prev = Math.max(1, current - 1);
  const next = Math.min(total, current + 1);
  return (
    <div className="flex gap-2 mt-3">
      <Link className="border px-3 py-1" href={`?page=${prev}`}>Prev</Link>
      <span className="px-2">Page {current} of {total}</span>
      <Link className="border px-3 py-1" href={`?page=${next}`}>Next</Link>
    </div>
  );
}


