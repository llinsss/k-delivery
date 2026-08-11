import Link from "next/link";
import { ArrowRight, Bike, Clock3, MapPin, ShieldCheck } from "lucide-react";

const faqs = [
  { category: "Getting started", question: "What is K-Deliver?", answer: "K-Deliver is Kaduna’s open delivery network. It connects people and businesses that need deliveries with verified independent riders, bicycle couriers, motorcycle riders, merchant fleets and existing logistics companies. K-Deliver provides the shared pricing, dispatch, tracking, payment and operations layer." },
  { category: "Getting started", question: "How do I send something?", answer: "Choose “Send something”, enter the pickup and destination, add contact and package information, then select Standard or Express. K-Deliver calculates the route, recommends a suitable vehicle, shows the price and ETA, and only begins matching after the required payment is confirmed." },
  { category: "Fulfillment", question: "Do I choose a rider or delivery company?", answer: "No. You choose the delivery service and priority. The network selects an eligible rider or provider using vehicle suitability, proximity, availability, ETA, reliability and current workload. You will see fulfillment details after assignment." },
  { category: "Fulfillment", question: "When will K-Deliver use a bicycle or motorcycle?", answer: "For suitable packages and journeys of roughly 5 km or less, the network prefers bicycles. Medium-distance deliveries generally favour motorcycles, while long, heavy or bulky deliveries may require a car, van or partner provider. These are configurable rules, not permanent distance cut-offs." },
  { category: "Pricing", question: "How is the delivery price calculated?", answer: "The quote combines a base fee, route distance, recommended vehicle and delivery priority. Waiting, cancellation, handling or zone adjustments may apply when relevant. You will see the total before payment; K-Deliver does not hide a separate rider fee at checkout." },
  { category: "Payments", question: "How can I pay, and is payment secure?", answer: "Online payments are processed through the configured Nigerian payment provider, starting with Paystack. Card or bank details are entered on the provider’s secure checkout—not stored by K-Deliver. The server independently verifies the transaction before treating a delivery as paid." },
  { category: "Tracking", question: "Can the recipient track without creating an account?", answer: "Yes. Every confirmed delivery receives a shareable link such as /track/KD-XXXXXX. The page shows confirmed lifecycle events, route details, ETA and assigned rider information where appropriate. Access to precise live location is limited to authorized delivery participants." },
  { category: "Tracking", question: "What happens after I confirm a delivery?", answer: "After payment verification, the delivery enters the dispatch queue. An eligible rider or provider receives an offer, accepts it, travels to pickup, confirms collection, moves to the destination and completes proof of delivery. Each valid status change is recorded in the delivery history." },
  { category: "Safety", question: "How is successful delivery confirmed?", answer: "The standard proof is a recipient PIN. The rider enters the PIN supplied to the recipient, and K-Deliver can also record a photo, timestamp and GPS position. Stronger verification can be required for sensitive or high-value packages." },
  { category: "Support", question: "What if no rider is immediately available?", answer: "The dispatch engine can expand its search across eligible independent riders and partner providers. You will see that the network is still searching rather than being shown a fake assignment. If the delivery cannot be fulfilled within its operating window, it moves to a clear failed or expired outcome and support can assist." },
  { category: "Support", question: "Can I cancel a delivery?", answer: "Cancellation depends on the delivery stage. Early cancellation is generally possible before pickup. Once a rider has travelled, waited or collected the package, restrictions and a configurable cancellation fee may apply. The app shows the applicable outcome before cancellation is confirmed." },
  { category: "Merchants", question: "How does K-Deliver work for merchants?", answer: "Merchants receive a dedicated workspace for recurring delivery creation, saved pickup points, delivery history, spending, tracking links and operational status. Higher-volume businesses can later connect directly through the merchant API rather than entering every order manually." },
  { category: "Providers", question: "Can an existing Kaduna logistics company join?", answer: "Yes. A company can use K-Deliver’s wider rider network, use the infrastructure with its own fleet, or operate as a hybrid and draw on network capacity during overflow. Provider applications are reviewed before dashboards, API credentials or job access are activated." },
  { category: "Providers", question: "Will a logistics partner lose control of its riders or customers?", answer: "No. Infrastructure-only partners retain their riders and customer relationships while using dispatch, tracking, APIs, webhooks and performance tools. The selected operating model determines whether jobs stay with the partner fleet, use network capacity, or combine both." },
  { category: "Riders", question: "How do riders receive delivery jobs?", answer: "A verified rider goes online and shares current availability. The matching service considers location, vehicle, reliability and workload before sending a time-limited offer. Riders can accept or decline; ignored and expired offers return to dispatch for another eligible candidate." },
  { category: "Coverage", question: "Where does K-Deliver currently operate?", answer: "The first operating market is Kaduna metropolis. Zones such as CBD, Barnawa, Kakuri, Malali, Kawo, Sabon Tasha and others are configurable according to active launch coverage. Enter your route to confirm availability rather than assuming every Kaduna State location is supported." },
  { category: "Packages", question: "What can I send?", answer: "Common deliveries include documents, food, medicine, clothing, groceries, gifts and ordinary parcels that fit the selected vehicle’s capacity. Prohibited, illegal, hazardous, inadequately packaged or undisclosed high-risk items are not accepted." },
  { category: "Addressing", question: "What if my address is difficult to describe?", answer: "Add a landmark, building description, recipient phone number and accurate map position. Saved delivery points can receive a Kaduna delivery code such as KD-BNW-48291, helping riders locate repeat destinations with fewer phone calls." },
];

const recent = [
  { id: "KD-7F2K9A", route: "Barnawa → CBD", status: "Delivered", date: "Yesterday" },
  { id: "KD-4M8Q2C", route: "Malali → Kawo", status: "Delivered", date: "6 Aug" },
];

export default function CustomerHome() {
  return (
    <main className="customer-shell">
      <header className="topbar">
        <Link className="brand" href="/"><span>K</span> K-Deliver</Link>
        <div className="home-nav"><Link href="/business">For business</Link><button className="avatar" aria-label="Open profile">AO</button></div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="pulse" /> Delivering across Kaduna</div>
        <h1>Send something.<br/><em>We’ll handle the road.</em></h1>
        <p>Fast, reliable delivery powered by trusted riders and logistics partners across Kaduna.</p>
        <Link className="primary-action" href="/send">Send something <ArrowRight size={20} /></Link>
        <div className="trust-row">
          <span><Clock3 size={17}/> Under 60 seconds to book</span>
          <span><ShieldCheck size={17}/> Every delivery tracked</span>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading"><div><p className="kicker">YOUR DELIVERIES</p><h2>Recent activity</h2></div><Link href="/deliveries">View all</Link></div>
        <div className="delivery-list">
          {recent.map((delivery) => (
            <Link className="delivery-row" href={`/track/${delivery.id}`} key={delivery.id}>
              <div className="delivery-icon"><Bike size={20}/></div>
              <div className="delivery-main"><strong>{delivery.route}</strong><span>{delivery.id} · {delivery.date}</span></div>
              <span className="status success">{delivery.status}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="faq-intro"><p className="kicker">HOW THE NETWORK WORKS</p><h2>Questions, answered clearly.</h2><p>Whether you are sending one parcel, running a shop, riding for a living or connecting an existing delivery company, these are the essentials.</p><Link href="/business">Explore business options <ArrowRight size={16}/></Link></div>
        <div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary><span><small>{faq.category}</small>{faq.question}</span><i aria-hidden="true"/></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="network-strip">
        <div><MapPin size={22}/><span><strong>Kaduna-first</strong>Local riders. Local knowledge.</span></div>
        <p>Bicycles, motorcycles and trusted delivery partners—one connected network.</p>
      </section>
    </main>
  );
}
