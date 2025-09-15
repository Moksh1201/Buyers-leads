"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("agent@example.com");
  return (
    <div style={{ maxWidth: 360, margin: "64px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Sign in</h1>
      <p style={{ color: "#555", marginTop: 8 }}>Use a demo email to log in:</p>
      <ul style={{ margin: "8px 0 16px 16px" }}>
        <li>agent@example.com</li>
        <li>admin@example.com</li>
      </ul>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
      />
      <button
        onClick={async () => {
          await signIn("credentials", { email, callbackUrl: "/buyers" });
        }}
        style={{ width: "100%", padding: 10 }}
      >
        Continue
      </button>
      <p style={{ marginTop: 16 }}>
        Back to <Link href="/">home</Link>
      </p>
    </div>
  );
}


