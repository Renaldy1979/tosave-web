"use client";

import { api, ApiError } from "./api";

/** Conta no backend próprio — `/v2/me` (`backendToSave/docs/API-V2.md`). */

/** `phone: null` limpa o telefone cadastrado. */
export function updateMyPhone(phone: string | null): Promise<{ phone: string | null }> {
  return api<{ phone: string | null }>("/v2/me", { method: "PUT", body: { phone } });
}

export type DeleteAccountError = "wrong_password" | "rate_limited" | "network" | "unknown";
export type DeleteAccountResult = { ok: true } | { ok: false; error: DeleteAccountError };

/**
 * `POST /v2/me/delete`: confere a senha, apaga os dados e a conta.
 *
 * `on401: "return"`: senha errada também é 401 (`API-V2.md`), mas não é
 * sessão morta — sem isso, o cliente HTTP derrubaria a sessão e mandaria
 * para `/entrar` como se a exclusão tivesse dado certo.
 */
export async function deleteMyAccount(password: string): Promise<DeleteAccountResult> {
  try {
    await api<{ ok: true }>("/v2/me/delete", { method: "POST", body: { password }, on401: "return" });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) return { ok: false, error: "wrong_password" };
      if (err.status === 429) return { ok: false, error: "rate_limited" };
      if (err.status === 0) return { ok: false, error: "network" };
    }
    return { ok: false, error: "unknown" };
  }
}
