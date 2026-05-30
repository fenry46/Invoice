import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Returns the signed-in user's id. If there is no session it redirects to
 * `/login` (the thrown NEXT_REDIRECT propagates correctly from both Server
 * Components and Server Actions). `proxy.ts` is only an optimistic gate, so
 * every data read/write must call this to actually scope to the current user.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");
  return userId;
}
