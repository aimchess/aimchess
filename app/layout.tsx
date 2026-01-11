// import type React from "react"
// import type { Metadata } from "next"
// import { GeistSans } from "geist/font/sans"
// import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next"
// import { Suspense } from "react"
// import { Header } from "@/components/header"
// import { Footer } from "@/components/footer"
// import { Providers } from "./providers"
// import "./globals.css"

// export const metadata: Metadata = {
//   title: "Royal Rook academy - Professional Chess Training",
//   description:
//     "Professional chess training academy with FIDE rated coaches. Learn chess from beginners to advanced levels with online and offline classes.",
//   generator: "v0.app",
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en">

//       <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
//         <Providers>
//           <Header />
//           <Suspense fallback={null}>{children}</Suspense>
//           <Footer />
//         </Providers>
//         <Analytics />
//       </body>
//     </html>
//   )
// }

// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Royal Rook Academy - Professional Chess Training",
  description: "Learn chess from FIDE-rated coaches. Online & offline classes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}