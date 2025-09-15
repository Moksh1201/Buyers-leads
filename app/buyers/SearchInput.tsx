"use client";
import { useEffect, useRef, useState } from "react";

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  return (
    <input
      className="border p-2"
      type="text"
      name="q"
      defaultValue={defaultValue}
      placeholder="Search name/phone/email"
      onChange={(e) => {
        setValue(e.currentTarget.value);
        if (timer.current) clearTimeout(timer.current);
        const next = e.currentTarget.value;
        timer.current = setTimeout(() => {
          const url = new URL(window.location.href);
          if (next) url.searchParams.set("q", next); else url.searchParams.delete("q");
          url.searchParams.set("page", "1");
          window.location.href = url.toString();
        }, 400);
      }}
    />
  );
}


