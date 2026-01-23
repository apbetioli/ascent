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
    <html lang="en">
      <head>
        {/* Allow iframe embedding */}
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
      </head>
      <body className="bg-transparent">{children}</body>
    </html>
  );
}
