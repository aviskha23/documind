import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "DocuMind",
  description: "AI-powered document knowledge base",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <Show when="signed-out">
              <header className="flex items-center justify-end gap-3 border-b bg-background px-6 py-4">
                <SignInButton>
                  <button className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    Sign Up
                  </button>
                </SignUpButton>
              </header>
            </Show>

            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}