import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const features = [
  "Unlimited boards",
  "Unlimited goals",
  "Unlimited records",
  "Visual progress tracking",
  "Recurring goals",
  "Public board sharing",
  "Embeddable widgets",
  "API access",
  "Real-time updates",
  "Lifetime access",
  "All future updates",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, One-Time Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay once, use forever. No subscriptions, no hidden fees, no limits.
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge>Lifetime Deal</Badge>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">GoalTrack Pro</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/pricing">Get Started Now</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
