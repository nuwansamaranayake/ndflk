import "server-only";
// Form notifications go to a monitored mailbox over SMTP (Mailhog in dev). No external provider yet.
import { createConnection } from "node:net";

function smtpSend(host: string, port: number, from: string, to: string, subject: string, body: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sock = createConnection({ host, port });
    const lines = [`HELO ndflk`, `MAIL FROM:<${from}>`, `RCPT TO:<${to}>`, `DATA`,
      `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}\r\n.`, `QUIT`];
    let i = 0;
    sock.setTimeout(8000, () => { sock.destroy(); reject(new Error("smtp timeout")); });
    sock.on("data", (d) => {
      const code = Number(String(d).slice(0, 3));
      if (code >= 400) { sock.destroy(); reject(new Error(`smtp ${String(d).trim()}`)); return; }
      if (i < lines.length) { sock.write(lines[i++] + "\r\n"); } else { sock.end(); resolve(); }
    });
    sock.on("error", reject);
  });
}

export async function notify(subject: string, body: string): Promise<boolean> {
  const host = process.env.SMTP_HOST; const to = process.env.NOTIFY_TO; const from = process.env.MAIL_FROM || "site@ndflk.org";
  if (!host || !to) return false;
  try { await smtpSend(host, Number(process.env.SMTP_PORT || 1025), from, to, subject, body); return true; }
  catch (e) { console.error("mail failed:", (e as Error).message); return false; }
}
