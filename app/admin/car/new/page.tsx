"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invokeEdgeFunction } from "@/lib/edge-functions";
import { Plus, Trash2 } from "lucide-react";

const schema = z.object({
  date: z.string().min(1, "التاريخ مطلوب"),
  supplier: z.string().min(1, "المورد مطلوب"),
  supplierId: z.string().optional(),
  totalWeightKg: z.union([z.number(), z.nan()]).optional().transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
});

type FormData = z.infer<typeof schema>;

type Line = { item: string; count: number };

type Supplier = { id: string; name: string };

export default function AdminCarNewPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lines, setLines] = useState<Line[]>([{ item: "", count: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 16),
      supplier: "",
      supplierId: "",
      totalWeightKg: undefined,
    },
  });

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Supplier[]>("list-suppliers", { method: "GET" });
      setSuppliers(Array.isArray(data) ? data : []);
    })();
  }, []);

  function addLine() {
    setLines((prev) => [...prev, { item: "", count: 0 }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function onSupplierSelect(id: string) {
    form.setValue("supplierId", id || undefined);
    const s = suppliers.find((x) => x.id === id);
    if (s) form.setValue("supplier", s.name);
  }

  async function onSubmit(data: FormData) {
    setError(null);
    setSubmitting(true);
    const filteredLines = lines.filter((l) => l.item.trim() !== "");
    if (filteredLines.length === 0) {
      setError("أضف صنفاً واحداً على الأقل (البند غير فارغ).");
      setSubmitting(false);
      return;
    }
    const { data: created, error: err } = await invokeEdgeFunction<{ id: string }>("create-car", {
      body: {
        date: data.date,
        supplier: data.supplier,
        supplierId: data.supplierId || undefined,
        totalWeightKg: data.totalWeightKg,
        lines: filteredLines.map((l) => ({ item: l.item.trim(), count: l.count })),
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (created?.id) router.push(`/admin/car/${created.id}`);
    else router.push("/admin/cars");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إضافة عربية</h1>
        <p className="text-muted-foreground">تسجيل عربية واردة مع أصنافها</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات العربية</CardTitle>
            <CardDescription>التاريخ، المورد، والوزن الإجمالي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input
                  type="datetime-local"
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>المورد</Label>
                <Select
                  onValueChange={(v) => {
                    onSupplierSelect(v);
                  }}
                  value={form.watch("supplierId") || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="أو اكتب اسم المورد"
                  {...form.register("supplier")}
                  className="mt-2"
                />
                {form.formState.errors.supplier && (
                  <p className="text-sm text-destructive">{form.formState.errors.supplier.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>الوزن الإجمالي (كجم) — اختياري</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="بسكول"
                  {...form.register("totalWeightKg", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div>
              <Label>أصناف العربية</Label>
              <div className="mt-2 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>البند</TableHead>
                      <TableHead>العدد</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Input
                            placeholder="اسم الصنف"
                            value={line.item}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((l, j) => (j === i ? { ...l, item: e.target.value } : l))
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={line.count}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((l, j) =>
                                  j === i ? { ...l, count: parseInt(e.target.value, 10) || 0 } : l
                                )
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(i)}
                            disabled={lines.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" variant="outline" className="mt-2" onClick={addLine}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة صنف
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : "حفظ العربية"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
