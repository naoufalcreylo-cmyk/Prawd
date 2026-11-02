import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/Forms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send PRAWD a story idea, a photography portfolio or a correction.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="h-mega">Contact</h1>
        <p className="deck">Story ideas, photography and corrections. We read everything that&rsquo;s about football.</p>
      </header>
      <div className="g12 page-copy">
        <div className="page-copy__body">
          <ContactForm />
          <p className="meta" style={{ marginTop: 24 }}>
            We use what you send only to reply. See the <Link href="/privacy" style={{ textDecoration: "underline" }}>privacy page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
