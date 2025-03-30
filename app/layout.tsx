import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to avoid the missing component error
const Navbar = dynamic(() => import('@/components/navbar'), { ssr: false });

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Voice Journal - AI-Powered Journaling",
  description: "Record your thoughts and get AI insights with our voice journaling app",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'