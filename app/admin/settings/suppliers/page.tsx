"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invokeEdgeFunction } from "@/lib/edge-functions";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  contact: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Supplier = { id: string; name: string; contact: string | null; notes: string | null };

export default function AdminSettingsSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contact: "", notes: "" },
  });

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Supplier[]>("list-suppliers", { method: "GET" });
      setSuppliers(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  async function onSubmit(data: FormData) {
    setError(null);
    setSubmitting(true);
    const { data: created, error: err } = await invokeEdgeFunction<Supplier>("create-supplier", {
      body: {
        name: data.name,
        contact: data.contact || undefined,
        notes: data.notes || undefined,
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (created) {
      setSuppliers((prev) => [created, ...prev]);
      form.reset({ name: "", contact: "", notes: "" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الموردين</h1>
        <p className="text-muted-foreground">قائمة الموردين وإضافة مورد جديد</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>إضافة مورد</CardTitle>
            <CardDescription>الاسم، الاتصال، وملاحظات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input {...form.register("name")} placeholder="اسم المورد" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>الاتصال</Label>
                <Input {...form.register("contact")} placeholder="هاتف أو بريد" />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input {...form.register("notes")} placeholder="ملاحظات" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الحفظ..." : "إضافة مورد"}
            </Button>
          </CardContent>
        </Card>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>مرتبة حسب الاسم</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الاتصال</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    لا يوجد موردين
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.contact ?? "—"}</TableCell>
                    <TableCell>{s.notes ?? "—"}</TableCell>
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
