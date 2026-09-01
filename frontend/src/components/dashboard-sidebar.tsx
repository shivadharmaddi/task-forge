"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Layers,
  Server,
  Clock,
  Archive,
  Activity,
  Network,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

const navGroups = [
  {
    label: "Monitor",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/jobs", label: "Jobs", icon: ListTodo },
      { href: "/dashboard/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { href: "/dashboard/queues", label: "Queues", icon: Layers },
      { href: "/dashboard/workers", label: "Workers", icon: Server },
      { href: "/dashboard/scheduled", label: "Scheduled", icon: Clock },
      { href: "/dashboard/dead-letter", label: "Dead letter", icon: Archive },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/architecture", label: "Architecture", icon: Network },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-[#faf9f8] dark:bg-[#1f1e1d]">
      <div className="flex h-12 items-center border-b border-border px-4">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-[#edebe9] font-semibold text-foreground dark:bg-[#292827]"
                      : "text-[#424242] hover:bg-[#f3f2f1] dark:text-[#d2d0ce] dark:hover:bg-[#252423]",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[#0078d4] dark:bg-[#4da6ff]" />
                  )}
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 border border-border bg-background px-3 py-2">
          <p className="text-[11px] font-semibold text-[#0078d4] dark:text-[#4da6ff]">
            Demo workspace
          </p>
          <p className="text-[13px] text-foreground">{user?.name || "Demo User"}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-2 py-2 text-[13px] text-muted-foreground hover:bg-[#f3f2f1] hover:text-foreground dark:hover:bg-[#252423]"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
