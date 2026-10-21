"use client";

import { Plus, RefreshCw, Download, Pencil, MoreVertical, Crown, Users, Eye, Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Toolbar, FilterSelect } from "@/components/ui/toolbar";
import { FormDialog, Field, SelectField } from "@/components/ui/form-dialog";
import { CONSOLE_LOGINS, ORGS } from "@/lib/mock";

const ROLE_TONE = { Administrator: "info", "Fleet operator": "neutral", Viewer: "neutral" } as const;

export default function ConsoleLoginsPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Admin / Console logins"
        title="Console logins"
        subtitle="Manage admin and operator access to the console"
        actions={<NewLoginDialog />}
      />

      <Toolbar
        placeholder="Search email, name…"
        filters={<FilterSelect label="Organisation" options={["All organisations", ...ORGS.map((o) => o.name)]} />}
        actions={<><Button variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</Button><Button variant="secondary"><Download className="h-4 w-4" /> Export</Button></>}
      />

      <Card className="mt-4">
        <Table>
          <THead>
            <TH>Email</TH><TH>Role</TH><TH>Organisation</TH><TH>Last signed in</TH><TH>Status</TH><TH align="right">Actions</TH>
          </THead>
          <TBody>
            {CONSOLE_LOGINS.map((l) => (
              <TR key={l.id}>
                <TD className="font-medium text-ink">{l.email}</TD>
                <TD><StatusPill tone={ROLE_TONE[l.role]} dot={false}>{l.role}</StatusPill></TD>
                <TD>{l.orgLabel}</TD>
                <TD>{l.lastSignIn}</TD>
                <TD><StatusPill tone="success">Active</StatusPill></TD>
                <TD align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <EditLoginDialog email={l.email} role={l.role} />
                    <Button variant="secondary" size="sm"><MoreVertical className="h-3.5 w-3.5" /></Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="px-5 py-3 text-[12px] text-faint">{CONSOLE_LOGINS.length} logins</p>
      </Card>

      {/* Role permissions */}
      <div className="mt-6">
        <h2 className="text-[18px] font-bold text-ink">Role permissions</h2>
        <p className="mt-0.5 text-[13px] text-muted">Here is what each role can do in the console</p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RoleCard
            icon={<Crown className="h-5 w-5" />} tone="info" title="Administrator" badge="Full access"
            blurb="Can access and manage all features across all organisations."
            can={["Manage organisations", "Manage plans", "View and manage stations", "Manage batteries", "Manage riders", "Manage vehicles", "View reports & analytics", "View revenue", "Manage console logins", "Manage alerts", "System settings", "All other features"]}
            cannot={[]}
          />
          <RoleCard
            icon={<Users className="h-5 w-5" />} tone="success" title="Fleet operator" badge="Fleet level access"
            blurb="Can manage day-to-day operations for their assigned fleet / organisation."
            can={["View stations", "Manage batteries", "Manage riders", "Manage vehicles", "View swap reports", "View analytics (fleet only)", "View revenue (fleet only)", "Manage alerts (fleet only)"]}
            cannot={["Cannot manage organisations", "Cannot manage plans", "Cannot manage console logins", "Cannot access system settings"]}
          />
          <RoleCard
            icon={<Eye className="h-5 w-5" />} tone="violet" title="Viewer" badge="Read only access"
            blurb="Can view data and reports. No create, edit or delete permissions."
            can={["View stations", "View batteries", "View riders", "View vehicles", "View analytics", "View revenue", "View alerts"]}
            cannot={["Cannot manage organisations", "Cannot manage plans", "Cannot manage console logins", "Cannot make any changes"]}
          />
        </div>
        <p className="mt-3 text-[12px] text-faint">Viewer is defined here for reference; the console currently issues Administrator and Fleet operator logins.</p>
      </div>
    </div>
  );
}

function RoleCard({ icon, tone, title, badge, blurb, can, cannot }: { icon: React.ReactNode; tone: "info" | "success" | "violet"; title: string; badge: string; blurb: string; can: string[]; cannot: string[] }) {
  const tones = { info: "bg-info-soft text-info-ink", success: "bg-success-soft text-success-ink", violet: "bg-violet-100 text-violet-600" };
  const badges = { info: "bg-info-soft text-info-ink", success: "bg-success-soft text-success-ink", violet: "bg-violet-100 text-violet-600" };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
          <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badges[tone]}`}>{badge}</span>
      </div>
      <p className="mt-3 text-[13px] text-muted">{blurb}</p>
      <ul className="mt-4 space-y-2">
        {can.map((c) => (
          <li key={c} className="flex items-center gap-2 text-[13px] text-ink"><Check className="h-4 w-4 text-success" />{c}</li>
        ))}
        {cannot.map((c) => (
          <li key={c} className="flex items-center gap-2 text-[13px] text-faint"><Minus className="h-4 w-4 text-faint" />{c}</li>
        ))}
      </ul>
    </Card>
  );
}

function NewLoginDialog() {
  return (
    <FormDialog icon={<Users className="h-5 w-5" />} trigger={<><Plus className="h-4 w-4" /> New login</>} title="New console login" description="Invite an admin or operator to the console." submitLabel="Create login">
      <Field label="Email" type="email" placeholder="name@evitpl.com" required />
      <SelectField label="Role" options={["Administrator", "Fleet operator", "Viewer"]} required />
      <SelectField label="Organisation" options={["Every organisation", ...ORGS.map((o) => o.name)]} required />
    </FormDialog>
  );
}

function EditLoginDialog({ email, role }: { email: string; role: string }) {
  return (
    <FormDialog icon={<Pencil className="h-5 w-5" />} trigger={<><Pencil className="h-3.5 w-3.5" /> Edit</>} triggerVariant="secondary" triggerSize="sm" title="Edit login" description="Update role and access." submitLabel="Save changes">
      <Field label="Email" type="email" defaultValue={email} required />
      <SelectField label="Role" options={["Administrator", "Fleet operator", "Viewer"]} defaultValue={role} required />
      <SelectField label="Status" options={["Active", "Inactive"]} required />
    </FormDialog>
  );
}
