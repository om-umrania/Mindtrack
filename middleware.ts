import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/habits(.*)",
  "/analytics(.*)",
  "/api/habits(.*)",
  "/api/checkins(.*)",
  "/api/analytics(.*)",
]);

const isPublicRoute = createRouteMatcher(["/", "/login", "/api/health(.*)"]);

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

if (!publishableKey || !secretKey) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Clerk environment variables are missing. Protected routes will rely on demo mode if enabled.",
    );
  }
}

export default clerkMiddleware(
  (auth, request) => {
    if (isPublicRoute(request)) {
      return;
    }

    if (isProtectedRoute(request)) {
      auth.protect();
    }
  },
  { publishableKey, secretKey },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api)(.*)"],
};
