import { auth } from "@/auth";

// Every action and API route calls this: middleware alone is not enough.
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
