import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PortalMealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">تفاصيل الوجبة</h1>
        <p className="text-muted-foreground">الوجبة #{id} — محتوى تجريبي</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>الوجبة</CardTitle>
          <CardDescription>تفاصيل الوجبة ستُعرض هنا لاحقاً</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">صفحة تفاصيل الوجبة (placeholder).</p>
        </CardContent>
      </Card>
      <Button variant="outline" asChild>
        <Link href="/portal/الوجبات">العودة للوجبات</Link>
      </Button>
    </div>
  );
}
