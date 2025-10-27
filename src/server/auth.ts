import { auth, currentUser } from "@clerk/nextjs/server";

interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
}

export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.fullName || user?.username || email || userId;

  if (!email) {
    return { userId, email: "", name };
  }

  return {
    userId,
    email,
    name,
  };
}
