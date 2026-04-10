import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Noto_Sans,
  Space_Grotesk,
} from "next/font/google";

export const metadata: Metadata = {
  title: "Sony Wiki",
  description:
    "Sony Wiki — Quản lý Wiki sản phẩm và Color Lab cho Sony",
};

const setColorSchemeScript = `
(function() {
  try {
    var scheme = localStorage.getItem('color-scheme') || 'light';
    document.documentElement.setAttribute('color-scheme', scheme);
    document.documentElement.classList.toggle('dark', scheme === 'dark');
  } catch(e) {}
})();
`;

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-photobooth-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-photobooth-headline",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-photobooth-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="vi" className="no-touch">
      <head>
        <script dangerouslySetInnerHTML={{ __html: setColorSchemeScript }} />
      </head>
      <body
        className={`${notoSans.className} ${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
