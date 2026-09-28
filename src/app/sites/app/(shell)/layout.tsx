import { AppShell } from "@/components/app/app-shell";
import { Toaster } from "@/components/ui/toaster";
import { CollectionStoreProvider } from "../_mock/collection-store";

/**
 * Casca das telas do colecionador (lote 5a, fase A). Sem checagem de
 * sessão: a fase A libera as rotas sem login para validar o visual
 * (docs/briefings/app-web-lote5.md); a fase B entra com a guarda real.
 */
export default function AppShellLayout({ children }: LayoutProps<"/sites/app">) {
  return (
    <CollectionStoreProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
    </CollectionStoreProvider>
  );
}
