import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Goals",
    description:
      "Set up your goals in seconds. Add a target amount, optional due date, and choose a color. Goals can be one-time or recurring.",
  },
  {
    number: "02",
    title: "Track Your Progress",
    description:
      "Add records as you make progress. Each entry updates your progress bar instantly. See exactly how close you are to your target.",
  },
  {
    number: "03",
    title: "Achieve & Celebrate",
    description:
      "Watch your progress bars fill up. When you hit 100%, celebrate your achievement! Surpass your goals and see the overflow.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. Create goals, track progress, achieve
            results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
              )}
              <div className="relative bg-background rounded-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-muted/50 rounded-lg p-6 md:p-8">
            <h3 className="font-semibold text-xl mb-4 text-center">
              Perfect For
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Saving for a big purchase",
                "Paying off debt",
                "Fitness and health goals",
                "Reading challenges",
                "Learning new skills",
                "Business milestones",
                "Daily habits",
                "Annual targets",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
