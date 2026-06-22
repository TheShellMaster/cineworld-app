import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const LOCALES = [
  "fr", "en", "es", "de", "it", "pt", "nl", "ru", "zh-CN", "ja", "ko",
  "ar", "hi", "tr", "pl", "sv", "da", "fi", "no", "el", "he",
  "th", "vi", "id", "cs", "hu", "ro"
];

const intlMiddleware = createMiddleware({
  locales: LOCALES,
  defaultLocale: "fr",
  localePrefix: "always",
});

export async function proxy(request: NextRequest) {
  // 1. Appliquer le routing i18n
  let response = intlMiddleware(request);

  // 2. Initialiser le client Supabase avec la réponse
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = intlMiddleware(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Rafraîchir la session si nécessaire
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
