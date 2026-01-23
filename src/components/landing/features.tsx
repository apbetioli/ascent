import {
  Target,
  TrendingUp,
  Calendar,
  Share2,
  Code,
  Zap,
  Repeat,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Visual Progress Tracking",
    description:
      "Beautiful progress bars and charts that update in real-time as you make progress toward your goals.",
  },
  {
    icon: TrendingUp,
    title: "Forward & Reverse Goals",
    description:
      "Track goals that grow (savings) or shrink (paying off debt) with intuitive visual feedback.",
  },
  {
    icon: Repeat,
    title: "Recurring Goals",
    description:
      "Set daily, weekly, monthly, or yearly recurring goals. Progress resets automatically each period.",
  },
  {
    icon: Calendar,
    title: "Deadlines & Reminders",
    description:
      "Set deadlines for your goals and see how many days are left. Never miss a target date.",
  },
  {
    icon: Share2,
    title: "Public Boards",
    description:
      "Share your progress publicly with a unique link. Perfect for accountability or showing off achievements.",
  },
  {
    icon: Code,
    title: "Embeddable Widgets",
    description:
      "Embed goal widgets on your website or blog. Show your progress anywhere with a simple iframe.",
  },
  {
    icon: Zap,
    title: "API Access",
    description:
      "Update goals via API for automation. Connect with Zapier, scripts, or any tool that makes HTTP requests.",
  },
  {
    icon: Globe,
    title: "Real-time Updates",
    description:
      "See changes instantly across all devices. Update from your phone and see it on your desktop immediately.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features wrapped in a simple, beautiful interface. Track
            any goal, any way you want.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
