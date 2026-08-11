import Link from "next/link";
import { Bike, Check, MapPin, Navigation, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const milestones = [
  ["CREATED", "Delivery requested"], ["ASSIGNED", "Rider assigned"], ["RIDER_ARRIVING", "Rider heading to pickup"],
  ["PICKED_UP", "Package picked up"], ["IN_TRANSIT", "On the way"], ["DELIVERED", "Delivered"],
] as const;

export const dynamic = "force-dynamic";
export default async function TrackingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const delivery = await db.delivery.findUnique({ where: { publicId: code }, include: { pickup: true, dropoff: true, rider: { include: { user: true, vehicles: true } }, events: { orderBy: { createdAt: "asc" } } } });
  if (!delivery) notFound();
  const reached = new Set(delivery.events.map(event => event.toStatus));
  const currentIndex = Math.max(0, milestones.findIndex(([status]) => status === delivery.status));
  const eta = new Date(delivery.createdAt.getTime() + delivery.estimatedMinutes * 60_000);
  return <main className="tracking-shell">
    <header className="topbar"><Link className="brand" href="/"><span>K</span> K-Deliver</Link><span className="tracking-id">{delivery.publicId}</span></header>
    <section className="tracking-hero"><p className="kicker">YOUR DELIVERY</p><h1>{delivery.status === "DELIVERED" ? "Your package was delivered" : delivery.status === "CANCELLED" ? "This delivery was cancelled" : "Your package is moving"}</h1><p>Current status <strong>{delivery.status.replaceAll("_", " ").toLowerCase()}</strong> · Initial ETA {eta.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p></section>
    <div className="map-surface" role="img" aria-label="Route visualization using stored delivery coordinates"><div className="road one"/><div className="road two"/><div className="map-marker pickup"><MapPin/></div>{delivery.rider && <div className="map-marker rider"><Bike/></div>}<span className="map-label">{delivery.dropoff.formattedAddress}</span><small>Development map adapter · markers represent stored delivery data</small></div>
    <section className="tracking-grid"><div className="tracking-card"><h2>Delivery progress</h2><div className="timeline">{milestones.map(([status, label], index) => { const done = reached.has(status) && status !== delivery.status; const current = status === delivery.status || (!milestones.some(([item]) => item === delivery.status) && index === currentIndex); return <div className={done ? "done" : current ? "current" : ""} key={status}><i>{done ? <Check size={13}/> : null}</i><span>{label}{current && <small>Latest confirmed network event</small>}</span></div>; })}</div></div>
      <aside className="tracking-card rider-card"><p className="kicker">FULFILLMENT</p>{delivery.rider ? <><div className="rider-profile"><div className="rider-avatar">{delivery.rider.user.name.split(" ").map(word => word[0]).join("")}</div><span><strong>{delivery.rider.user.name.split(" ")[0]}</strong><small>★ {delivery.rider.rating.toString()} · Verified rider</small></span><a href={`tel:${delivery.rider.user.phone}`} aria-label="Call rider"><Phone/></a></div><div className="vehicle-row"><Bike/><span><small>VEHICLE</small><strong>{delivery.rider.vehicles[0]?.type.toLowerCase()} · {delivery.rider.vehicles[0]?.registration}</strong></span></div></> : <div className="table-empty">Dispatch is searching the network for an eligible rider or provider.</div>}<div className="route-mini"><div><MapPin/><span><small>PICKUP</small><strong>{delivery.pickup.formattedAddress}</strong></span></div><div><Navigation/><span><small>DROP-OFF</small><strong>{delivery.dropoff.formattedAddress}</strong></span></div></div></aside>
    </section>
  </main>;
}
