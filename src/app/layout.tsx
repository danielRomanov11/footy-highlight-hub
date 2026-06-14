import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/components/i18n-provider";
import { IngestOnVisit } from "@/components/ingest-on-visit";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getTranslations } from "@/lib/i18n";
import { triggerScheduledIngestIfDue } from "@/lib/ingest/trigger";
import "./globals.css";

export const dynamic = "force-dynamic";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();

  return {
    title: {
      default: t.meta.title,
      template: t.meta.template,
    },
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.ogDescription,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ locale, t }] = await Promise.all([getTranslations(), triggerScheduledIngestIfDue()]);

  return (
    <html
      lang={locale}
      className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <I18nProvider locale={locale} t={t}>
          <IngestOnVisit />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
