import "../globals.css";

export const metadata = {
  robots: "noindex, nofollow",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Allow iframe embedding */}
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
      </head>
      <body className="bg-transparent" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
