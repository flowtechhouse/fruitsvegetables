import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortalPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">المدفوعات</h1>
        <p className="text-muted-foreground">عرض المدفوعات والسداد (قريباً)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>المدفوعات</CardTitle>
          <CardDescription>صفحة المدفوعات — محتوى تجريبي</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            لا توجد مدفوعات معروضة حالياً. هذه الصفحة جاهزة للتطوير لاحقاً.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
