import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatNaira } from "@/lib/format";
import { Metric, StatusBadge, WorkspaceShell } from "@/components/business/WorkspaceShell";

export const dynamic = "force-dynamic";
export default async function MerchantDashboard() {
  const merchant = await db.merchant.findFirstOrThrow({ include: { user: true } });
  const [total, active, completed, failed, spend, deliveries] = await Promise.all([
    db.delivery.count({ where: { merchantId: merchant.id } }),
    db.delivery.count({ where: { merchantId: merchant.id, status: { in: ["SEARCHING", "ASSIGNED", "RIDER_ARRIVING", "AT_PICKUP", "PICKED_UP", "IN_TRANSIT", "AT_DESTINATION"] } } }),
    db.delivery.count({ where: { merchantId: merchant.id, status: "DELIVERED" } }),
    db.delivery.count({ where: { merchantId: merchant.id, status: "FAILED" } }),
    db.payment.aggregate({ where: { delivery: { merchantId: merchant.id }, status: "SUCCEEDED" }, _sum: { amountKobo: true } }),
    db.delivery.findMany({ where: { merchantId: merchant.id }, include: { pickup: true, dropoff: true, rider: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  return <WorkspaceShell kind="merchant" active="overview" name={merchant.businessName}><header className="workspace-header"><div><p className="kicker">MERCHANT OVERVIEW</p><h1>Good afternoon, {merchant.user.name.split(" ")[0]}</h1><p>Here’s what is moving across your business today.</p></div><Link className="primary-action" href="/merchant/deliveries/new"><Plus/> Create delivery</Link></header><section className="metrics-grid"><Metric label="Total deliveries" value={total}/><Metric label="Active now" value={active} note="Across the network"/><Metric label="Completed" value={completed}/><Metric label="Failed" value={failed}/><Metric label="Total spend" value={formatNaira(spend._sum.amountKobo ?? 0)}/></section><section className="workspace-panel"><div className="panel-heading"><div><h2>Recent deliveries</h2><p>Live operational records for {merchant.businessName}</p></div><Link href="/merchant/deliveries">View all <ArrowRight size={16}/></Link></div><div className="data-table"><div className="table-head"><span>Delivery</span><span>Route</span><span>Rider</span><span>Price</span><span>Status</span></div>{deliveries.length ? deliveries.map(delivery => <Link className="table-row" href={`/track/${delivery.publicId}`} key={delivery.id}><strong>{delivery.publicId}<small>{delivery.createdAt.toLocaleDateString("en-NG")}</small></strong><span>{delivery.pickup.formattedAddress}<small>to {delivery.dropoff.formattedAddress}</small></span><span>{delivery.rider?.user.name ?? "Matching"}</span><span>{formatNaira(delivery.quotedAmountKobo)}</span><StatusBadge status={delivery.status}/></Link>) : <div className="table-empty">No deliveries yet. Create your first delivery to start moving.</div>}</div></section></WorkspaceShell>;
}

