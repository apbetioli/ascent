import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <h2 className="text-2xl font-bold">Terms</h2>
      </main>
      <Footer />
    </div>
  );
}
