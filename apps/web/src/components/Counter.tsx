"use client";
import { useEffect, useRef, useState } from "react";
// Renders the real value on the server. On the client, counts up once the stat scrolls into view. Non-numeric values render as given.
export default function Counter({ value }: { value: string }) {
  const m = /^([^\d]*)(\d[\d,]*)([^\d]*)$/.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<string>(value);
  useEffect(() => {
    if (!m || !ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = Number(m[2].replace(/,/g, "")); const pre = m[1]; const post = m[3];
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(); const dur = 900;
      const tick = (t: number) => { const p = Math.min(1, (t - start) / dur); const eased = 1 - Math.pow(1 - p, 3); setShown(`${pre}${Math.round(target * eased).toLocaleString("en")}${post}`); if (p < 1) requestAnimationFrame(tick); else setShown(value); };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref}>{shown}</span>;
}
