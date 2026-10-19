import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@/lib/i18n";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set("x-ndf-path", pathname);
    const res = NextResponse.next({ request: { headers: reqHeaders } });
    if (req.cookies.get("ndf_lang")?.value !== first) res.cookies.set("ndf_lang", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return res;
  }
  const cookie = req.cookies.get("ndf_lang")?.value;
  const accept = req.headers.get("accept-language") || "";
  const preferred = isLocale(cookie) ? cookie : (/\bsi\b/i.test(accept) ? "si" : defaultLocale);
  const url = req.nextUrl.clone();
  url.pathname = `/${locales.includes(preferred) ? preferred : defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|fonts|img|logo|documents|manifest.webmanifest|icon.png|apple-icon.png).*)"],
};
