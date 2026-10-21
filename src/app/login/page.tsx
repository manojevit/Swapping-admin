"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

// Frontend-only sign-in. There is no real auth here — submitting routes into
// the console. A real backend would verify credentials and start a session.
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/overview"), 600);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[12px] font-black text-sidebar">EVX</span>
          <div className="leading-tight">
            <p className="text-[17px] font-bold">EVCHARGEX</p>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-sidebar-muted">CONSOLE</p>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="max-w-md text-[34px] font-bold leading-tight">Run your battery-swapping network from one console.</h1>
          <p className="mt-4 max-w-md text-[15px] text-sidebar-muted">Live station health, battery inventory, swaps, riders and revenue — the operator side of EVCHARGEX.</p>
          <div className="mt-8 flex items-center gap-2 text-[13px] text-sidebar-muted">
            <ShieldCheck className="h-4 w-4 text-brand-400" /> Role-based access · Admin & Fleet operator
          </div>
        </div>
        <span className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <p className="relative z-10 text-[12px] text-sidebar-muted">© 2026 EVCHARGEX. All rights reserved.</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar text-[11px] font-black text-white">EVX</span>
            <p className="text-[16px] font-bold text-ink">EVCHARGEX Console</p>
          </div>

          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Zap className="h-6 w-6" /></span>
          <h2 className="mt-5 text-[26px] font-bold text-ink">Sign in to the console</h2>
          <p className="mt-1 text-[14px] text-muted">Use your EVCHARGEX operator account.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-faint">Email</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input type="email" required placeholder="you@evitpl.com" defaultValue="mohzzam@evitpl.com" className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-[14px] text-ink placeholder:text-faint focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-faint">Password</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input type="password" required placeholder="••••••••" defaultValue="demo" className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-[14px] text-ink placeholder:text-faint focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </span>
            </label>

            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2 text-muted">
                <input type="checkbox" className="h-4 w-4 rounded border-line text-brand-600" defaultChecked /> Remember me
              </label>
              <a className="font-semibold text-brand-600 hover:underline" href="#">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[14px] font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60">
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted">
            Need access? <Link href="/overview" className="font-semibold text-brand-600 hover:underline">Contact your administrator</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
