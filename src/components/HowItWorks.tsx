import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HowItWorks = () => {
  const handlePrimaryCTA = () => {
    window.location.href = "mailto:founders@redsquare.app?subject=Red%20Square%20Early%20Access";
  };

  return (
    <section id="how-it-works" className="container py-16 md:py-24">
      <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>1. Register</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Create a Red Square account. Use it as a broadcaster or owner anytime.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>2. Connect</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Owners connect their screen and verify it. Each screen gets a unique ID.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3. Book & broadcast</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Broadcasters pick a slot, upload media, and it plays on time—every time.
          </CardContent>
        </Card>
      </div>
      <div className="mt-10 flex gap-3">
        <Button variant="hero" onClick={handlePrimaryCTA}>Get early access</Button>
        <Button variant="outline" asChild>
          <a href="mailto:founders@redsquare.app?subject=Partner%20with%20Red%20Square">Partner with us</a>
        </Button>
      </div>
    </section>
  );
};

export default HowItWorks;
