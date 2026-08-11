"use client";

import Link from "next/link";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Verification() {
  const reference = useSearchParams().get("reference");
  const [state, setState] = useState<"VERIFYING" | "SUCCEEDED" | "FAILED">(reference ? "VERIFYING" : "FAILED");
  const [message, setMessage] = useState(reference ? "Confirming your payment securely with Paystack." : "The payment reference is missing.");
  useEffect(() => {
    if (!reference) return;
    fetch(`/api/v1/payments/verify?reference=${encodeURIComponent(reference)}`)
      .then(async response => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => {
        if (ok && body.data?.status === "SUCCEEDED") { setState("SUCCEEDED"); setMessage("Paystack confirmed your payment securely."); }
        else { setState("FAILED"); setMessage(body.error?.message ?? "Paystack did not confirm this payment."); }
      }).catch(() => { setState("FAILED"); setMessage("We could not verify the payment. Your account has not been marked as paid."); });
  }, [reference]);
  return <section className="payment-result">
    {state === "VERIFYING" ? <LoaderCircle className="spin"/> : state === "SUCCEEDED" ? <CheckCircle2 className="paid"/> : <TriangleAlert className="failed"/>}
    <p className="kicker">{state === "VERIFYING" ? "VERIFYING PAYMENT" : state === "SUCCEEDED" ? "PAYMENT CONFIRMED" : "PAYMENT NOT CONFIRMED"}</p>
    <h1>{state === "VERIFYING" ? "One moment…" : state === "SUCCEEDED" ? "You’re all set" : "Payment needs attention"}</h1><p>{message}</p>
    {reference && <code>{reference}</code>}
    <Link className="primary-action" href={state === "SUCCEEDED" ? "/" : "/send"}>{state === "SUCCEEDED" ? "Return home" : "Return to delivery"}</Link>
  </section>;
}

export default function PaymentCallbackPage() { return <main className="payment-shell"><Suspense fallback={null}><Verification/></Suspense></main>; }
