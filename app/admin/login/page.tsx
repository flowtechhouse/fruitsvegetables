"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const nextParam = searchParams.get("next") ?? "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "auth" ? "فشل تسجيل الدخول. حاول مرة أخرى." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message || "فشل تسجيل الدخول");
      return;
    }
    router.push(nextParam);
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">تسجيل الدخول — الإدارة</CardTitle>
          <CardDescription className="text-center">
            القمسيونجي — Comssiongy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            لا يوجد لديك حساب؟{" "}
            <Link href="/admin/signup" className="underline hover:text-foreground">
              إنشاء حساب
            </Link>
            {" · "}
            <Link href="/" className="underline hover:text-foreground">
              العودة للرئيسية
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><p className="text-muted-foreground">جاري التحميل...</p></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
