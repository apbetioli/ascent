import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GoalTrack - Track Your Goals, Achieve Your Dreams",
    template: "%s | GoalTrack",
  },
  description:
    "A beautiful and simple goal tracking app. Set goals, track progress, and achieve your dreams with visual progress bars and smart reminders.",
  keywords: [
    "goal tracking",
    "habit tracker",
    "progress tracker",
    "goal setting",
    "productivity",
    "personal finance",
    "savings goals",
  ],
  authors: [{ name: "GoalTrack" }],
  creator: "GoalTrack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "GoalTrack - Track Your Goals, Achieve Your Dreams",
    description:
      "A beautiful and simple goal tracking app. Set goals, track progress, and achieve your dreams.",
    siteName: "GoalTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoalTrack - Track Your Goals, Achieve Your Dreams",
    description:
      "A beautiful and simple goal tracking app. Set goals, track progress, and achieve your dreams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
