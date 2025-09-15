"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-gray-600 mt-2" role="alert">{error.message}</p>
      <button className="mt-4 border px-3 py-2" onClick={() => reset()}>Try again</button>
    </div>
  );
}


