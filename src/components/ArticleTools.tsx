"use client";

import { useEffect, useRef, useState } from "react";

export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState<"" | "yes" | "no">("");
  const link = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("yes");
    } catch {
      setCopied("no");
    }
    setTimeout(() => setCopied(""), 3000);
  }

  return (
    <section className="share" aria-label="Share this story">
      <h2 className="share__title">Share</h2>
      <div className="share__row">
        <button type="button" onClick={copy}>
          Copy link
        </button>
        <a href={`mailto:?subject=${text}&body=${link}`}>
          Email<span className="visually-hidden"> this story</span>
        </a>
        <a href={`https://wa.me/?text=${text}%20${link}`} target="_blank" rel="noopener noreferrer">
          WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        <a
          href={`https://x.com/intent/post?text=${text}&url=${link}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          X<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </div>
      <p className="meta" role="status" style={{ minHeight: "1.3em" }}>
        {copied === "yes" ? "Link copied." : copied === "no" ? "Couldn't copy. Copy the address from your browser." : ""}
      </p>
    </section>
  );
}

/** A thin bar for long reads only. Photo-led features don't need it. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = document.querySelector<HTMLElement>("[data-article-body]");
      if (!article || !bar.current) return;
      const box = article.getBoundingClientRect();
      const span = box.height - window.innerHeight;
      const ratio = span <= 0 ? 1 : Math.min(1, Math.max(0, -box.top / span));
      bar.current.style.setProperty("--progress", ratio.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={bar} className="progress" aria-hidden="true" />;
}
