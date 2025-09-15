"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerUpdateSchema, type BuyerUpdateInput, CityEnum, PropertyTypeEnum, PurposeEnum, TimelineEnum, SourceEnum, BhkEnum, StatusEnum } from "@/lib/validation";
import { useState } from "react";

export default function EditForm({ buyer }: { buyer: any }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<BuyerUpdateInput>({
    resolver: zodResolver(buyerUpdateSchema),
    defaultValues: {
      ...buyer,
      tags: (buyer.tags ? String(buyer.tags).split(",") : []) as any,
      updatedAt: new Date(buyer.updatedAt),
    } as any,
  });

  const propertyType = form.watch("propertyType");
  const needsBhk = propertyType === "Apartment" || propertyType === "Villa";

  async function onSubmit(values: BuyerUpdateInput) {
    setServerError(null);
    const res = await fetch(`/api/buyers/${buyer.id}`, { method: "PUT", body: JSON.stringify(values) });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.message || "Failed to update");
      return;
    }
    window.location.reload();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
      {serverError && <p role="alert" className="text-red-600 mb-2 col-span-2">{serverError}</p>}
      <label className="col-span-1">
        <span>Full Name</span>
        <input className="w-full border p-2" {...form.register("fullName")} />
      </label>
      <label>
        <span>Phone</span>
        <input className="w-full border p-2" {...form.register("phone")} />
      </label>
      <label>
        <span>Email</span>
        <input className="w-full border p-2" {...form.register("email")} />
      </label>
      <label>
        <span>City</span>
        <select className="w-full border p-2" {...form.register("city")}>
          {CityEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </label>
      <label>
        <span>Property Type</span>
        <select className="w-full border p-2" {...form.register("propertyType")}>
          {PropertyTypeEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </label>
      {needsBhk && (
        <label>
          <span>BHK</span>
          <select className="w-full border p-2" {...form.register("bhk")}>
            <option value="">Select</option>
            {BhkEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </label>
      )}
      <label>
        <span>Purpose</span>
        <select className="w-full border p-2" {...form.register("purpose")}>
          {PurposeEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </label>
      <label>
        <span>Budget Min</span>
        <input type="number" className="w-full border p-2" {...form.register("budgetMin", { valueAsNumber: true })} />
      </label>
      <label>
        <span>Budget Max</span>
        <input type="number" className="w-full border p-2" {...form.register("budgetMax", { valueAsNumber: true })} />
      </label>
      <label>
        <span>Timeline</span>
        <select className="w-full border p-2" {...form.register("timeline")}>
          {TimelineEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </label>
      <label>
        <span>Source</span>
        <select className="w-full border p-2" {...form.register("source")}>
          {SourceEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </label>
      <label className="col-span-2">
        <span>Notes</span>
        <textarea className="w-full border p-2" rows={4} {...form.register("notes")} />
      </label>
      <label className="col-span-2">
        <span>Tags (comma-separated)</span>
        <input className="w-full border p-2" {...form.register("tags", { setValueAs: (v) => (typeof v === "string" ? v.split(",").map((t: string) => t.trim()).filter(Boolean) : v) })} />
      </label>
      <input type="hidden" {...form.register("updatedAt")} />
      <div className="col-span-2">
        <button type="submit" className="px-4 py-2 border">Save</button>
      </div>
    </form>
  );
}


