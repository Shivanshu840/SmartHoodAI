import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SmartHoodAI - Find Your Perfect Neighborhood Match",
  description:
    "Discover neighborhoods in India that perfectly align with your lifestyle, preferences, and budget using our advanced AI analysis.",
   
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
