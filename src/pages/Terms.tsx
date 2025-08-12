import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Terms of Service | Red Square"
        description="Read Red Square's Terms of Service governing use of our broadcasting and screen marketplace platform."
        path="/terms"
      />
      <header className="bg-secondary/30 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="mt-2 text-muted-foreground">Last updated: August 12, 2025</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using Red Square, you agree to be bound by these Terms of Service ("Terms"). If you do not
            agree, do not use the Services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Accounts and Eligibility</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>You must be at least 18 years old and capable of forming a binding contract.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activity under your account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Platform Use</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Broadcasters may upload content and schedule broadcasts on available screens.</li>
            <li>Screen owners may list screens, set availability and pricing, and receive payouts.</li>
            <li>We may suspend or terminate accounts for violations of these Terms or applicable law.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Payments, Fees, and Refunds</h2>
          <p className="text-muted-foreground">
            Payments are processed by third-party providers. The platform may charge a service fee. Except where required
            by law or our explicit refund policy, completed broadcasts are non-refundable. If a screen fails to deliver
            a paid broadcast due to verified downtime, you may be eligible for credit or refund at our discretion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Content Standards</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>No illegal, infringing, hateful, harassing, or pornographic content.</li>
            <li>No content that violates third-party rights, including IP and privacy rights.</li>
            <li>No malware, spam, or deceptive practices.</li>
            <li>We may review, moderate, or remove content that violates these standards.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Screen Owner Obligations</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Maintain operational uptime to the best of your ability.</li>
            <li>Comply with local regulations and venue rules for public display.</li>
            <li>Display booked content as scheduled unless force majeure or safety concerns apply.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
          <p className="text-muted-foreground">
            Except for user content, all materials are owned by Red Square or its licensors and protected by
            intellectual property laws. You may not copy, modify, or create derivative works without permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Disclaimers and Limitation of Liability</h2>
          <p className="text-muted-foreground">
            The Services are provided "as is" without warranties of any kind. To the fullest extent permitted by law,
            Red Square disclaims all implied warranties, and is not liable for indirect, incidental, or consequential
            damages. Our aggregate liability is limited to the amounts you paid to us in the 12 months preceding the
            claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Indemnification</h2>
          <p className="text-muted-foreground">
            You agree to defend, indemnify, and hold harmless Red Square and its affiliates from any claims arising
            from your use of the Services or violation of these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Termination</h2>
          <p className="text-muted-foreground">
            We may suspend or terminate your access at any time for any reason. You may stop using the Services at any
            time. Some provisions survive termination (e.g., IP, disclaimers, limitations, indemnity).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws of the State of California, without regard to conflict of law rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p className="text-muted-foreground">
            Questions about these Terms? Email: hello@redsquare.app • Phone: (215) 397-5797
          </p>
          <p className="text-sm text-muted-foreground">
            See also our <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/cookies" className="underline">Cookie Policy</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
