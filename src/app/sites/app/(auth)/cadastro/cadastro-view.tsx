"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Input, PasswordInput } from "@/components/ui/input";
import { account, AppwriteException, appwriteErrorInfo, uuidV4 } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { SITE_URL } from "@/lib/env";
import { useGuestOnly } from "../use-guest-only";

const schema = z
  .object({
    name: z.string().trim().min(1, "Informe seu nome."),
    email: z.string().trim().email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
type Values = z.infer<typeof schema>;

type RegisterError = "email_in_use" | "weak_password" | "network" | "unknown";

const ERROR_TEXT: Record<RegisterError, string> = {
  email_in_use: "Este e-mail já está em uso.",
  weak_password: "Escolha uma senha mais forte.",
  network: "Não foi possível criar sua conta agora. Tente novamente.",
  unknown: "Não foi possível criar sua conta agora. Tente novamente.",
};

function mapError(err: unknown): RegisterError {
  if (!(err instanceof AppwriteException)) return "network";
  const { type } = appwriteErrorInfo(err);
  if (type === "user_already_exists") return "email_in_use";
  if (type === "general_argument_invalid" || type === "user_password_personal_data") return "weak_password";
  return "unknown";
}

const STRENGTH = [
  { label: "Fraca", className: "bg-danger" },
  { label: "Razoável", className: "bg-warning" },
  { label: "Boa", className: "bg-primary" },
  { label: "Forte", className: "bg-success" },
] as const;

function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrength(password);
  const level = STRENGTH[Math.max(score - 1, 0)];
  return (
    <div className="-mt-3 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full bg-surface-3", i < score && level.className)} />
        ))}
      </div>
      <span className="text-caption text-fg-subtle">{level.label}</span>
    </div>
  );
}

function CadastroForm() {
  const router = useRouter();
  const { reload } = useAuth();
  const [error, setError] = useState<RegisterError | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });
  const password = watch("password") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const trimmedEmail = values.email.trim().toLowerCase();
    try {
      await account.create({ userId: uuidV4(), email: trimmedEmail, password: values.password, name: values.name.trim() });
      await account.createEmailPasswordSession({ email: trimmedEmail, password: values.password });
      reload();
      router.push("/");
    } catch (err) {
      const mapped = mapError(err);
      if (mapped === "email_in_use") {
        setFieldError("email", { message: "Este e-mail já está em uso." });
        return;
      }
      setError(mapped);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="font-display text-h1 text-fg italic">Criar conta</h1>
        <p className="mt-1 text-body text-fg-muted">Comece a organizar sua coleção hoje.</p>
      </div>

      <Input label="Nome" autoComplete="name" placeholder="Seu nome" disabled={isSubmitting} error={errors.name?.message} {...register("name")} />
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
        hint="Pelo menos 8 caracteres."
        autoComplete="new-password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordStrengthMeter password={password} />
      <PasswordInput
        label="Confirmar senha"
        autoComplete="new-password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {error ? <Alert>{ERROR_TEXT[error]}</Alert> : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-caption text-fg-subtle">
        Ao criar a conta você concorda com os{" "}
        <a href={`${SITE_URL}/termos`} className="font-medium text-primary-text hover:underline">
          Termos de Uso
        </a>{" "}
        e a{" "}
        <a href={`${SITE_URL}/privacidade`} className="font-medium text-primary-text hover:underline">
          Política de Privacidade
        </a>
        .
      </p>

      <p className="text-center text-body-sm text-fg-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-primary-text hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function CadastroView() {
  const checking = useGuestOnly();
  if (checking) return null;
  return <CadastroForm />;
}
