"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Bike, Radio, ArrowLeftRight, Package, BatteryCharging } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const EMAIL_FOR: Record<Role, string> = {
  admin: "mohzzam@evitpl.com",
  fleet_operator: "ops@evitpl.com",
};

// Frontend-only sign-in. Submitting sets the chosen role on the mock session
// and routes into the console. A real backend would verify credentials.
export default function LoginPage() {
  const router = useRouter();
  const { setRole: applyRole } = useSession();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState(EMAIL_FOR.admin);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  function pickRole(value: string) {
    const r = value as Role;
    setRole(r);
    setEmail(EMAIL_FOR[r]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    applyRole(role);
    setTimeout(() => router.push("/overview"), 500);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sidebar px-4 py-10">
      {/* Backdrop: tech grid + brand glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 38%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 38%, #000 40%, transparent 100%)",
        }}
      />
      <span className="pointer-events-none absolute left-1/2 top-[-12%] h-[460px] w-[640px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[130px]" />
      <span className="pointer-events-none absolute bottom-[-18%] right-[-6%] h-[380px] w-[420px] rounded-full bg-brand-500/15 blur-[120px]" />

      {/* Floating live-stat chips (desktop only) */}
      <LiveChip className="left-10 top-14" icon={<Radio className="h-4 w-4" />} dot="success" value="4" label="stations online" />
      <LiveChip className="right-12 top-24" icon={<ArrowLeftRight className="h-4 w-4" />} dot="info" value="3" label="active swaps" live />
      <LiveChip className="bottom-28 left-16" icon={<Package className="h-4 w-4" />} dot="warn" value="86" label="packs ready" />
      <LiveChip className="bottom-16 right-16" icon={<BatteryCharging className="h-4 w-4" />} dot="success" value="144" label="batteries healthy" />

      {/* Foreground */}
      <div className="animate-pop relative z-10 w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo tone="light" width={188} />
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-sidebar-muted backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Operations console · live
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface p-7 shadow-pop sm:p-8">
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-1 text-[14px] text-muted">Choose your role and sign in to the console.</p>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <Label className="mb-2 block">Sign in as</Label>
              <Tabs value={role} onValueChange={pickRole}>
                <TabsList>
                  <TabsTrigger value="admin"><ShieldCheck className="h-4 w-4" /> Administrator</TabsTrigger>
                  <TabsTrigger value="fleet_operator"><Bike className="h-4 w-4" /> Fleet operator</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-[13px] font-medium text-brand-600 hover:text-brand-700">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
                <Input id="password" type={show ? "text" : "password"} required defaultValue="demo" placeholder="Enter your password" className="pl-11 pr-11" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-faint hover:bg-black/5 hover:text-muted">
                  {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="font-normal text-muted">Keep me signed in</Label>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="h-12 w-full text-[15px]">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-[12px] text-sidebar-muted">
          Need access? <Link href="/overview" className="font-medium text-white/80 hover:text-white">Ask your administrator</Link>
          <span className="mx-2 text-white/20">·</span>
          © 2026 EVCHARGEX
        </p>
      </div>
    </div>
  );
}

function LiveChip({
  className,
  icon,
  value,
  label,
  dot,
  live,
}: {
  className?: string;
  icon: React.ReactNode;
  value: string;
  label: string;
  dot: "success" | "info" | "warn";
  live?: boolean;
}) {
  const dotColor = { success: "bg-success", info: "bg-info", warn: "bg-warn" }[dot];
  return (
    <div className={cn("absolute z-10 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-lg backdrop-blur-md xl:flex", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/80">{icon}</span>
      <div className="leading-tight">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold text-white">
          <span className={cn("h-1.5 w-1.5 rounded-full", dotColor, live && "animate-pulse")} />
          {value}
        </p>
        <p className="text-[11px] text-sidebar-muted">{label}</p>
      </div>
    </div>
  );
}
