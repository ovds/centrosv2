import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SiteHeader } from '@/components/layout/site-header'
import { ClerkProvider } from '@clerk/nextjs'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'NUS High School Counselling',
    description: 'College counselling platform for NUS High School students',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider
            appearance={{
                elements: {
                    rootBox: "w-full",
                    card: "w-full shadow-none",
                    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                    formFieldInput: "border-input",
                    footerActionLink: "text-primary hover:text-primary/90",
                },
                layout: {
                    socialButtonsPlacement: "bottom",
                    socialButtonsVariant: "iconButton",
                    termsPageUrl: "https://www.nushigh.edu.sg/terms",
                    privacyPageUrl: "https://www.nushigh.edu.sg/privacy",
                },
            }}
        >
            <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
            </html>
        </ClerkProvider>
    )
}