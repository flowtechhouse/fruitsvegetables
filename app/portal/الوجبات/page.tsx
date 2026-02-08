import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PortalMealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الوجبات اليومية</h1>
        <p className="text-muted-foreground">عرض الوجبات والتفاصيل (قريباً)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>الوجبات</CardTitle>
          <CardDescription>صفحة الوجبات اليومية — محتوى تجريبي</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            لا توجد وجبات معروضة حالياً. هذه الصفحة جاهزة للتطوير لاحقاً.
          </p>
          <Button variant="outline" asChild>
            <Link href="/portal/الوجبة/sample">عرض تفاصيل وجبة (تجريبي)</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
