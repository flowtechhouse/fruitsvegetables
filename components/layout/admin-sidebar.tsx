"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  ShoppingCart,
  Users,
  Banknote,
  Settings,
  Wallet,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/cars", label: "العربيات", icon: Truck },
  { href: "/admin/sell", label: "بيع من العربية", icon: ShoppingCart },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/collection", label: "التحصيل", icon: Banknote },
  { href: "/admin/treasury", label: "الخزينة", icon: Wallet },
  { href: "/admin/settings/suppliers", label: "الموردين", icon: Settings },
  { href: "/admin/settings/sellers", label: "البائعين", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-l border-border bg-card shadow-sm">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg text-primary">القمسيونجي — Comssiongy</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {adminNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </Button>
      </div>
    </aside>
  );
}
