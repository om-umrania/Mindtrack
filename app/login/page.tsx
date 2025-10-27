"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <SignedOut>
          <SignIn redirectUrl="/dashboard" />
        </SignedOut>
        <SignedIn>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            You are already signed in. Redirecting…
          </p>
        </SignedIn>
      </div>
    </div>
  );
}
