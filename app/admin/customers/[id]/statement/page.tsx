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

type LedgerEntry = {
  id: string;
  type: string;
  amount: number;
  date: string;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
};

type Customer = { id: string; name: string };

export default function AdminCustomerStatementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [custRes, ledgerRes] = await Promise.all([
        invokeEdgeFunction<Customer[]>("list-customers", { method: "GET" }),
        invokeEdgeFunction<LedgerEntry[]>("get-customer-ledger", {
          method: "POST",
          body: { customerId: id },
        }),
      ]);
      const list = Array.isArray(custRes.data) ? custRes.data : [];
      setCustomer(list.find((c) => c.id === id) ?? null);
      setEntries(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
      setLoading(false);
    })();
  }, [id]);

  const balance = entries.reduce((sum, e) => sum + e.amount, 0);
  const typeLabel: Record<string, string> = {
    sale: "بيع",
    receipt: "تحصيل",
    allowance: "سماح",
    opening_balance: "رصيد افتتاحي",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">كشف حساب العميل</h1>
          <p className="text-muted-foreground">
            {customer ? customer.name : "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/customers">العملاء</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/collection?customerId=${id}`}>التحصيل</Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>الرصيد</CardTitle>
          <CardDescription>موجب = مدين، سالب = دائن</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{balance.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>حركات الحساب</CardTitle>
          <CardDescription>الحركات مرتبة حسب التاريخ</CardDescription>
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
                    <TableCell>{typeLabel[e.type] ?? e.type}</TableCell>
                    <TableCell className={e.amount >= 0 ? "text-foreground" : "text-muted-foreground"}>
                      {e.amount >= 0 ? "+" : ""}{e.amount.toFixed(2)}
                    </TableCell>
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
