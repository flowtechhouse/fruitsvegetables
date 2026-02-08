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

type Car = {
  id: string;
  date: string;
  supplier: string;
  total_weight_kg: number | null;
  car_lines?: { id: string; item: string; count: number }[];
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Car[]>("list-cars", { method: "GET" });
      setCars(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">العربيات</h1>
          <p className="text-muted-foreground">
            قائمة العربيات الواردة (تاريخ، مورد، وزن بسكول)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/car/new">إضافة عربية</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قائمة العربيات</CardTitle>
          <CardDescription>الوارد حسب التاريخ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead>الوزن (بسكول)</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : cars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      لا توجد عربيات. أضف عربية جديدة للبدء.
                    </TableCell>
                  </TableRow>
                ) : (
                  cars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        {new Date(car.date).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell>{car.supplier}</TableCell>
                      <TableCell>
                        {car.total_weight_kg != null ? car.total_weight_kg : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/car/${car.id}`}>عرض</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
