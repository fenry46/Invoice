"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionResult } from "@/app/_actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  mode: "login" | "register";
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const isLogin = mode === "login";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isLogin ? "Masuk" : "Buat Akun"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Masukkan email dan kata sandi Anda."
              : "Daftar untuk mulai membuat faktur."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={8}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimal 8 karakter.
                </p>
              )}
            </div>

            {state && !state.ok && (
              <p
                role="alert"
                className="text-sm text-destructive"
              >
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending
                ? "Memproses…"
                : isLogin
                  ? "Masuk"
                  : "Daftar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </>
        ) : (
          <>
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Masuk
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
