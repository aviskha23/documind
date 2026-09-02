import Link from "next/link";
import { Home, FileText, MessageSquare } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background p-6">
        <h1 className="mb-8 text-2xl font-bold">DocuMind</h1>

        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/documents"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
          >
            <FileText className="h-4 w-4" />
            Documents
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}