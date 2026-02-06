import { APP_NAME } from "@/lib/app-name";

const testimonials = [
  {
    name: "Sarah Chen",
    handle: "@sarahchen_dev",
    role: "Software Engineer",
    get content() {
      return `I've tried so many goal tracking apps, but ${APP_NAME} is the first one that actually stuck. The visual progress bars are incredibly motivating!`;
    },
    initials: "SC",
  },
  {
    name: "Marcus Johnson",
    handle: "@marcusj_finance",
    role: "Personal Finance Blogger",
    content:
      "The ability to embed goal widgets on my blog is amazing. My readers love seeing my real-time savings progress. The API is a game-changer too.",
    initials: "MJ",
  },
  {
    name: "Emily Rodriguez",
    handle: "@emrod_fitness",
    role: "Fitness Coach",
    get content() {
      return `I use ${APP_NAME} with all my clients. The recurring goals feature is perfect for weekly fitness targets. They share boards with me for accountability.`;
    },
    initials: "ER",
  },
  {
    name: "Alex Kim",
    handle: "@alexk_builds",
    role: "Indie Hacker",
    get content() {
      return `Public boards changed the game for me. I share my revenue goals publicly and it keeps me accountable. ${APP_NAME} is a must-have for builders.`;
    },
    initials: "AK",
  },
  {
    name: "Priya Sharma",
    handle: "@priyareads",
    role: "Book Club Organizer",
    content:
      "Our book club uses the recurring monthly goals to track reading challenges. The public board feature makes it so fun to see everyone's progress!",
    initials: "PS",
  },
  {
    name: "David Okonkwo",
    handle: "@david_oko",
    role: "Startup Founder",
    content:
      "The API integration with my dashboard is seamless. I track KPIs automatically and the real-time updates mean my team always sees fresh data.",
    initials: "DO",
  },
];

// Double the array for seamless marquee
const row1 = testimonials.slice(0, 3);
const row2 = testimonials.slice(3, 6);

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <div className="w-[340px] shrink-0 bg-card border border-border/50 rounded-2xl p-6 mx-3 hover:border-purple-500/30 transition-colors">
      <p className="text-sm text-foreground/90 leading-relaxed mb-5">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 dark:bg-purple-500/15 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400">
          {testimonial.initials}
        </div>
        <div>
          <p className="font-semibold text-sm">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-14">
        <div className="text-center">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3 tracking-wide uppercase">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Loved by{" "}
            <span className="text-gradient">goal-setters</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands who are crushing their targets with {APP_NAME}.
          </p>
        </div>
      </div>

      {/* Scrolling marquee rows */}
      <div className="space-y-6 hover-pause">
        {/* Row 1 - scrolls left */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-marquee">
            {[...row1, ...row1, ...row1, ...row1].map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>

        {/* Row 2 - scrolls right */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-marquee-reverse">
            {[...row2, ...row2, ...row2, ...row2].map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
