import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What PRAWD does with the information you give it. Draft pending owner review.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1 className="h-mega">Privacy</h1>
      </header>
      <div className="g12 page-copy">
        <div className="page-copy__body legal">
          <p className="notice" style={{ fontFamily: "var(--sans)", fontSize: "0.875rem" }}>
            <strong>Draft.</strong> This text describes how the preview site is built. It has not been reviewed by a
            lawyer. The owner must review it, and add the publisher&rsquo;s legal identity and contact details, before
            launch.
          </p>
          <h2>What this site collects</h2>
          <p>
            PRAWD has no accounts, advertising, analytics or tracking cookies. Fonts and images are served from this
            site. The only personal information we receive is what you choose to send through a form.
          </p>
          <h2>Newsletter</h2>
          <p>
            If you subscribe, your email address is sent to our newsletter provider, Buttondown, so we can send you the
            newsletter. You can unsubscribe using the link in any issue. While the newsletter isn&rsquo;t connected,
            the form tells you so and your address isn&rsquo;t stored.
          </p>
          <h2>Contact form</h2>
          <p>
            Your name, email address and message are delivered to our inbox through an email provider, Resend, so we can
            reply. While the form isn&rsquo;t connected, it tells you so and nothing is sent or stored.
          </p>
          <h2>Sharing links</h2>
          <p>
            The WhatsApp and X links on articles take you to those services, whose own privacy policies then apply.
            Nothing is sent to them unless you use the link.
          </p>
          <h2>Hosting</h2>
          <p>
            Like any website, the hosting provider may keep short-lived technical logs, including IP addresses, for
            security and reliability. [Owner: name the host and retention period once it is chosen.]
          </p>
          <h2>Your rights and questions</h2>
          <p>
            You can ask us what we hold about you, and ask us to correct or delete it, through the{" "}
            <Link href="/contact">contact page</Link>. [Owner: add the publisher&rsquo;s legal name, address and any
            rights specific to your jurisdiction.]
          </p>
        </div>
      </div>
    </div>
  );
}
