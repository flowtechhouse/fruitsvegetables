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

const schema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
  date: z.string().min(1, "التاريخ مطلوب"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type TreasuryEntry = {
  id: string;
  type: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
};

export default function AdminTreasuryPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<TreasuryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "deposit",
      amount: 0,
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    },
  });

  async function loadBalance() {
    const { data } = await invokeEdgeFunction<{ balance: number }>("list-treasury-entries", {
      method: "GET",
      query: { balanceOnly: "true" },
    });
    setBalance(data?.balance ?? 0);
  }

  async function loadEntries() {
    const { data } = await invokeEdgeFunction<TreasuryEntry[]>("list-treasury-entries", {
      method: "GET",
    });
    setEntries(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    (async () => {
      await loadBalance();
      await loadEntries();
      setLoading(false);
    })();
  }, []);

  async function onSubmit(data: FormData) {
    setError(null);
    setSubmitting(true);
    const { error: resErr } = await invokeEdgeFunction("create-treasury-entry", {
      body: {
        type: data.type,
        amount: data.amount,
        date: data.date,
        notes: data.notes || undefined,
      },
    });
    setSubmitting(false);
    if (resErr) {
      setError(resErr.message);
      return;
    }
    form.reset({
      type: data.type,
      amount: 0,
      date: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    await loadBalance();
    await loadEntries();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الخزينة</h1>
        <p className="text-muted-foreground">رصيد الخزينة وإيداعات/سحوبات</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>رصيد الخزينة</CardTitle>
          <CardDescription>إجمالي الإيداعات ناقص السحوبات</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">جاري التحميل...</p>
          ) : (
            <p className="text-2xl font-bold">{(balance ?? 0).toFixed(2)}</p>
          )}
        </CardContent>
      </Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>إيداع / سحب</CardTitle>
            <CardDescription>تسجيل حركة خزينة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع الحركة *</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as "deposit" | "withdrawal")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">إيداع</SelectItem>
                    <SelectItem value="withdrawal">سحب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0.01}
                  {...form.register("amount", { valueAsNumber: true })}
                  placeholder="المبلغ"
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "جاري التسجيل..." : "تسجيل الحركة"}
            </Button>
          </CardContent>
        </Card>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>حركات الخزينة</CardTitle>
          <CardDescription>آخر الحركات</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    لا توجد حركات
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.date).toLocaleString("ar-EG")}</TableCell>
                    <TableCell>{e.type === "deposit" ? "إيداع" : "سحب"}</TableCell>
                    <TableCell>{e.amount.toFixed(2)}</TableCell>
                    <TableCell>{e.notes ?? "—"}</TableCell>
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
