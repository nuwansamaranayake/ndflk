"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function NavToggle({ label, closeLabel }: { label: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const nav = document.getElementById("site-nav");
    if (nav) nav.setAttribute("data-open", open ? "true" : "false");
  }, [open]);
  return (
    <button type="button" className="ndf-header__toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
      <Icon name={open ? "x" : "menu"} /> {open ? closeLabel : label}
    </button>
  );
}
