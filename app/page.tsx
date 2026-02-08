import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-primary">القمسيونجي — Comssiongy</h1>
      <p className="text-muted-foreground">إدارة وكالة خضار وفاكهة — سوق الجملة</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin">لوحة التحكم (الإدارة)</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/portal/الوجبات">البوابة (العملاء)</Link>
        </Button>
      </div>
    </div>
  );
}
