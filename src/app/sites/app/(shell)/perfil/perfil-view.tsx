"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftRight, ChevronRight, FileText, Heart, Info, Lock, LogOut, Mail, Phone, ShieldCheck, Trash2, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { StatTile } from "@/components/app/stat-tile";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, PasswordInput } from "@/components/ui/input";
import { ThemeSegmented } from "@/components/ui/theme-toggle";
import { account, AppwriteException, appwriteErrorInfo } from "@/lib/appwrite";
import { errorMessage } from "@/lib/api";
import { useAuth, useMe } from "@/lib/auth";
import { useCollectionSummary } from "@/lib/collection-summary";
import { SITE_URL } from "@/lib/env";
import { deleteMyAccount, updateMyPhone, type DeleteAccountError } from "@/lib/me";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function ListRow({
  icon: Icon,
  label,
  value,
  onClick,
  href,
  external,
  danger,
  showChevron = true,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  danger?: boolean;
  showChevron?: boolean;
}) {
  const content = (
    <>
      <Icon size={18} strokeWidth={1.75} className={danger ? "text-danger" : "text-fg-subtle"} aria-hidden />
      <span className={`flex-1 text-body-sm font-medium ${danger ? "text-danger" : "text-fg"}`}>{label}</span>
      {value ? <span className="truncate text-body-sm text-fg-subtle">{value}</span> : null}
      {showChevron && (onClick || href) ? <ChevronRight size={16} strokeWidth={1.75} className="text-fg-subtle" aria-hidden /> : null}
    </>
  );
  const cls = "flex min-h-13 items-center gap-3 border-b border-border px-4 last:border-b-0 text-left transition duration-fast hover:bg-surface-3/50";
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full ${cls}`}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

export function PerfilView() {
  const router = useRouter();
  const me = useMe();
  const { signOut, reload } = useAuth();
  const { summary } = useCollectionSummary();
  const [phone, setPhone] = useState(me.phone ?? "");
  const [editOpen, setEditOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-8">
      <h1 className="text-[1.5rem] leading-tight font-bold tracking-tight text-fg md:text-h1">Perfil</h1>

      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        <span className="flex size-22 items-center justify-center rounded-full bg-primary-soft font-display text-display-lg font-bold text-primary-text ring-2 ring-flame/60">
          {initials(me.name)}
        </span>
        <h2 className="mt-1 font-display text-h2 text-fg">{me.name}</h2>
        <p className="text-body-sm text-fg-muted">{me.email}</p>
        <Button variant="outline" size="sm" className="mt-1" onClick={() => setEditOpen(true)}>
          Editar perfil
        </Button>
      </div>

      <div className="mt-8 flex rounded-lg border border-border bg-surface p-3">
        <StatTile value={summary.totalItems} label="Itens" href="/colecao" />
        <StatTile value={summary.totalModels} label="Modelos" href="/colecao" />
        <StatTile value={summary.duplicates} label="Repetidos" href="/colecao" />
      </div>

      <div className="mt-8">
        <p className="mb-2 font-condensed text-eyebrow text-fg-subtle uppercase">Aparência</p>
        <ThemeSegmented />
      </div>

      <div className="mt-8">
        <p className="mb-2 font-condensed text-eyebrow text-fg-subtle uppercase">Conta</p>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <ListRow icon={Heart} label="Minha coleção" href="/colecao" />
          <ListRow icon={ArrowLeftRight} label="Clube da Troca" href="/troca" />
          <ListRow icon={Mail} label="E-mail" value={me.email} showChevron={false} />
          <ListRow icon={Phone} label="Telefone (WhatsApp)" value={phone || "Não cadastrado"} onClick={() => setPhoneOpen(true)} />
          <ListRow icon={Lock} label="Alterar senha" onClick={() => setPasswordOpen(true)} />
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
          <ListRow
            icon={LogOut}
            label="Sair"
            danger
            showChevron={false}
            onClick={() => {
              void signOut().then(() => router.push("/entrar"));
            }}
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-2 font-condensed text-eyebrow text-fg-subtle uppercase">Sobre</p>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <ListRow icon={FileText} label="Termos de Uso" href={`${SITE_URL}/termos`} external />
          <ListRow icon={ShieldCheck} label="Política de Privacidade" href={`${SITE_URL}/privacidade`} external />
          <ListRow icon={Info} label="Versão" value="1.0.0" showChevron={false} />
        </div>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <ListRow icon={Trash2} label="Excluir conta" danger showChevron={false} onClick={() => setDeleteOpen(true)} />
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/" className="text-caption text-fg-subtle">
          ToSave
        </Link>
      </div>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} name={me.name} email={me.email} onSaved={reload} />

      <PhoneSheet
        open={phoneOpen}
        onClose={() => setPhoneOpen(false)}
        phone={phone}
        onSave={async (next) => {
          try {
            const result = await updateMyPhone(next || null);
            setPhone(result.phone ?? "");
            setPhoneOpen(false);
            toast.success("Telefone atualizado.");
          } catch (err) {
            toast.error(errorMessage(err));
          }
        }}
      />

      <PasswordSheet
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSaved={() => {
          setPasswordOpen(false);
          toast.success("Senha alterada.");
        }}
      />

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          void signOut().then(() => router.push("/entrar"));
        }}
      />
    </div>
  );
}

function SheetShell({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 animate-fade-in bg-overlay/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-60 rounded-t-xl border border-border bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-modal focus:outline-none
            sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:pb-0"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="text-h3 text-fg">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="Fechar" className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-3 hover:text-fg">
                <X size={20} strokeWidth={1.75} />
              </button>
            </Dialog.Close>
          </div>
          <div className="space-y-4 px-5 py-5">{children}</div>
          <div className="px-5 pb-5">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditProfileSheet({
  open,
  onClose,
  name,
  email,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  onSaved: () => void;
}) {
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = draftName.trim() !== name.trim() || draftEmail.trim() !== email.trim();

  const handleSave = async () => {
    const emailChanged = draftEmail.trim().toLowerCase() !== email.toLowerCase();
    if (emailChanged) {
      setEmailError("Para trocar o e-mail, fale com o suporte.");
      return;
    }
    setEmailError(null);
    if (draftName.trim() === name.trim()) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await account.updateName({ name: draftName.trim() });
      onSaved();
      onClose();
      toast.success("Perfil atualizado.");
    } catch {
      toast.error("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Editar perfil"
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button fullWidth disabled={!dirty || !draftName.trim() || !draftEmail.trim() || saving} loading={saving} onClick={() => void handleSave()}>
            Salvar
          </Button>
        </div>
      }
    >
      <Input label="Nome" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
      <Input label="E-mail" type="email" value={draftEmail} error={emailError ?? undefined} onChange={(e) => setDraftEmail(e.target.value)} />
    </SheetShell>
  );
}

function PhoneSheet({ open, onClose, phone, onSave }: { open: boolean; onClose: () => void; phone: string; onSave: (phone: string) => Promise<void> }) {
  const [draft, setDraft] = useState(phone);
  const [saving, setSaving] = useState(false);
  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Telefone (WhatsApp)"
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            fullWidth
            loading={saving}
            onClick={async () => {
              setSaving(true);
              await onSave(draft.trim());
              setSaving(false);
            }}
          >
            Salvar
          </Button>
        </div>
      }
    >
      <Input label="Telefone" hint="Usado no Clube da Troca para o contato via WhatsApp." placeholder="(11) 98765-4321" value={draft} onChange={(e) => setDraft(e.target.value)} />
    </SheetShell>
  );
}

type PasswordChangeError = "wrong_password" | "weak_password" | "rate_limited" | "network" | "unknown";

function mapPasswordChangeError(err: unknown): PasswordChangeError {
  if (!(err instanceof AppwriteException)) return "network";
  const { status, type } = appwriteErrorInfo(err);
  if (status === 429) return "rate_limited";
  if (type === "user_invalid_credentials" || status === 401) return "wrong_password";
  if (type === "general_argument_invalid") return "weak_password";
  return "unknown";
}

const PASSWORD_ERROR_TEXT: Record<Exclude<PasswordChangeError, "wrong_password">, string> = {
  weak_password: "Senha fraca. Use pelo menos 8 caracteres.",
  rate_limited: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  network: "Não foi possível alterar sua senha agora. Tente novamente.",
  unknown: "Não foi possível alterar sua senha agora. Tente novamente.",
};

function PasswordSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const valid = current.length > 0 && next.length >= 8;

  const handleSave = async () => {
    setBanner(null);
    setCurrentError(null);
    setSaving(true);
    try {
      await account.updatePassword({ password: next, oldPassword: current });
      setCurrent("");
      setNext("");
      onSaved();
    } catch (err) {
      const mapped = mapPasswordChangeError(err);
      if (mapped === "wrong_password") {
        setCurrentError("Senha atual incorreta.");
        setCurrent("");
      } else {
        setBanner(PASSWORD_ERROR_TEXT[mapped]);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Alterar senha"
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button fullWidth disabled={!valid || saving} loading={saving} onClick={() => void handleSave()}>
            Salvar
          </Button>
        </div>
      }
    >
      <PasswordInput label="Senha atual" value={current} error={currentError ?? undefined} onChange={(e) => setCurrent(e.target.value)} />
      <PasswordInput label="Nova senha" hint="Mínimo de 8 caracteres." value={next} onChange={(e) => setNext(e.target.value)} />
      {banner ? <p className="text-body-sm text-danger">{banner}</p> : null}
    </SheetShell>
  );
}

const DELETE_ERROR_TEXT: Record<Exclude<DeleteAccountError, "wrong_password">, string> = {
  rate_limited: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  network: "Sem conexão. Verifique sua internet e tente novamente.",
  unknown: "Não foi possível excluir sua conta agora. Tente novamente.",
};

function DeleteAccountDialog({ open, onOpenChange, onDeleted }: { open: boolean; onOpenChange: (open: boolean) => void; onDeleted: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError("Informe sua senha.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await deleteMyAccount(password);
    setLoading(false);
    if (result.ok) {
      setPassword("");
      onDeleted();
      return;
    }
    if (result.error === "wrong_password") {
      setError("Senha incorreta.");
      setPassword("");
    } else {
      setError(DELETE_ERROR_TEXT[result.error]);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(o) => {
        if (!loading) {
          onOpenChange(o);
          if (!o) {
            setPassword("");
            setError(null);
          }
        }
      }}
      title="Excluir conta?"
      confirmLabel="Excluir conta"
      onConfirm={() => void handleConfirm()}
      loading={loading}
    >
      <p>Sua conta e sua coleção são apagadas para sempre. Essa ação não pode ser desfeita.</p>
      <div className="mt-4 text-left">
        <PasswordInput label="Senha atual" placeholder="••••••••" value={password} error={error ?? undefined} onChange={(e) => setPassword(e.target.value)} />
      </div>
    </ConfirmDialog>
  );
}
