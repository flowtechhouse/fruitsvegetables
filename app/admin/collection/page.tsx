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
import { invokeEdgeFunction } from "@/lib/edge-functions";
import Link from "next/link";

const schema = z.object({
  customerId: z.string().min(1, "العميل مطلوب"),
  amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
  date: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Customer = { id: string; name: string };

function AdminCollectionContent() {
  const searchParams = useSearchParams();
  const customerIdParam = searchParams.get("customerId") ?? "";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: customerIdParam,
      amount: 0,
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  useEffect(() => {
    (async () => {
      const { data } = await invokeEdgeFunction<Customer[]>("list-customers", { method: "GET" });
      setCustomers(Array.isArray(data) ? data : []);
    })();
  }, []);

  useEffect(() => {
    if (customerIdParam) form.setValue("customerId", customerIdParam);
  }, [customerIdParam, form]);

  async function onSubmit(data: FormData) {
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    // Receipt = credit (negative amount in ledger: positive = debit, negative = credit)
    const { error: resErr } = await invokeEdgeFunction("create-ledger-entry", {
      body: {
        customerId: data.customerId,
        type: "receipt",
        amount: -Math.abs(data.amount),
        date: data.date,
        notes: data.notes || undefined,
      },
    });
    setSubmitting(false);
    if (resErr) {
      setError(resErr.message);
      return;
    }
    setSuccess(true);
    form.reset({
      customerId: data.customerId,
      amount: 0,
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    });
  }

  const selectedCustomerId = form.watch("customerId");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التحصيل</h1>
        <p className="text-muted-foreground">تسجيل تحصيل من عميل (حركة دائن في كشف الحساب)</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>تسجيل التحصيل</CardTitle>
            <CardDescription>اختر العميل، المبلغ، التاريخ، وملاحظات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>العميل *</Label>
                <Select
                  value={form.watch("customerId")}
                  onValueChange={(v) => form.setValue("customerId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.customerId && (
                  <p className="text-sm text-destructive">{form.formState.errors.customerId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>المبلغ *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0.01}
                  {...form.register("amount", { valueAsNumber: true })}
                  placeholder="المبلغ المحصّل"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>التاريخ *</Label>
                <Input type="datetime-local" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input {...form.register("notes")} placeholder="ملاحظات" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-primary">تم تسجيل التحصيل بنجاح.</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "جاري التسجيل..." : "تسجيل التحصيل"}
              </Button>
              {selectedCustomerId && (
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/customers/${selectedCustomerId}/statement`}>
                    عرض حركات العميل
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default function AdminCollectionPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">جاري التحميل...</p>}>
      <AdminCollectionContent />
    </Suspense>
  );
}
