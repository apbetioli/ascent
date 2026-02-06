"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this a one-time payment or a subscription?",
    get answer() {
      return `One-time payment. You pay once and get lifetime access to all features, including future updates. No recurring charges, ever.`;
    },
  },
  {
    question: "What types of goals can I track?",
    answer:
      "You can track any goal with a numerical target: savings goals, debt payoff, fitness targets, reading challenges, learning hours, business metrics, and more. Goals can be one-time or recurring (daily, weekly, monthly, yearly).",
  },
  {
    question: "How do recurring goals work?",
    answer:
      "Each time you update the progress of a recurring goal, a record is created. Records older than the current period don't count toward progress. For example, in a weekly goal, records older than 7 days don't count toward progress.",
  },
  {
    question: "Can I share my goals publicly?",
    answer:
      "Yes! You can make any board public, which generates a unique shareable link. Anyone with the link can view your goals and progress. You can also embed individual goal widgets on your website.",
  },
  {
    question: "Is there a mobile app?",
    get answer() {
      return `This is a web app that works great on mobile browsers. Add it to your home screen for an app-like experience.`;
    },
  },
  {
    question: "What happens if I need a refund?",
    get answer() {
      return `We offer a 30-day money-back guarantee. If you're not satisfied for any reason, just contact us and we'll refund your purchase, no questions asked.`;
    },
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3 tracking-wide uppercase">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Got questions?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;ve got answers. If you don&apos;t see yours here,{" "}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@goaltrack.app"}`}
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              reach out
            </a>
            .
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/50"
              >
                <AccordionTrigger className="text-left text-base hover:no-underline hover:text-purple-600 dark:hover:text-purple-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
