"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bike, MapPin, Navigation, Package, Phone, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { calculatePrice } from "@/services/pricing";
import { selectVehicle } from "@/services/vehicle-selection";
import { formatNaira } from "@/lib/format";

const stages = ["Route", "Package", "Option", "Confirm"];

export default function SendDeliveryPage() {
  const [step, setStep] = useState(0);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [size, setSize] = useState("SMALL");
  const [weight, setWeight] = useState(2);
  const [priority, setPriority] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [email, setEmail] = useState("");
  const [paymentState, setPaymentState] = useState<"IDLE" | "LOADING" | "ERROR">("IDLE");
  const [paymentError, setPaymentError] = useState("");
  const distance = pickup && dropoff ? 4.2 : 0;
  const vehicle = selectVehicle({ distanceKm: distance, weightKg: weight, size });
  const quote = useMemo(() => calculatePrice(
    { distanceKm: distance, vehicle, priority },
    { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: vehicle === "BICYCLE" ? 9000 : 10000, expressMultiplierBps: 14000 },
  ), [distance, priority, vehicle]);

  const canContinue = step > 0 || Boolean(pickup && dropoff);
  async function startPayment() {
    setPaymentState("LOADING"); setPaymentError("");
    const storedKey = sessionStorage.getItem("kdeliver-checkout-key") ?? crypto.randomUUID();
    sessionStorage.setItem("kdeliver-checkout-key", storedKey);
    try {
      const response = await fetch("/api/v1/payments/initialize", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": storedKey }, body: JSON.stringify({ email, idempotencyKey: storedKey, distanceKm: distance, vehicle, priority }) });
      const body = await response.json();
      if (!response.ok || !body.data?.authorizationUrl) throw new Error(body.error?.message ?? "Unable to start payment");
      window.location.assign(body.data.authorizationUrl);
    } catch (error) { setPaymentState("ERROR"); setPaymentError(error instanceof Error ? error.message : "Unable to start payment"); }
  }
  return <main className="flow-shell">
    <header className="flow-header"><Link href="/" aria-label="Back home"><ArrowLeft/></Link><span className="brand"><span>K</span> K-Deliver</span><span className="secure">Secure booking</span></header>
    <div className="progress" aria-label={`Step ${step + 1} of 4`}>{stages.map((label, index) => <div className={index <= step ? "active" : ""} key={label}><i/><span>{label}</span></div>)}</div>
    <section className="flow-card">
      {step === 0 && <>
        <p className="kicker">LET’S GET MOVING</p><h1>Where are we going?</h1><p className="intro">Tell us where to pick up and where it needs to go.</p>
        <label className="location-field"><i className="pickup-dot"/><span>Pickup address</span><input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. Barnawa Shopping Complex"/><MapPin/></label>
        <div className="route-line"/>
        <label className="location-field"><i className="dropoff-dot"/><span>Drop-off address</span><input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="e.g. Ahmadu Bello Way, CBD"/><Navigation/></label>
        <p className="location-help"><Phone size={15}/> You’ll add contact details and landmarks next.</p>
      </>}
      {step === 1 && <>
        <p className="kicker">PACKAGE DETAILS</p><h1>What are we carrying?</h1><p className="intro">This helps us choose the right rider and vehicle.</p>
        <label className="text-field"><span>Package type</span><select><option>Documents</option><option>Food</option><option>Medicine</option><option>Parcel</option><option>Other</option></select></label>
        <div className="choice-grid">{["SMALL", "MEDIUM", "LARGE"].map(option => <button className={size === option ? "selected" : ""} onClick={() => setSize(option)} key={option}><Package/><strong>{option.toLowerCase()}</strong></button>)}</div>
        <label className="text-field"><span>Approximate weight (kg)</span><input type="number" min="0.1" max="100" value={weight} onChange={e => setWeight(Number(e.target.value))}/></label>
      </>}
      {step === 2 && <>
        <p className="kicker">DELIVERY SPEED</p><h1>Choose your option</h1><p className="intro">Both options include live tracking and proof of delivery.</p>
        <button className={`option-card ${priority === "STANDARD" ? "selected" : ""}`} onClick={() => setPriority("STANDARD")}><Bike/><span><strong>Standard</strong><small>25–35 min · Best value</small></span><b>{formatNaira(calculatePrice({distanceKm: distance, vehicle, priority: "STANDARD"}, { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: 9000, expressMultiplierBps: 14000 }).totalKobo)}</b></button>
        <button className={`option-card ${priority === "EXPRESS" ? "selected" : ""}`} onClick={() => setPriority("EXPRESS")}><Zap/><span><strong>Express</strong><small>18–25 min · Priority matching</small></span><b>{formatNaira(calculatePrice({distanceKm: distance, vehicle, priority: "EXPRESS"}, { baseFeeKobo: 50000, perKmKobo: 12000, minimumFeeKobo: 60000, vehicleMultiplierBps: 9000, expressMultiplierBps: 14000 }).totalKobo)}</b></button>
      </>}
      {step === 3 && <>
        <p className="kicker">REVIEW DELIVERY</p><h1>Ready to send</h1><div className="summary-route"><div><i className="pickup-dot"/><span>Pickup<strong>{pickup}</strong></span></div><div><i className="dropoff-dot"/><span>Drop-off<strong>{dropoff}</strong></span></div></div>
        <div className="recommendation"><Bike/><span><small>RECOMMENDED</small><strong>{vehicle.toLowerCase()}</strong></span><span>{distance} km<br/><small>25–35 min</small></span></div>
        <div className="price-breakdown"><div><span>Delivery</span><strong>{formatNaira(quote.totalKobo)}</strong></div><div className="total"><span>Total</span><strong>{formatNaira(quote.totalKobo)}</strong></div></div>
        <label className="text-field checkout-email"><span>Payment receipt email</span><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"/></label>
        {paymentError && <p className="payment-error" role="alert">{paymentError}</p>}
        <button disabled={paymentState === "LOADING" || !email.includes("@")} onClick={startPayment} className="payment-button">{paymentState === "LOADING" ? "Connecting to Paystack…" : "Pay securely with Paystack"} <ArrowRight/></button><p className="dev-note">Your payment is verified by the server. K-Deliver never receives your card details.</p>
      </>}
      <div className="flow-actions">{step > 0 && <button className="secondary" onClick={() => setStep(step - 1)}>Back</button>}{step < 3 && <button disabled={!canContinue} className="primary-action" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={19}/></button>}</div>
    </section>
  </main>;
}
