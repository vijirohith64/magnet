import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "College Review System - Dhanalakshmi Srinivasan University",
  description: "Secure feedback system for students to share their experiences",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#1a1a1a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DSU Reviews",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "DSU College Review System",
    title: "College Review System - Dhanalakshmi Srinivasan University",
    description: "Secure feedback system for students to share their experiences",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/images/university-logo.png" />
        <link rel="icon" href="/images/university-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DSU Reviews" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="min-h-screen bg-background grid-pattern">{children}</div>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
