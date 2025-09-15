import { z } from "zod";

export const CityEnum = z.enum(["Chandigarh","Mohali","Zirakpur","Panchkula","Other"]);
export const PropertyTypeEnum = z.enum(["Apartment","Villa","Plot","Office","Retail"]);
export const BhkEnum = z.enum(["1","2","3","4","Studio"]);
export const PurposeEnum = z.enum(["Buy","Rent"]);
export const TimelineEnum = z.enum(["0-3m","3-6m",">6m","Exploring"]);
export const SourceEnum = z.enum(["Website","Referral","Walk-in","Call","Other"]);
export const StatusEnum = z.enum(["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"]);

export const buyerBaseSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().regex(/^\d{10,15}$/),
  city: CityEnum,
  propertyType: PropertyTypeEnum,
  bhk: BhkEnum.optional(),
  purpose: PurposeEnum,
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  timeline: TimelineEnum,
  source: SourceEnum,
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1)).optional(),
  status: StatusEnum.optional(),
});

export const buyerCreateSchema = buyerBaseSchema
  .superRefine((data, ctx) => {
    if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bhk is required for Apartment/Villa",
        path: ["bhk"],
      });
    }
    if (data.budgetMin !== undefined && data.budgetMax !== undefined && data.budgetMax < data.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "budgetMax must be greater than or equal to budgetMin",
        path: ["budgetMax"],
      });
    }
  });

export const buyerUpdateSchema = buyerCreateSchema.safeExtend({
  updatedAt: z.coerce.date(),
});

export type BuyerCreateInput = z.infer<typeof buyerCreateSchema>;
export type BuyerUpdateInput = z.infer<typeof buyerUpdateSchema>;


