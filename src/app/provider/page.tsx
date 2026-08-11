import Link from "next/link";
import { ArrowRight, RadioTower } from "lucide-react";
import { db } from "@/lib/db";
import { formatNaira } from "@/lib/format";
import { Metric, StatusBadge, WorkspaceShell } from "@/components/business/WorkspaceShell";

export const dynamic = "force-dynamic";
export default async function ProviderDashboard() {
  const provider = await db.provider.findFirstOrThrow();
  const activeStates = ["ASSIGNED", "RIDER_ARRIVING", "AT_PICKUP", "PICKED_UP", "IN_TRANSIT", "AT_DESTINATION"] as const;
  const [active, completed, riders, online, earnings, jobs] = await Promise.all([
    db.delivery.count({ where: { providerId: provider.id, status: { in: [...activeStates] } } }), db.delivery.count({ where: { providerId: provider.id, status: "DELIVERED" } }), db.rider.count({ where: { providerId: provider.id } }), db.rider.count({ where: { providerId: provider.id, availability: "ONLINE" } }), db.transaction.aggregate({ where: { delivery: { providerId: provider.id }, type: "FULFILLER_EARNING" }, _sum: { amountKobo: true } }), db.delivery.findMany({ where: { providerId: provider.id }, include: { pickup: true, dropoff: true, rider: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  return <WorkspaceShell kind="provider" active="overview" name={provider.name}><header className="workspace-header"><div><p className="kicker">PROVIDER NETWORK</p><h1>{provider.name}</h1><p>Your fleet’s live position inside Kaduna’s delivery network.</p></div><Link className="secondary-action" href="/provider/api"><RadioTower/> Connect API</Link></header><section className="metrics-grid provider-metrics"><Metric label="Active jobs" value={active}/><Metric label="Completed" value={completed}/><Metric label="Fleet riders" value={riders}/><Metric label="Online now" value={online}/><Metric label="Earnings" value={formatNaira(earnings._sum.amountKobo ?? 0)}/></section><section className="workspace-panel"><div className="panel-heading"><div><h2>Network jobs</h2><p>Jobs currently assigned to your fleet</p></div><Link href="/provider/jobs">Manage jobs <ArrowRight size={16}/></Link></div><div className="data-table"><div className="table-head"><span>Job</span><span>Route</span><span>Assigned rider</span><span>Value</span><span>Status</span></div>{jobs.length ? jobs.map(job => <Link className="table-row" href={`/track/${job.publicId}`} key={job.id}><strong>{job.publicId}<small>{job.recommendedVehicle.toLowerCase()}</small></strong><span>{job.pickup.formattedAddress}<small>to {job.dropoff.formattedAddress}</small></span><span>{job.rider?.user.name ?? "Unassigned"}</span><span>{formatNaira(job.quotedAmountKobo)}</span><StatusBadge status={job.status}/></Link>) : <div className="table-empty">No jobs assigned. Online fleet capacity will be considered by dispatch.</div>}</div></section></WorkspaceShell>;
}
