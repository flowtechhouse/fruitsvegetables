"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login" || pathname === "/admin/signup";

  if (isLogin) {
    return <main className="flex-1 overflow-auto p-6">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
