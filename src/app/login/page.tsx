"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";

// Frontend-only sign-in. There is no real auth here — submitting routes into
// the console. A real backend would verify credentials and start a session.
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/overview"), 600);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar px-12 py-11 text-white lg:flex">
        <Logo tone="light" width={168} />

        <div className="max-w-md">
          <h1 className="text-[32px] font-semibold leading-[1.15] tracking-tight">
            The operator console for your battery-swapping network.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-sidebar-muted">
            Watch every station, battery and swap in real time, and act the moment something needs you.
          </p>

          <div className="mt-10 h-px w-full bg-sidebar-line" />
          <dl className="mt-6 grid grid-cols-3 gap-6">
            <Stat value="21" label="Stations" />
            <Stat value="160" label="Batteries" />
            <Stat value="1,284" label="Swaps / mo" />
          </dl>
        </div>

        <p className="text-[12px] text-sidebar-muted">© 2026 EVCHARGEX · Electrifying last-mile mobility</p>

        {/* one restrained accent, top-right */}
        <span className="pointer-events-none absolute right-0 top-0 h-56 w-56 -translate-y-1/3 translate-x-1/3 rounded-full bg-brand-600/20 blur-[90px]" />
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-10 lg:hidden">
            <Logo tone="dark" width={160} />
          </div>

          <h2 className="text-[24px] font-semibold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1.5 text-[14px] text-muted">Welcome back. Use your EVCHARGEX operator account.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
                <input
                  type="email"
                  required
                  placeholder="you@evitpl.com"
                  defaultValue="mohzzam@evitpl.com"
                  className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-3.5 text-[14px] text-ink placeholder:text-faint transition-colors hover:border-black/15 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink">Password</span>
                <a href="#" className="text-[13px] font-medium text-brand-600 hover:text-brand-700">Forgot password?</a>
              </span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
                <input
                  type={show ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  defaultValue="demo"
                  className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-11 text-[14px] text-ink placeholder:text-faint transition-colors hover:border-black/15 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-faint hover:bg-black/5 hover:text-muted">
                  {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </span>
            </label>

            <label className="flex items-center gap-2 pt-1 text-[13px] text-muted">
              <input type="checkbox" className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500/30" defaultChecked />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-[13px] text-muted">
            Don&apos;t have access yet?{" "}
            <Link href="/overview" className="font-semibold text-brand-600 hover:text-brand-700">Ask your administrator</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="text-[26px] font-semibold tracking-tight text-white">{value}</dd>
      <dt className="mt-1 text-[12px] text-sidebar-muted">{label}</dt>
    </div>
  );
}
