import { getCurrentUser } from "@/lib/current-user";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h2 className="text-3xl font-bold">Dashboard</h2>

      <p className="mt-2 text-muted-foreground">
        Welcome to {user?.name || "DocuMind"}.
      </p>
    </div>
  );
}