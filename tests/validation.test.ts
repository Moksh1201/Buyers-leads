import { describe, it, expect } from "vitest";
import { buyerCreateSchema } from "@/lib/validation";

describe("buyerCreateSchema", () => {
  it("rejects when budgetMax < budgetMin", () => {
    const res = buyerCreateSchema.safeParse({
      fullName: "John Doe",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "2",
      purpose: "Buy",
      budgetMin: 100,
      budgetMax: 50,
      timeline: "0-3m",
      source: "Website",
    });
    expect(res.success).toBe(false);
  });

  it("requires bhk for Apartment/Villa", () => {
    const res = buyerCreateSchema.safeParse({
      fullName: "John Doe",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Apartment",
      purpose: "Buy",
      timeline: "0-3m",
      source: "Website",
    });
    expect(res.success).toBe(false);
  });
});


