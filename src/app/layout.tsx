import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Layout/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Josefin_Sans } from 'next/font/google';
import Footer from "@/components/Layout/Footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TodoApp - Organize your Tasks",
  description: "A modern, feature-rich todo application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A modern, feature-rich todo application" />
        <meta name="keywords" content="todo, tasks, productivity, nextjs, react" />
        <meta name="author" content="Bibek Kumar Kushwaha" />
        <meta property="og:title" content="TodoApp - Organize your Tasks" />
        <meta property="og:description" content="A modern, feature-rich todo application" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://bibekkumarkushwaha.com.np" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TodoApp - Organize your Tasks" />
        <meta name="twitter:description" content="A modern, feature-rich todo application" />
        <meta name="twitter:image" content="/og-image.png" />
      </head>
      <body
        className={ josefinSans.className + " " + geistSans.variable + " " + geistMono.variable + " bg-background text-foreground dark:bg-gray-900 dark:text-white" }
      >
        <Navbar/>
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
