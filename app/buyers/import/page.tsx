"use client";
import { useState } from "react";

export default function ImportPage() {
  const [text, setText] = useState("fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status\n");
  const [result, setResult] = useState<string>("");

  async function submit() {
    setResult("");
    const res = await fetch("/api/buyers/import", { method: "POST", body: text });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors) {
        setResult(data.errors.map((e: any) => `Row ${e.row}: ${e.message}`).join("\n"));
      } else {
        setResult(data.message || "Failed");
      }
      return;
    }
    setResult(`Inserted ${data.inserted} rows`);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Import CSV</h1>
      <p className="mb-2">Headers: fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status</p>
      <textarea className="w-full border p-2" rows={12} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-2 flex gap-2">
        <button className="border px-3 py-2" onClick={submit}>Upload</button>
        <a className="border px-3 py-2" href="/buyers">Back</a>
      </div>
      {result && <pre className="mt-3 whitespace-pre-wrap text-sm">{result}</pre>}
    </div>
  );
}


