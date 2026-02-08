"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
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

function AdminSignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message || "فشل إنشاء الحساب");
      return;
    }
    if (data?.user) {
      setSuccess(true);
      if (data.session) {
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }
      setError(null);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">تم إنشاء الحساب</CardTitle>
            <CardDescription className="text-center">
              إذا كان تأكيد البريد مفعّلاً في Supabase، تحقق من بريدك ثم سجّل الدخول. وإلا يمكنك تسجيل الدخول الآن.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/admin/login">تسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">إنشاء حساب إدارة</CardTitle>
          <CardDescription className="text-center">
            القمسيونجي — أول مرة؟ أنشئ حساباً ثم سجّل الدخول
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
              <Label htmlFor="password">كلمة المرور (6 أحرف على الأقل)</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            لديك حساب؟{" "}
            <Link href="/admin/login" className="underline hover:text-foreground">
              تسجيل الدخول
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      }
    >
      <AdminSignupForm />
    </Suspense>
  );
}
