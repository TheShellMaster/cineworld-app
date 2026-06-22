import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import type { Viewport, Metadata } from "next";
import { Toaster } from "react-hot-toast";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import SplashProvider from "@/components/SplashProvider";
import { locales } from "@/i18n";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "CinéWorld",
  description: "Réservez vos places de cinéma et streamez des films",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as typeof locales[number])) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0B0F19] text-[#F5F5F5] selection:bg-[#FF4D4D]/30`}>
        <NextIntlClientProvider messages={messages}>
          <SplashProvider>
            <TopNav locale={locale} />
            <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
            <BottomNav locale={locale} />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#1E293B',
                  color: '#F5F5F5',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#1E293B' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#1E293B' },
                },
              }}
            />
          </SplashProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
