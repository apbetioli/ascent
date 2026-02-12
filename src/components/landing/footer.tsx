"use client";

import { APP_NAME } from "@/lib/app-name";
import Link from "next/link";
import { AscentIcon } from "@/components/ui/ascent-icon";

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="border-t border-border/50 py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight"
            >
              <AscentIcon className="h-5 w-5" />
              <span>{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Reach your goals. A simple, beautiful way to track progress and
              reach new heights.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Product</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Legal</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Support</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "contact@apbetioli.dev"}`}
                  className="hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
