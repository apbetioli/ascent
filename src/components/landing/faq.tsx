"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_NAME } from "@/lib/app-name";

const faqs = [
  {
    question: "Is this a one-time payment or a subscription?",
    get answer() {
      return `${APP_NAME} is a one-time payment. You pay once and get lifetime access to all features, including future updates. No recurring charges, ever.`;
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
      "Recurring goals reset their progress at the start of each period. For example, a monthly savings goal resets on the 1st of each month. Records older than the current period don't count toward progress.",
  },
  {
    question: "Can I share my goals publicly?",
    answer:
      "Yes! You can make any board public, which generates a unique shareable link. Anyone with the link can view your goals and progress. You can also embed individual goal widgets on your website.",
  },
  {
    question: "What's the API for?",
    answer:
      "The API lets you update your goals programmatically. You can connect it to automation tools like Zapier, write scripts to log progress automatically, or integrate it with other apps you use.",
  },
  {
    question: "Is there a mobile app?",
    get answer() {
      return `${APP_NAME} is a web app that works great on mobile browsers. Add it to your home screen for an app-like experience. We're considering native apps based on user demand.`;
    },
  },
  {
    question: "What happens if I need a refund?",
    get answer() {
      return `We offer a 30-day money-back guarantee. If you're not satisfied with ${APP_NAME} for any reason, just contact us and we'll refund your purchase, no questions asked.`;
    },
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, your data is stored securely using industry-standard encryption. We use Supabase for our database, which provides enterprise-grade security. Your payment is processed securely through Stripe.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
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
