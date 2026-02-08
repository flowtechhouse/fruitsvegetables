import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortalAllowanceRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">طلب سماح</h1>
        <p className="text-muted-foreground">تقديم طلب سماح (قريباً)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>طلب سماح</CardTitle>
          <CardDescription>صفحة طلب السماح — محتوى تجريبي</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            نموذج طلب السماح سيُضاف هنا لاحقاً. هذه الصفحة جاهزة للتطوير.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
