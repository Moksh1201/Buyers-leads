import { MongoClient, Db, Collection } from "mongodb";

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (mongoDb) return mongoDb;
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const dbName = process.env.MONGODB_DB || "buyer_leads";
  if (!mongoClient) {
    mongoClient = new MongoClient(uri);
  }
  await mongoClient.connect();
  mongoDb = mongoClient.db(dbName);
  await ensureIndexes(mongoDb);
  return mongoDb;
}

async function ensureIndexes(db: Db) {
  await db.collection("buyers").createIndexes([
    { key: { updatedAt: -1 }, name: "updatedAt_desc" },
    { key: { fullName: 1 }, name: "fullName_idx" },
    { key: { phone: 1 }, name: "phone_idx" },
    { key: { email: 1 }, name: "email_idx" },
    { key: { city: 1 }, name: "city_idx" },
    { key: { propertyType: 1 }, name: "propertyType_idx" },
    { key: { status: 1 }, name: "status_idx" },
    { key: { timeline: 1 }, name: "timeline_idx" },
  ]);
  await db.collection("buyer_history").createIndex({ buyerId: 1, changedAt: -1 }, { name: "buyer_changedAt" });
}

export type BuyerDoc = {
  _id?: string;
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string | null;
  purpose: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline: string;
  source: string;
  status: string;
  notes?: string | null;
  tags?: string[] | null;
  ownerId: string;
  updatedAt: Date;
};

export type BuyerHistoryDoc = {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: Date;
  diff: Record<string, { from: unknown; to: unknown }> | any;
};


