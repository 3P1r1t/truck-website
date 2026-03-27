"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/site-dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const locale = useLocale("zh");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md rounded-sm border-white/10 bg-white/95 shadow-2xl">
        <CardHeader className="space-y-4">
          <span className="inline-flex rounded-sm bg-slate-950 px-2 py-1"><Image src="/tengyu.png" alt="Tengyu" width={170} height={44} className="h-9 w-auto" /></span>
          <CardTitle className="text-2xl uppercase tracking-tight">{t(locale, "admin_login_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              setError("");

              try {
                await adminLogin(username, password);
                document.cookie = "site_lang=zh; path=/; max-age=31536000";
                router.push("/admin/dashboard?lang=zh");
              } catch (err: any) {
                setError(err?.message || "Login failed");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em]">{t(locale, "admin_login_user")}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.16em]">{t(locale, "admin_login_password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="h-11 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.16em]" disabled={submitting}>
              {submitting ? "..." : t(locale, "admin_login_submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

