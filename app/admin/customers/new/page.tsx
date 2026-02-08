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
import { invokeEdgeFunction } from "@/lib/edge-functions";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  contact: z.string().optional(),
  customerType: z.enum(["fixed", "sarih"]),
  locationArea: z.string().optional(),
  locationDetails: z.string().optional(),
  creditLimit: z.union([z.number(), z.nan()]).optional().transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
  creditDays: z.union([z.number(), z.nan()]).optional().transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
  creditStatus: z.string().optional(),
  guarantorName: z.string().optional(),
  guaranteeCeiling: z.union([z.number(), z.nan()]).optional().transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined)),
  guaranteeNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Customer = { id: string; name: string };

export default function AdminCustomersNewPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerType: "fixed",
    },
  });

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Customer[]>("list-customers", { method: "GET" });
      setCustomers(Array.isArray(data) ? data : []);
    })();
  }, []);

  async function onSubmit(data: FormData) {
    setError(null);
    setSubmitting(true);
    const { data: created, error: err } = await invokeEdgeFunction<{ id: string }>("create-customer", {
      body: {
        name: data.name,
        contact: data.contact || undefined,
        customerType: data.customerType,
        locationArea: data.locationArea || undefined,
        locationDetails: data.locationDetails || undefined,
        creditLimit: data.creditLimit,
        creditDays: data.creditDays,
        creditStatus: data.creditStatus || undefined,
        guarantorName: data.guarantorName || undefined,
        guaranteeCeiling: data.guaranteeCeiling,
        guaranteeNotes: data.guaranteeNotes || undefined,
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (created?.id) router.push(`/admin/customers/${created.id}/statement`);
    else router.push("/admin/customers");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">إضافة عميل</h1>
        <p className="text-muted-foreground">تسجيل عميل جديد (ثابت أو سريع)</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
            <CardDescription>الاسم، النوع، الاتصال، الائتمان، الضمان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input {...form.register("name")} placeholder="اسم العميل" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>نوع العميل *</Label>
                <Select
                  value={form.watch("customerType")}
                  onValueChange={(v) => form.setValue("customerType", v as "fixed" | "sarih")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">ثابت</SelectItem>
                    <SelectItem value="sarih">سريع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الاتصال</Label>
                <Input {...form.register("contact")} placeholder="هاتف أو بريد" />
              </div>
              <div className="space-y-2">
                <Label>منطقة الموقع</Label>
                <Input {...form.register("locationArea")} placeholder="المنطقة" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>تفاصيل الموقع</Label>
                <Input {...form.register("locationDetails")} placeholder="العنوان أو التفاصيل" />
              </div>
              <div className="space-y-2">
                <Label>حد الائتمان</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("creditLimit", { valueAsNumber: true })}
                  placeholder="حد الائتمان"
                />
              </div>
              <div className="space-y-2">
                <Label>أيام الائتمان</Label>
                <Input
                  type="number"
                  {...form.register("creditDays", { valueAsNumber: true })}
                  placeholder="أيام"
                />
              </div>
              <div className="space-y-2">
                <Label>حالة الائتمان</Label>
                <Input {...form.register("creditStatus")} placeholder="حالة الائتمان" />
              </div>
              <div className="space-y-2">
                <Label>اسم الكفيل (للسريع)</Label>
                <Select
                  value={form.watch("guarantorName") ?? ""}
                  onValueChange={(v) => form.setValue("guarantorName", v || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عميلاً ككفيل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>سقف الضمان</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("guaranteeCeiling", { valueAsNumber: true })}
                  placeholder="سقف الضمان"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>ملاحظات الضمان</Label>
                <Input {...form.register("guaranteeNotes")} placeholder="ملاحظات" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري الحفظ..." : "حفظ العميل"}
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
