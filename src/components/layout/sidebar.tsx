"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  LogOut,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", href: "/dashboard/sessions", icon: Calendar },
  { name: "Cours", href: "/dashboard/courses", icon: BookOpen },
  { name: "Coachs", href: "/dashboard/coaches", icon: Users },
  { name: "Étudiants", href: "/dashboard/students", icon: GraduationCap },
  { name: "Évaluations", href: "/dashboard/evaluations", icon: ClipboardList },
  { name: "Calendrier", href: "/dashboard/calendar", icon: CalendarDays },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center justify-center bg-primary">
        <h1 className="text-xl font-bold text-primary-foreground">MPS Admin</h1>
      </div>
      <SidebarContent />
    </div>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary h-14 flex items-center justify-between px-4">
      <h1 className="text-lg font-bold text-primary-foreground">MPS Admin</h1>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center justify-center bg-primary">
            <h1 className="text-lg font-bold text-primary-foreground">MPS Admin</h1>
          </div>
          <div className="flex flex-col h-[calc(100%-3.5rem)]">
            <SidebarContent onNavigate={() => setIsOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
