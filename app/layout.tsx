import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppProvider } from '@/lib/app-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Committed - Faith-Based Dating',
  description: 'Where Christian singles connect with purpose. Find love built on faith.',
  keywords: ['Christian dating', 'faith-based dating', 'Christian singles', 'meaningful relationships'],
    generator: 'eklipse'
}

export const viewport: Viewport = {
  themeColor: '#2B4C7E',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AppProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
