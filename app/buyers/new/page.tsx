"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerCreateSchema, type BuyerCreateInput, PropertyTypeEnum, BhkEnum, CityEnum, PurposeEnum, TimelineEnum, SourceEnum, StatusEnum } from "@/lib/validation";
import { useState } from "react";

export default function NewBuyerPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<BuyerCreateInput>({
    resolver: zodResolver(buyerCreateSchema),
    defaultValues: { status: "New" as any },
    mode: "onBlur",
  });

  const propertyType = form.watch("propertyType");
  const needsBhk = propertyType === "Apartment" || propertyType === "Villa";

  async function onSubmit(values: BuyerCreateInput) {
    setServerError(null);
    const res = await fetch("/api/buyers", { method: "POST", body: JSON.stringify(values) });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.message || "Failed to create");
      return;
    }
    window.location.href = `/buyers/${data.id}`;
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 className="text-2xl font-semibold mb-4">Create Buyer Lead</h1>
      {serverError && <p role="alert" className="text-red-600 mb-2">{serverError}</p>}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <label className="col-span-1">
          <span>Full Name</span>
          <input className="w-full border p-2" {...form.register("fullName")} aria-invalid={!!form.formState.errors.fullName} />
          {form.formState.errors.fullName && <span className="text-red-600">{form.formState.errors.fullName.message}</span>}
        </label>
        <label>
          <span>Phone</span>
          <input className="w-full border p-2" {...form.register("phone")} aria-invalid={!!form.formState.errors.phone} />
          {form.formState.errors.phone && <span className="text-red-600">{form.formState.errors.phone.message}</span>}
        </label>
        <label>
          <span>Email</span>
          <input className="w-full border p-2" {...form.register("email")} aria-invalid={!!form.formState.errors.email} />
          {form.formState.errors.email && <span className="text-red-600">{form.formState.errors.email.message}</span>}
        </label>
        <label>
          <span>City</span>
          <select className="w-full border p-2" {...form.register("city")}>{CityEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
        </label>
        <label>
          <span>Property Type</span>
          <select className="w-full border p-2" {...form.register("propertyType")}>{PropertyTypeEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
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
          <select className="w-full border p-2" {...form.register("purpose")}>{PurposeEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
        </label>
        <label>
          <span>Budget Min</span>
          <input type="number" className="w-full border p-2" {...form.register("budgetMin", { valueAsNumber: true })} />
        </label>
        <label>
          <span>Budget Max</span>
          <input type="number" className="w-full border p-2" {...form.register("budgetMax", { valueAsNumber: true })} />
          {form.formState.errors.budgetMax && <span className="text-red-600">{form.formState.errors.budgetMax.message}</span>}
        </label>
        <label>
          <span>Timeline</span>
          <select className="w-full border p-2" {...form.register("timeline")}>{TimelineEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
        </label>
        <label>
          <span>Source</span>
          <select className="w-full border p-2" {...form.register("source")}>{SourceEnum.options.map((c) => (<option key={c} value={c}>{c}</option>))}</select>
        </label>
        <label className="col-span-2">
          <span>Notes</span>
          <textarea className="w-full border p-2" rows={4} {...form.register("notes")} />
        </label>
        <label className="col-span-2">
          <span>Tags (comma-separated)</span>
          <input className="w-full border p-2" {...form.register("tags", { setValueAs: (v) => (typeof v === "string" ? v.split(",").map((t: string) => t.trim()).filter(Boolean) : v) })} />
        </label>
        <div className="col-span-2">
          <button type="submit" className="px-4 py-2 border">Create</button>
        </div>
      </form>
    </div>
  );
}


