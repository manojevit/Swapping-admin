"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Bike, ArrowRight } from "lucide-react";
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

  const tabTrigger =
    "flex-1 gap-2 rounded-xl border border-line bg-surface text-muted data-[state=active]:border-brand-200 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700 data-[state=active]:shadow-none";

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Hero */}
      <div className="relative hidden flex-1 lg:block">
        <Image src="/login-hero-left.png" alt="EVCHARGEX smart battery swapping station" fill priority sizes="60vw" className="object-cover object-left" />
      </div>

      {/* Sign-in card */}
      <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[480px] lg:shrink-0">
        <div className="mx-auto w-full max-w-[360px]">
          <Logo tone="dark" width={188} />

          <h2 className="mt-9 text-[30px] font-bold leading-tight tracking-tight text-ink">Welcome back 👋</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">Sign in to your console and keep your network moving.</p>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <Label className="mb-2 block">Sign in as</Label>
              <Tabs value={role} onValueChange={pickRole}>
                <TabsList className="h-auto bg-transparent p-0">
                  <TabsTrigger value="admin" className={tabTrigger}><ShieldCheck className="h-4 w-4" /> Administrator</TabsTrigger>
                  <TabsTrigger value="fleet_operator" className={tabTrigger}><Bike className="h-4 w-4" /> Fleet operator</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
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

            <div className="flex items-center gap-2.5 pt-0.5">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="font-normal text-muted">Keep me signed in</Label>
            </div>

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="h-12 w-full bg-gradient-to-r from-brand-500 to-brand-600 text-[15px] hover:from-brand-600 hover:to-brand-700">
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-8 text-center text-[13px] text-muted">
            Need access? <Link href="/overview" className="font-semibold text-brand-600 hover:text-brand-700">Ask your administrator</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
