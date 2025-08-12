import SEO from "@/components/SEO";

export default function Cookies() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Cookie Policy | Red Square"
        description="Learn how Red Square uses cookies and similar technologies and how you can manage your preferences."
        path="/cookies"
      />
      <header className="bg-secondary/30 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
          <p className="mt-2 text-muted-foreground">Last updated: August 12, 2025</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">What Are Cookies?</h2>
          <p className="text-muted-foreground">
            Cookies are small text files placed on your device to store data that can be retrieved by a web server in the
            domain that placed the cookie. We also use similar technologies like local storage and pixels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Essential: required for core functionality (authentication, security, network management).</li>
            <li>Performance/Analytics: help us understand usage to improve our Services.</li>
            <li>Functional: remember preferences and settings.</li>
            <li>Advertising: may be used to deliver relevant ads or measure campaign performance.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">How We Use Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies to authenticate users, keep sessions, remember preferences, analyze performance, and facilitate
            secure payments and bookings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Managing Cookies</h2>
          <p className="text-muted-foreground">
            You can manage cookies via your browser settings. Disabling certain cookies may impact site functionality.
            For more information, consult your browser's help documentation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Changes</h2>
          <p className="text-muted-foreground">
            We may update this Cookie Policy periodically. We will post updates on this page and revise the date above.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p className="text-muted-foreground">Email: hello@redsquare.app • Phone: (215) 397-5797</p>
        </section>
      </main>
    </div>
  );
}
