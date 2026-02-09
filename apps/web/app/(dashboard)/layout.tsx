"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  LayoutDashboard,
  Trophy,
  BookOpen,
  Settings,
  Bell,
  User,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    href: "/problems",
    label: "Problems",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="h-4 w-4" />,
  },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top Navbar ── */}
      <nav
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-nav/80 px-6 backdrop-blur-md"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
            aria-label="DSADash home"
          >
            <Swords className="h-5 w-5 text-accent" />
            <span>
              DSA<span className="text-accent">Dash</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-card-hover hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            tabIndex={0}
            className="relative rounded-lg p-2 text-muted transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
          </button>

          <button
            type="button"
            aria-label="Settings"
            tabIndex={0}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>

          <div className="ml-1 h-6 w-px bg-border" />

          <button
            type="button"
            aria-label="User profile"
            tabIndex={0}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-card-hover"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="hidden flex-col items-start md:flex">
              <span className="text-xs font-medium text-foreground">User</span>
              <span className="text-[10px] text-muted">Rating 1200</span>
            </div>
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
