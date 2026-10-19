"use client";
import { useId, useState } from "react";
export default function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [i, setI] = useState(0);
  const id = useId();
  return (
    <div className="ndf-tabs">
      <div className="ndf-tabs__list" role="tablist">
        {tabs.map((t, k) => (
          <button key={k} role="tab" id={`${id}-t${k}`} aria-selected={i === k} aria-controls={`${id}-p${k}`} className="ndf-tabs__tab" type="button" onClick={() => setI(k)}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t, k) => (
        <div key={k} role="tabpanel" id={`${id}-p${k}`} aria-labelledby={`${id}-t${k}`} hidden={i !== k}>{t.content}</div>
      ))}
    </div>
  );
}
