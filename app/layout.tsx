import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dash Hour: skip the bank queue",
    template: "%s · Dash Hour",
  },
  description:
    "A prototype of Dash Hour, a hackathon app for taking a bank queue ticket before you arrive. Rebuilt from the original 2016 sketches for web and mobile.",
  applicationName: "Dash Hour",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Dash Hour", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "Dash Hour: skip the bank queue",
    description: "Take a bank queue ticket before you arrive. A hackathon prototype rebuilt from the original sketches.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0d1137",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoKr.variable}`}>
      <body>
        <div className="root">{children}</div>
      </body>
    </html>
  );
}
