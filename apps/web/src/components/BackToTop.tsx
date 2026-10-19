"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
export default function BackToTop({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const f = () => setShow(window.scrollY > 900); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  if (!show) return null;
  return (
    <button type="button" className="ndf-btn ndf-btn--secondary ndf-btn--sm" style={{ position: "fixed", right: "1rem", bottom: "1rem", zIndex: 50, background: "var(--surface-card)" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={label}>
      <Icon name="arrow-up" /> {label}
    </button>
  );
}
