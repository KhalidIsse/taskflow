import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { listTasks } from "@/lib/tasks";
import Board from "@/components/Board";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tasks = await listTasks(session.user.id);
  const name = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <span className="font-display text-xl font-bold">TaskFlow</span>
        <div className="flex items-center gap-3">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" width={32} height={32} referrerPolicy="no-referrer" className="rounded-full" />
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn btn-outline">Sign out</button>
          </form>
        </div>
      </header>
      <Board initial={tasks} greeting={`Hi, ${name}. Here is your board.`} />
    </div>
  );
}
