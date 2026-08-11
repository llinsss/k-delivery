import Link from "next/link";
import { BarChart3, Bike, BriefcaseBusiness, Code2, KeyRound, PackageSearch, Plus, RadioTower, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

const icons = { overview: BarChart3, deliveries: PackageSearch, create: Plus, riders: Users, jobs: Bike, api: Code2, webhooks: RadioTower, settings: Settings };

export function WorkspaceShell({ kind, active, name, children }: { kind: "merchant" | "provider"; active: keyof typeof icons; name: string; children: ReactNode }) {
  const merchantItems = [["overview", "Overview", "/merchant"], ["create", "Create delivery", "/merchant/deliveries/new"], ["deliveries", "Deliveries", "/merchant/deliveries"], ["settings", "Business settings", "/merchant/settings"]] as const;
  const providerItems = [["overview", "Overview", "/provider"], ["jobs", "Jobs", "/provider/jobs"], ["riders", "Riders & vehicles", "/provider/riders"], ["api", "API credentials", "/provider/api"], ["webhooks", "Webhooks", "/provider/webhooks"]] as const;
  const items = kind === "merchant" ? merchantItems : providerItems;
  return <div className="workspace">
    <aside className="workspace-sidebar">
      <Link className="brand workspace-brand" href="/"><span>K</span> K-Deliver</Link>
      <div className="workspace-account"><div>{kind === "merchant" ? <BriefcaseBusiness/> : <KeyRound/>}</div><span><small>{kind === "merchant" ? "MERCHANT" : "DELIVERY PROVIDER"}</small><strong>{name}</strong></span></div>
      <nav>{items.map(([id, label, href]) => { const Icon = icons[id]; return <Link className={active === id ? "active" : ""} href={href} key={id}><Icon size={18}/>{label}</Link>; })}</nav>
      <div className="workspace-switch"><small>NETWORK WORKSPACES</small><Link href={kind === "merchant" ? "/provider" : "/merchant"}>{kind === "merchant" ? "Provider portal" : "Merchant portal"}</Link></div>
    </aside>
    <main className="workspace-main">{children}</main>
  </div>;
}

export function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) { return <div className="metric"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>; }
export function StatusBadge({ status }: { status: string }) { return <span className={`status-pill ${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span>; }

