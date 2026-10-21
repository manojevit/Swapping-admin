"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Bike } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SwapStationArt } from "@/components/brand/swap-station-art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/session";
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.08fr_460px]">
      {/* Product showcase panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-11 text-white lg:flex">
        <span className="pointer-events-none absolute left-1/4 top-[-10%] h-72 w-[36rem] rounded-full bg-brand-600/15 blur-[120px]" />

        <div className="relative">
          <Logo tone="light" width={208} />
        </div>

        <div className="relative mt-6">
          <h1 className="max-w-md text-[30px] font-semibold leading-[1.18] tracking-tight">
            Run your whole swapping network from one screen.
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-sidebar-muted">
            Stations, batteries, swaps, riders and revenue — live, and in your control.
          </p>
        </div>

        {/* Illustration: a battery-swap cabinet with live bay status */}
        <div className="relative mt-4 flex flex-1 flex-col justify-center">
          <SwapStationArt className="mx-auto h-auto w-full max-w-[380px]" />

          <dl className="relative mt-2 grid grid-cols-3 gap-4 border-t border-sidebar-line pt-6">
            <Stat value="4" label="Stations online" />
            <Stat value="86" label="Packs ready" />
            <Stat value="18" label="Swaps today" />
          </dl>
        </div>
      </section>

      {/* Sign-in panel */}
      <section className="flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-[384px]">
          <div className="mb-9 lg:hidden">
            <Logo tone="dark" width={168} />
          </div>

          <h2 className="text-[24px] font-semibold tracking-tight text-ink">Sign in to the console</h2>
          <p className="mt-1.5 text-[14px] text-muted">Choose your role and continue.</p>

          <form onSubmit={submit} className="mt-7 space-y-5">
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

          <p className="mt-8 text-[13px] text-muted">
            Need access? <Link href="/overview" className="font-semibold text-brand-600 hover:text-brand-700">Ask your administrator</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="text-[22px] font-semibold tracking-tight text-white">{value}</dd>
      <dt className="mt-0.5 text-[12px] text-sidebar-muted">{label}</dt>
    </div>
  );
}
