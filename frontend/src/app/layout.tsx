import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  // Alt sayfalardaki göreli canonical adreslerinin çözülebilmesi için gerekli.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: "Free Web Tools — Kodu gör, videoda çalışırken izle",
    template: "%s | Free Web Tools",
  },
  description:
    "Frontend, backend ve güvenlik snippet'leri, video anlatımlar, topluluk puanları ve anında kullanılabilir 13 geliştirici aracı — tek platformda.",
  keywords: [
    "kod snippet",
    "web geliştirme",
    "frontend araçları",
    "backend araçları",
    "güvenlik",
    "pentest",
    "json formatter",
    "hash generator",
    "ücretsiz araçlar",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Free Web Tools",
    title: "Free Web Tools — Kodu gör, videoda çalışırken izle",
    description:
      "Frontend, backend ve güvenlik snippet'leri ile anında kullanılabilir geliştirici araçları.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Web Tools",
    description:
      "Frontend, backend ve güvenlik snippet'leri ile anında kullanılabilir geliştirici araçları.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
