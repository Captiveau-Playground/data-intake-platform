"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  ListChecks,
  Users,
  Trophy,
  LogOut,
  Menu,
  MoreVertical,
  Sun,
  Moon,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
  group: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["administrator", "datacollector"], group: "Dashboards" },
  { href: "/upload", label: "Upload", icon: Upload, roles: ["administrator", "datacollector"], group: "Apps" },
  { href: "/clubs", label: "Clubs", icon: Trophy, roles: ["administrator", "datacollector"], group: "Apps" },
  { href: "/posts", label: "Posts", icon: FileText, roles: ["administrator"], group: "Apps" },
  { href: "/comments", label: "Comments", icon: MessageSquare, roles: ["administrator"], group: "Apps" },
  { href: "/jobs", label: "Jobs", icon: ListChecks, roles: ["administrator", "datacollector"], group: "Apps" },
  { href: "/users", label: "Users", icon: Users, roles: ["administrator"], group: "Apps" },
];

function SidebarContent({
  visibleNavItems,
  pathname,
  userRole,
  username,
  logout,
  theme,
  toggleTheme,
  onNavClick,
}: {
  visibleNavItems: NavItem[];
  pathname: string;
  userRole: string | null;
  username: string | null;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onNavClick?: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleLabel = userRole === "administrator" ? "Admin Dashboard" : "Data Collector";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Group nav items
  const groups = visibleNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md overflow-hidden shrink-0">
          <Image src="/images/deep_pietch.png" alt="Football Intel" width={32} height={32} className="object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none">Football Intel</p>
          <p className="text-xs text-muted-foreground mt-0.5">{roleLabel}</p>
        </div>
      </div>

      {/* Navigation grouped */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="px-2 mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            <nav className="flex flex-col gap-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={onNavClick}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer — user with dropdown */}
      <div className="relative border-t border-sidebar-border p-2" ref={dropdownRef}>
        {/* Dropdown popup */}
        {dropdownOpen && (
          <div className="absolute bottom-full left-1 right-1 mb-1 rounded-lg border border-border bg-popover text-popover-foreground shadow-xl z-50 overflow-hidden">
            {/* User header in dropdown */}
            <div className="flex items-center gap-3 px-3 py-3 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-md overflow-hidden shrink-0">
                <Image src="/images/deep_pietch.png" alt="Football Intel" width={32} height={32} className="object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium capitalize truncate">{username}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            {/* Menu items */}
            <div className="p-1">
              <button
                onClick={() => { setDropdownOpen(false); toggleTheme(); }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}

        {/* User trigger button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-bold shrink-0">
            {username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-medium truncate capitalize leading-none">{username}</p>
          </div>
          <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { role, username, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const visibleNavItems = navItems.filter(
    (item) => !role || item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <span className="ml-3 text-sm font-semibold">Football Intel</span>
      </header>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent onClose={() => setMobileOpen(false)} side="left" className="p-0 w-64">
          <SidebarContent
            visibleNavItems={visibleNavItems}
            pathname={pathname}
            userRole={role}
            username={username}
            logout={logout}
            theme={theme}
            toggleTheme={toggleTheme}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] lg:block">
        <SidebarContent
          visibleNavItems={visibleNavItems}
          pathname={pathname}
          userRole={role}
          username={username}
          logout={logout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </aside>
    </>
  );
}
