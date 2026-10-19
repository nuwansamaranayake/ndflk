// Lucide icon subset (ISC licence), inlined. 24 grid, 2px stroke, currentColor.
const paths: Record<string, string> = {
  "arrow-right": "M5 12h14M12 5l7 7-7 7",
  "external-link": "M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  check: "M20 6 9 17l-5-5",
  "chevron-down": "m6 9 6 6 6-6",
  "triangle-alert": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01",
  info: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  "circle-check": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M9 12l2 2 4-4",
  "circle-help": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01",
  "circle-x": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M15 9l-6 6M9 9l6 6",
  "file-text": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8",
  languages: "m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6",
  search: "m21 21-4.34-4.34M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2",
  "scan-text": "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8h8M7 12h10M7 16h6",
  archive: "M20 5H4a2 2 0 0 0 0 4h16a2 2 0 0 0 0-4M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9M10 13h4",
  mail: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7M2 5h20v14H2z",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6 6 18M6 6l12 12",
  clock: "M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  "circle-dashed": "M10.1 2.18a9.93 9.93 0 0 1 3.8 0M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7M21.82 10.1a9.93 9.93 0 0 1 0 3.8M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69M13.9 21.82a9.94 9.94 0 0 1-3.8 0M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7M2.18 13.9a9.93 9.93 0 0 1 0-3.8M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69",
  image: "M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4M21 15l-5-5L5 21",
  download: "M12 15V3M7 10l5 5 5-5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  "arrow-up": "m5 12 7-7 7 7M12 19V5",
};
export default function Icon({ name, className = "", label }: { name: keyof typeof paths | string; className?: string; label?: string }) {
  const d = paths[name] ?? paths.info;
  return (
    <svg className={`ndf-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={label ? undefined : true} role={label ? "img" : undefined} focusable="false">
      {label ? <title>{label}</title> : null}
      <path d={d} />
    </svg>
  );
}
