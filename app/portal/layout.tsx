import Link from "next/link";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/portal/الوجبات" className="text-lg font-semibold text-primary">
            القمسيونجي — البوابة
          </Link>
          <nav className="flex gap-4">
            <Link href="/portal/الوجبات" className="text-sm text-muted-foreground hover:text-foreground">
              الوجبات
            </Link>
            <Link href="/portal/المدفوعات" className="text-sm text-muted-foreground hover:text-foreground">
              المدفوعات
            </Link>
            <Link href="/portal/طلب-سماح" className="text-sm text-muted-foreground hover:text-foreground">
              طلب سماح
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
