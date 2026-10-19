import Link from "next/link";
export default function NotFound() {
  return (
    <div className="ndf-container ndf-section">
      <h1>Page not found / පිටුව හමු නොවීය</h1>
      <p>The page you asked for is not here. Try the menu, or go to the home page.</p>
      <p><Link href="/en" className="ndf-btn ndf-btn--primary">Home</Link> <Link href="/si" className="ndf-btn ndf-btn--secondary" lang="si">මුල් පිටුව</Link></p>
    </div>
  );
}
