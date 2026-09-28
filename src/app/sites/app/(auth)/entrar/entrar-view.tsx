"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Input, PasswordInput } from "@/components/ui/input";
import { useAuth, type SignInError } from "@/lib/auth";
import { useGuestOnly } from "../use-guest-only";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});
type Values = z.infer<typeof schema>;

const ERROR_TEXT: Record<SignInError, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  blocked: "Sua conta está desativada.",
  rate_limited: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  network: "Não foi possível entrar agora. Tente novamente.",
  unknown: "Não foi possível entrar agora. Tente novamente.",
};

/** Só caminhos internos do app (evita redirecionar para fora). */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function EntrarForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const expired = params.get("expired") === "1";
  const [error, setError] = useState<SignInError | null>(null);
  const {
    register,
    handleSubmit,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setFocus("email");
  }, [setFocus]);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null);
    const result = await signIn(email, password);
    if (result.ok) {
      router.push(next);
      return;
    }
    setError(result.error);
    if (result.error === "invalid_credentials") {
      resetField("password");
      setFocus("password");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {expired && !error ? (
        <div className="flex items-center gap-2 rounded-md bg-info/10 px-3 py-2 text-body-sm text-fg">
          <Info size={16} strokeWidth={1.75} className="text-info" aria-hidden />
          Sua sessão expirou. Entre de novo.
        </div>
      ) : null}
      <div>
        <h1 className="font-display text-h1 text-fg italic">Entrar</h1>
        <p className="mt-1 text-body text-fg-muted">Bem-vindo de volta à sua garagem.</p>
      </div>

      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="voce@email.com"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordInput
        label="Senha"
        autoComplete="current-password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />
      <p className="-mt-3 text-right">
        <Link href="/recuperar-senha" className="text-body-sm font-medium text-primary-text hover:underline">
          Esqueci minha senha
        </Link>
      </p>

      {error ? <Alert>{ERROR_TEXT[error]}</Alert> : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-body-sm text-fg-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-primary-text hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function EntrarView() {
  const checking = useGuestOnly();
  if (checking) return null;
  return <EntrarForm />;
}
