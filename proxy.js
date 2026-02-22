import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

export default async function proxy(req) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.modifold.com";
    let apiHost = "api.modifold.com";

    try {
        apiHost = new URL(apiBase).host;
    } catch (error) {
        console.warn("Invalid NEXT_PUBLIC_API_BASE:", apiBase, error);
    }
    
    let resolvedLocale = req.cookies.get("NEXT_LOCALE")?.value;

    if(!resolvedLocale || !routing.locales.includes(resolvedLocale)) {
        const pathLocale = req.nextUrl.pathname.split("/")[1];
        if(routing.locales.includes(pathLocale)) {
            resolvedLocale = pathLocale;
        } else {
            const acceptLanguage = (req.headers.get("accept-language") || "").toLowerCase();
            const preferred = acceptLanguage.split(",").map(l => l.split(";")[0].trim());

            const localeMap = {
                "ru": "ru",
                "ru-ru": "ru",
                "en": "en",
                "en-us": "en",
                "en-gb": "en",
                "es": "es",
                "es-es": "es",
                "es-mx": "es",
                "pt": "pt",
                "pt-br": "pt",
                "pt-pt": "pt",
                "uk": "uk",
                "uk-ua": "uk",
                "tr": "tr",
                "tr-tr": "tr",
            };

            for(const lang of preferred) {
                if(localeMap[lang]) {
                    resolvedLocale = localeMap[lang];
                    break;
                }
            }

            if(!resolvedLocale) {
                resolvedLocale = acceptLanguage ? "en" : routing.defaultLocale;
            }
        }
    }

    const response = NextResponse.next();
    const requestHost = req.headers.get("host") || "";
    const isStagingHost = requestHost === "staging.modifold.com" || requestHost.startsWith("staging.");

    if(isStagingHost) {
        response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
    }

    response.cookies.set("NEXT_LOCALE", resolvedLocale, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
    });

    const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || req.ip || "unknown";

    if(req.nextUrl.pathname.startsWith("/api") || req.url.includes(apiHost)) {
        const headers = new Headers(req.headers);
        headers.set("X-Real-IP", clientIp);
        headers.set("X-Forwarded-For", clientIp);
        headers.set("x-modifold-locale", resolvedLocale);

        const rewriteResponse = NextResponse.next({
            request: { headers },
        });

        if(isStagingHost) {
            rewriteResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
        }

        rewriteResponse.cookies.set("NEXT_LOCALE", resolvedLocale, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
            sameSite: "lax",
        });

        return rewriteResponse;
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|api|_vercel|.*\\..*).*)"],
};