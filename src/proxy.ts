import { NextResponse, type NextRequest } from "next/server";

/**
 * Roteamento por host (um só deploy serve os três domínios):
 * - `tosave.cloud` e `www.tosave.cloud` → 308 para `https://app.tosave.cloud`;
 * - `app.*` → site do colecionador (`src/app/sites/app`);
 * - qualquer outro host (`admin.tosave.cloud`, localhost, domínio do
 *   EasyPanel) → painel admin (`src/app/sites/admin`).
 *
 * Em dev, `?site=app` ou `?site=admin` troca o site e fica gravado em cookie.
 */
const APP_ORIGIN = "https://app.tosave.cloud";
const APEX_HOSTS = new Set(["tosave.cloud", "www.tosave.cloud"]);

type Site = "admin" | "app";

function hostOf(request: NextRequest): string {
  const raw = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  return raw.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
}

export function proxy(request: NextRequest) {
  const host = hostOf(request);
  const { pathname, search } = request.nextUrl;

  if (APEX_HOSTS.has(host)) {
    return NextResponse.redirect(`${APP_ORIGIN}${pathname}${search}`, 308);
  }

  let site: Site = host.startsWith("app.") ? "app" : "admin";
  let setCookie: Site | null = null;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  if (isLocal) {
    const param = request.nextUrl.searchParams.get("site");
    const cookie = request.cookies.get("dev-site")?.value;
    if (param === "app" || param === "admin") {
      site = param;
      setCookie = param;
    } else if (cookie === "app" || cookie === "admin") {
      site = cookie;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/sites/${site}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  if (setCookie) response.cookies.set("dev-site", setCookie, { path: "/" });
  return response;
}

export const config = {
  matcher: [
    // Tudo, menos arquivos internos do Next e da pasta public.
    "/((?!_next/static|_next/image|brand/|favicon.ico|icon.png|apple-icon.png|robots.txt).*)",
  ],
};
