"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Input, PasswordInput } from "@/components/ui/input";
import { account, AppwriteException, appwriteErrorInfo } from "@/lib/appwrite";
import { useGuestOnly } from "../use-guest-only";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});
type Values = z.infer<typeof schema>;

type LoginError = "invalid_credentials" | "blocked" | "rate_limited" | "network" | "unknown";

const ERROR_TEXT: Record<LoginError, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  blocked: "Sua conta está desativada.",
  rate_limited: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  network: "Não foi possível entrar agora. Tente novamente.",
  unknown: "Não foi possível entrar agora. Tente novamente.",
};

function mapError(err: unknown): LoginError {
  if (!(err instanceof AppwriteException)) return "network";
  const { status, type } = appwriteErrorInfo(err);
  if (status === 429) return "rate_limited";
  if (type === "user_blocked") return "blocked";
  if (type === "user_invalid_credentials" || type === "general_argument_invalid" || status === 401) return "invalid_credentials";
  return "unknown";
}

function EntrarForm() {
  const router = useRouter();
  const [error, setError] = useState<LoginError | null>(null);
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
    try {
      await account.createEmailPasswordSession({ email: email.trim().toLowerCase(), password });
      router.push("/boas-vindas");
    } catch (err) {
      const mapped = mapError(err);
      setError(mapped);
      if (mapped === "invalid_credentials") {
        resetField("password");
        setFocus("password");
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
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
