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
  active: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

type Seller = { id: string; name: string; active: boolean };

export default function AdminSettingsSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", active: true },
  });

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Seller[]>("list-sellers", { method: "GET" });
      setSellers(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  async function onSubmit(data: FormData) {
    setError(null);
    setSubmitting(true);
    const { data: created, error: err } = await invokeEdgeFunction<Seller>("create-seller", {
      body: {
        name: data.name,
        active: data.active ?? true,
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (created) {
      setSellers((prev) => [created, ...prev]);
      form.reset({ name: "", active: true });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">البائعين</h1>
        <p className="text-muted-foreground">قائمة البائعين وإضافة بائع جديد</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>إضافة بائع</CardTitle>
            <CardDescription>الاسم وحالة النشاط</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input {...form.register("name")} placeholder="اسم البائع" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري الحفظ..." : "إضافة بائع"}
            </Button>
          </CardContent>
        </Card>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>قائمة البائعين</CardTitle>
          <CardDescription>مرتبة حسب الاسم</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>نشط</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                    لا يوجد بائعين
                  </TableCell>
                </TableRow>
              ) : (
                sellers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.active ? "نعم" : "لا"}</TableCell>
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
