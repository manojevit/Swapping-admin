"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Bike } from "lucide-react";
import { Logo } from "@/components/brand/logo";
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

        {/* Live product preview: console in a browser frame + the rider app on a phone */}
        <div className="relative mt-10 flex-1">
          <div className="relative mx-auto w-full max-w-[640px] translate-y-6">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f1830] shadow-2xl">
              <div className="flex h-9 items-center gap-1.5 border-b border-white/10 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="ml-3 flex-1 truncate text-[11px] text-white/30">console.evchargex.app/overview</span>
              </div>
              <Image
                src="/preview/console.png"
                alt="EVCHARGEX console — network overview"
                width={1536}
                height={1024}
                priority
                className="w-full"
              />
            </div>

            {/* Rider app, overlapping bottom-left */}
            <div className="absolute -bottom-4 -left-6 w-[128px] rotate-[-6deg] overflow-hidden rounded-[1.7rem] border-[5px] border-[#0f1830] bg-black shadow-2xl sm:w-[140px]">
              <Image
                src="/preview/app.png"
                alt="EVCHARGEX rider app — station detail"
                width={1170}
                height={2532}
                className="w-full"
              />
            </div>
          </div>
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
