import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { MswProvider } from "@/components/msw-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mindtrack - Habit Tracking Made Simple",
  description: "Track your habits with AI-powered insights and nudges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <MswProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  if (!clerkPublishableKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk components will fall back to demo mode.",
      );
    }
    return content;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {content}
    </ClerkProvider>
  );
}
