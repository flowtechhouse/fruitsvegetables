"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invokeEdgeFunction } from "@/lib/edge-functions";

type Customer = {
  id: string;
  name: string;
  contact: string | null;
  customer_type: string;
  location_area: string | null;
  credit_limit: number | null;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Customer[]>("list-customers", { method: "GET" });
      setCustomers(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">العملاء</h1>
          <p className="text-muted-foreground">قائمة العملاء (ثابت / سريع)</p>
        </div>
        <Button asChild>
          <Link href="/admin/customers/new">إضافة عميل</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>الاسم، نوع العميل، الاتصال، المنطقة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الاتصال</TableHead>
                <TableHead>المنطقة</TableHead>
                <TableHead>حد الائتمان</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا يوجد عملاء. أضف عميلاً للبدء.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.customer_type === "fixed" ? "ثابت" : "سريع"}</TableCell>
                    <TableCell>{c.contact ?? "—"}</TableCell>
                    <TableCell>{c.location_area ?? "—"}</TableCell>
                    <TableCell>{c.credit_limit != null ? c.credit_limit : "—"}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/customers/${c.id}/statement`}>كشف حساب</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
