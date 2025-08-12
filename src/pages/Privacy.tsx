import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Privacy Policy | Red Square"
        description="Read Red Square's Privacy Policy covering data collection, use, retention, and your rights."
        path="/privacy"
      />
      <header className="bg-secondary/30 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">Last updated: August 12, 2025</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="text-muted-foreground">
            Red Square ("we", "us", "our") provides a platform that connects screen owners with
            broadcasters who want to display content on digital screens. This Privacy Policy explains how we
            collect, use, disclose, and protect your information when you use our websites, apps, TV dongle,
            and related services (collectively, the "Services").
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              Account Data: name, email address, password hashes, authentication tokens, roles, and profile details.
            </li>
            <li>
              Transaction Data: booking history, pricing, payouts, and payment status (processed by our payment
              processors; we do not store full card details).
            </li>
            <li>
              Device and Usage Data: IP address, device identifiers, app version, diagnostic logs, screen/dongle
              IDs, and performance metrics.
            </li>
            <li>
              Location Data: approximate or precise location when you enable location services to discover nearby screens.
            </li>
            <li>
              Content Data: media uploads (e.g., images, videos, GIFs) and associated metadata necessary for broadcast scheduling.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide, maintain, and improve the Services</li>
            <li>Process bookings, payments, and payouts</li>
            <li>Enable screen discovery, scheduling, and content delivery</li>
            <li>Detect, prevent, and respond to fraud, abuse, and policy violations</li>
            <li>Send transactional messages (e.g., confirmations, receipts, alerts)</li>
            <li>Comply with legal obligations and enforce our Terms</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Legal Bases (EEA/UK)</h2>
          <p className="text-muted-foreground">
            We rely on performance of a contract, legitimate interests, compliance with legal obligations, and your
            consent (where applicable, e.g., for certain cookies/marketing) as our lawful bases for processing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Sharing of Information</h2>
          <p className="text-muted-foreground">
            We may share information with service providers (e.g., cloud hosting, analytics, payment processors),
            screen owners and broadcasters to fulfill bookings, and as required by law. We do not sell personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Data Retention</h2>
          <p className="text-muted-foreground">
            We retain information as long as needed to provide the Services, comply with legal obligations, resolve
            disputes, and enforce agreements. Retention periods vary by data type and context.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">International Transfers</h2>
          <p className="text-muted-foreground">
            We may transfer, store, and process information in countries outside your own. Where required, we use
            appropriate safeguards (e.g., Standard Contractual Clauses).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access, correct, or delete your personal information</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="text-muted-foreground">
            You can exercise these rights by contacting us using the details below. We may need to verify your identity
            before fulfilling requests.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Children's Privacy</h2>
          <p className="text-muted-foreground">
            Our Services are not directed to children under 13, and we do not knowingly collect personal data from them.
            If you believe a child has provided us personal data, please contact us so we can take appropriate action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. We will post the updated version on this page and update
            the "Last updated" date above. Significant changes may be communicated via email or in-app notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p className="text-muted-foreground">
            Email: hello@redsquare.app • Phone: (215) 397-5797 • Location: San Francisco, CA
          </p>
        </section>
      </main>
    </div>
  );
}
