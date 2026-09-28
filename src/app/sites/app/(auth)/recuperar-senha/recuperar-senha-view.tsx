"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { account, AppwriteException, appwriteErrorInfo } from "@/lib/appwrite";
import { APP_URL } from "@/lib/env";

const emailSchema = z.object({ email: z.string().trim().email("Informe um e-mail válido.") });
type EmailValues = z.infer<typeof emailSchema>;

const passwordSchema = z.object({ password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.") });
type PasswordValues = z.infer<typeof passwordSchema>;

type RequestError = "rate_limited" | "network" | "unknown";
const REQUEST_ERROR_TEXT: Record<RequestError, string> = {
  rate_limited: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  network: "Não foi possível enviar agora. Tente novamente.",
  unknown: "Não foi possível enviar agora. Tente novamente.",
};

function mapRequestError(err: unknown): RequestError {
  if (!(err instanceof AppwriteException)) return "network";
  const { status } = appwriteErrorInfo(err);
  if (status === 429) return "rate_limited";
  return "unknown";
}

type ResetError = "expired" | "weak_password" | "network" | "unknown";
const RESET_ERROR_TEXT: Record<Exclude<ResetError, "expired">, string> = {
  weak_password: "Senha fraca. Use pelo menos 8 caracteres.",
  network: "Não foi possível alterar sua senha agora. Tente novamente.",
  unknown: "Não foi possível alterar sua senha agora. Tente novamente.",
};

function mapResetError(err: unknown): ResetError {
  if (!(err instanceof AppwriteException)) return "network";
  const { status, type } = appwriteErrorInfo(err);
  if (status === 401 || type === "user_recovery_invalid") return "expired";
  if (type === "general_argument_invalid" || type === "user_password_personal_data") return "weak_password";
  return "unknown";
}

function RequestLinkForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<RequestError | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailValues>({ resolver: zodResolver(emailSchema), mode: "onBlur" });

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    try {
      await account.createRecovery({ email: email.trim().toLowerCase(), url: `${APP_URL}/recuperar-senha` });
      setSent(true);
    } catch (err) {
      setError(mapRequestError(err));
    }
  });

  if (sent) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-h1 text-fg italic">Verifique seu e-mail</h1>
        </div>
        <div className="flex items-start gap-2.5 rounded-md border border-info/30 bg-info/10 px-3.5 py-3 text-body-sm text-fg">
          <CheckCircle2 size={18} strokeWidth={1.75} className="mt-px shrink-0 text-info" aria-hidden />
          <p>Se houver uma conta com esse e-mail, você vai receber um link para criar uma nova senha.</p>
        </div>
        <Link href="/entrar" className="block text-center text-body-sm font-medium text-primary-text hover:underline">
          Voltar para Entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="font-display text-h1 text-fg italic">Esqueci minha senha</h1>
        <p className="mt-1 text-body text-fg-muted">Enviamos um link para você criar uma nova senha.</p>
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

      {error ? (
        <div className="flex items-start gap-2.5 rounded-md border border-flame/30 bg-flame-soft px-3.5 py-3 text-body-sm text-fg">
          <AlertCircle size={18} strokeWidth={1.75} className="mt-px shrink-0 text-flame" aria-hidden />
          <p>{REQUEST_ERROR_TEXT[error]}</p>
        </div>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar link"}
      </Button>

      <p className="text-center text-body-sm text-fg-muted">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-medium text-primary-text hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

function NewPasswordForm({ userId, secret }: { userId: string; secret: string }) {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<Exclude<ResetError, "expired"> | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), mode: "onBlur" });

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null);
    try {
      await account.updateRecovery({ userId, secret, password });
      router.replace("/entrar");
    } catch (err) {
      const mapped = mapResetError(err);
      if (mapped === "expired") setExpired(true);
      else setError(mapped);
    }
  });

  if (expired) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-h1 text-fg italic">Link expirado</h1>
          <p className="mt-1 text-body text-fg-muted">Este link expirou. Peça um novo.</p>
        </div>
        <Button size="lg" fullWidth onClick={() => router.replace("/recuperar-senha")}>
          Pedir novo link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <h1 className="font-display text-h1 text-fg italic">Nova senha</h1>
        <p className="mt-1 text-body text-fg-muted">Crie uma nova senha para sua conta.</p>
      </div>

      <PasswordInput
        label="Nova senha"
        hint="Pelo menos 8 caracteres."
        autoComplete="new-password"
        placeholder="••••••••"
        disabled={isSubmitting}
        error={errors.password?.message}
        {...register("password")}
      />

      {error ? (
        <div className="flex items-start gap-2.5 rounded-md border border-flame/30 bg-flame-soft px-3.5 py-3 text-body-sm text-fg">
          <AlertCircle size={18} strokeWidth={1.75} className="mt-px shrink-0 text-flame" aria-hidden />
          <p>{RESET_ERROR_TEXT[error]}</p>
        </div>
      ) : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}

export function RecuperarSenhaView() {
  const params = useSearchParams();
  const userId = params.get("userId");
  const secret = params.get("secret");
  if (userId && secret) return <NewPasswordForm userId={userId} secret={secret} />;
  return <RequestLinkForm />;
}
