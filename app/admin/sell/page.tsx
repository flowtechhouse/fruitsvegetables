"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  calculateSaleLineTotal,
  validateSaleLineForSubmit,
  type SellingMode,
  type Bya3aMode,
} from "@/lib/validations/sale-line";
import { Plus, Trash2 } from "lucide-react";

const sellingModes: { value: SellingMode; label: string }[] = [
  { value: "weight", label: "وزن" },
  { value: "piece", label: "قطعة" },
  { value: "package", label: "باكت" },
];
const bya3aModes: { value: Bya3aMode; label: string }[] = [
  { value: "per_unit", label: "بالوحدة" },
  { value: "fixed", label: "ثابت" },
];

type Car = { id: string; date: string; supplier: string };
type Customer = { id: string; name: string };
type Seller = { id: string; name: string };
type SaleLineRow = {
  id?: string;
  item: string;
  count: number;
  packageOrPiece: string;
  grade: string;
  weight: number;
  price: number;
  sellingMode: SellingMode;
  bya3aMode: Bya3aMode;
  bya3aValue: number;
  total: number;
  customerId: string;
  sellerId: string;
};

const lineSchema = z.object({
  item: z.string().min(1),
  count: z.number().min(0),
  packageOrPiece: z.string().min(1),
  grade: z.string().optional(),
  weight: z.number().min(0),
  price: z.number().min(0),
  sellingMode: z.enum(["weight", "piece", "package"]),
  bya3aMode: z.enum(["per_unit", "fixed"]),
  bya3aValue: z.number().min(0),
  customerId: z.string().min(1, "العميل مطلوب"),
  sellerId: z.string().optional(),
});

function AdminSellContent() {
  const searchParams = useSearchParams();
  const carIdParam = searchParams.get("carId") ?? "";
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedCarId, setSelectedCarId] = useState(carIdParam);
  const [saleLines, setSaleLines] = useState<SaleLineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [carsRes, customersRes, sellersRes] = await Promise.all([
        invokeEdgeFunction<Car[]>("list-cars", { method: "GET" }),
        invokeEdgeFunction<Customer[]>("list-customers", { method: "GET" }),
        invokeEdgeFunction<Seller[]>("list-sellers", { method: "GET" }),
      ]);
      setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
      setSellers(Array.isArray(sellersRes.data) ? sellersRes.data : []);
      if (carIdParam) setSelectedCarId(carIdParam);
      setLoading(false);
    })();
  }, [carIdParam]);

  useEffect(() => {
    if (!selectedCarId) {
      setSaleLines([]);
      return;
    }
    (async () => {
      const { data } = await invokeEdgeFunction<Record<string, unknown>[]>("list-sale-lines", {
        method: "GET",
        query: { carId: selectedCarId },
      });
      const rows: SaleLineRow[] = Array.isArray(data)
        ? data.map((r) => ({
            id: r.id as string,
            item: (r.item as string) ?? "",
            count: (r.count as number) ?? 0,
            packageOrPiece: (r.package_or_piece as string) ?? "",
            grade: (r.grade as string) ?? "",
            weight: (r.weight as number) ?? 0,
            price: (r.price as number) ?? 0,
            sellingMode: (r.selling_mode as SellingMode) ?? "piece",
            bya3aMode: (r.bya3a_mode as Bya3aMode) ?? "fixed",
            bya3aValue: (r.bya3a_value as number) ?? 0,
            total: (r.total as number) ?? 0,
            customerId: (r.customer_id as string) ?? "",
            sellerId: (r.seller_id as string) ?? "",
          }))
        : [];
      setSaleLines(rows);
    })();
  }, [selectedCarId]);

  function addLine() {
    setSaleLines((prev) => [
      ...prev,
      {
        item: "",
        count: 0,
        packageOrPiece: "",
        grade: "",
        weight: 0,
        price: 0,
        sellingMode: "piece" as SellingMode,
        bya3aMode: "fixed" as Bya3aMode,
        bya3aValue: 0,
        total: 0,
        customerId: "",
        sellerId: "",
      },
    ]);
  }

  function updateLine(
    i: number,
    updates: Partial<SaleLineRow> | ((prev: SaleLineRow) => Partial<SaleLineRow>)
  ) {
    setSaleLines((prev) => {
      const next = [...prev];
      const u = typeof updates === "function" ? updates(next[i]) : updates;
      next[i] = { ...next[i], ...u };
      const total = calculateSaleLineTotal({
        sellingMode: next[i].sellingMode,
        bya3aMode: next[i].bya3aMode,
        price: next[i].price,
        bya3aValue: next[i].bya3aValue,
        weight: next[i].weight,
        count: next[i].count,
      });
      next[i].total = total;
      return next;
    });
  }

  function removeLine(i: number) {
    setSaleLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function deleteSavedLine(id: string) {
    await invokeEdgeFunction("delete-sale-line", {
      method: "DELETE",
      query: { id },
    });
    setSaleLines((prev) => prev.filter((l) => l.id !== id));
  }

  async function saveLine(line: SaleLineRow) {
    if (!selectedCarId) {
      setError("اختر العربية أولاً.");
      return;
    }
    const err = validateSaleLineForSubmit({
      sellingMode: line.sellingMode,
      bya3aMode: line.bya3aMode,
      weight: line.weight,
      count: line.count,
    });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error: resErr } = await invokeEdgeFunction<SaleLineRow>("create-sale-line", {
      body: {
        carId: selectedCarId,
        customerId: line.customerId,
        sellerId: line.sellerId || undefined,
        item: line.item,
        count: line.count,
        packageOrPiece: line.packageOrPiece,
        grade: line.grade || undefined,
        weight: line.sellingMode === "weight" ? line.weight : undefined,
        price: line.price,
        sellingMode: line.sellingMode,
        bya3aMode: line.bya3aMode,
        bya3aValue: line.bya3aValue,
        total: line.total,
      },
    });
    setSubmitting(false);
    if (resErr) {
      setError(resErr.message);
      return;
    }
    if (data) {
      setSaleLines((prev) => prev.map((l, idx) => (idx === prev.length - 1 && !l.id ? { ...l, ...data, id: data.id } : l)));
      addLine(); // new empty row
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">جاري التحميل...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">بيع من العربية</h1>
        <p className="text-muted-foreground">اختر العربية وسجّل صفوف البيع</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>العربية</CardTitle>
          <CardDescription>اختر العربية التي تبيع منها</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCarId} onValueChange={setSelectedCarId}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="اختر العربية" />
            </SelectTrigger>
            <SelectContent>
              {cars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {new Date(c.date).toLocaleDateString("ar-EG")} — {c.supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCarId && (
        <Card>
          <CardHeader>
            <CardTitle>صفوف البيع</CardTitle>
            <CardDescription>عميل، بائع، صنف، سعر، بيعة، الإجمالي يحسب تلقائياً</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>البائع</TableHead>
                    <TableHead>البند</TableHead>
                    <TableHead>العدد</TableHead>
                    <TableHead>باكت/قطعة</TableHead>
                    <TableHead>درجة</TableHead>
                    <TableHead>الوزن</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>طريقة البيع</TableHead>
                    <TableHead>بيعة</TableHead>
                    <TableHead>قيمة البيعة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center text-muted-foreground py-4">
                        لا توجد صفوف. اضغط إضافة صف.
                      </TableCell>
                    </TableRow>
                  ) : (
                    saleLines.map((line, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Select
                            value={line.customerId}
                            onValueChange={(v) => updateLine(i, { customerId: v })}
                          >
                            <SelectTrigger className="min-w-[120px]">
                              <SelectValue placeholder="العميل" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.sellerId || ""}
                            onValueChange={(v) => updateLine(i, { sellerId: v })}
                          >
                            <SelectTrigger className="min-w-[100px]">
                              <SelectValue placeholder="البائع" />
                            </SelectTrigger>
                            <SelectContent>
                              {sellers.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="البند"
                            value={line.item}
                            onChange={(e) => updateLine(i, { item: e.target.value })}
                            className="min-w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={line.count || ""}
                            onChange={(e) =>
                              updateLine(i, { count: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="باكت/قطعة"
                            value={line.packageOrPiece}
                            onChange={(e) => updateLine(i, { packageOrPiece: e.target.value })}
                            className="min-w-[80px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="درجة"
                            value={line.grade}
                            onChange={(e) => updateLine(i, { grade: e.target.value })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.weight || ""}
                            onChange={(e) =>
                              updateLine(i, { weight: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.price || ""}
                            onChange={(e) =>
                              updateLine(i, { price: parseFloat(e.target.value) || 0 })
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.sellingMode}
                            onValueChange={(v) => updateLine(i, { sellingMode: v as SellingMode })}
                          >
                            <SelectTrigger className="min-w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sellingModes.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.bya3aMode}
                            onValueChange={(v) => updateLine(i, { bya3aMode: v as Bya3aMode })}
                          >
                            <SelectTrigger className="min-w-[80px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {bya3aModes.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={line.bya3aValue || ""}
                            onChange={(e) =>
                              updateLine(i, { bya3aValue: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{line.total.toFixed(2)}</TableCell>
                        <TableCell>
                          {line.id ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSavedLine(line.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled={submitting || !line.customerId || !line.item || line.total <= 0}
                              onClick={() => saveLine(line)}
                            >
                              حفظ
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <Button type="button" variant="outline" onClick={addLine}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة صف
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminSellPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">جاري التحميل...</p>}>
      <AdminSellContent />
    </Suspense>
  );
}
