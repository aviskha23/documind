import Link from "next/link";
import { Home, FileText, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-6">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold font-heading">DocuMind</h1>
          <ThemeToggle />
        </div>

        <nav className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-sidebar-accent hover:translate-x-1"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/documents"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-sidebar-accent hover:translate-x-1"
          >
            <FileText className="h-4 w-4" />
            Documents
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-sidebar-accent hover:translate-x-1"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
        </nav>
      </aside>

      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  );
}