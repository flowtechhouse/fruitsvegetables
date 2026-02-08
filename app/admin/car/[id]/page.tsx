"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Car = {
  id: string;
  date: string;
  supplier: string;
  supplier_id: string | null;
  total_weight_kg: number | null;
  car_lines?: { id: string; item: string; count: number }[];
};

export default function AdminCarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await invokeEdgeFunction<Car>("get-car", {
        method: "POST",
        body: { carId: id },
      });
      if (error) {
        setCar(null);
      } else {
        setCar(data ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">العربية غير موجودة أو حدث خطأ.</p>
        <Button variant="outline" asChild>
          <Link href="/admin/cars">العودة للقائمة</Link>
        </Button>
      </div>
    );
  }

  const lines = car.car_lines ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تفاصيل العربية</h1>
          <p className="text-muted-foreground">
            {new Date(car.date).toLocaleDateString("ar-EG")} — {car.supplier}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/cars">العودة للقائمة</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>البيانات</CardTitle>
          <CardDescription>التاريخ، المورد، والوزن</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>التاريخ:</strong> {new Date(car.date).toLocaleString("ar-EG")}</p>
          <p><strong>المورد:</strong> {car.supplier}</p>
          <p><strong>الوزن (بسكول):</strong> {car.total_weight_kg != null ? car.total_weight_kg : "—"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>أصناف العربية</CardTitle>
          <CardDescription>البند والعدد</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>البند</TableHead>
                <TableHead>العدد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    لا توجد أصناف
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.item}</TableCell>
                    <TableCell>{line.count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button asChild>
        <Link href={`/admin/sell?carId=${car.id}`}>بيع من هذه العربية</Link>
      </Button>
    </div>
  );
}
