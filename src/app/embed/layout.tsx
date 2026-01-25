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
    <div className="bg-transparent">
      {children}
    </div>
  );
}
