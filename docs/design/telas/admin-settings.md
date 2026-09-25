# Admin · Configurações — `/admin/settings`

**Decisão:** abas de **configurações gerais do app** + **gestão de usuários** (listar, alterar role, alterar status). Não há criação, edição de dados pessoais nem exclusão de usuários por aqui. O colecionador se cadastra em `/register`, e cada um edita os próprios dados em `/profile`.

## Estrutura

Abas no topo (estado na URL: `?tab=geral` | `?tab=usuarios`; padrão `geral`):

```
Sistema / Configurações
Configurações
[ Geral ]  [ Usuários  516 ]        ← Tabs: sublinhado 2px bg-flame no ativo, text-fg; inativo fg-muted
─────────────────────────────────────────────────────────────────
```
- Tabs: `h-11 body-sm font-medium`, contador em Badge `outline sm`. Mobile: as abas ocupam 50% cada.
- O StatCard "Usuários" do dashboard aponta para `/admin/settings?tab=usuarios`.

---

## Aba "Geral"

> ⚠️ **Campos pendentes.** A decisão cria a aba, mas os campos de configuração ainda não foram definidos (não existe tabela de settings no modelo). A spec define **o padrão visual**; o Forja implementa os campos que o Orquestrador listar.

**Padrão "SettingsSection":** cards empilhados `max-w-[880px]`, um por grupo:
```
┌ Nome do grupo ─────────────────────────────────────────────────┐
│ Descrição curta do grupo.                                       │
│ ─────────────────────────────────────────────────────────────── │
│ Label da configuração                        [ controle      ] │
│ Texto de ajuda body-sm fg-subtle                                │
│ ─────────────────────────────────────────────────────────────── │
│ Label                                         [Switch]          │
└─────────────────────────────────────────────────────────────────┘
                                        Alterações não salvas ● [Salvar]
```
- Linhas em `grid md:grid-cols-[1fr_320px] gap-4 py-4 border-b border-border`. Label `body font-medium`, ajuda `body-sm fg-subtle`, controle à direita (no mobile, abaixo).
- Controles possíveis: Input, Textarea, Switch, Select, ImageUpload.
- Barra de ações sticky (igual ao formulário admin) só aparece quando há alteração.
- Sem nenhum campo definido: `EmptyState kind="no-content" size="lg"` → "Nenhum conteúdo disponível."

---

## Aba "Usuários"

```
[🔍 Nome ou e-mail        ]  Papel: [Todos ▾]  Status: [Todos ▾]

┌──────────────────────────────────────────────────────────────────────────────┐
│ ( RS ) Renata Souza   Você        [Administrador ▾]   [● Ativo    ▾]   mar/2026│
│        renata@email.com                (desabilitado)    (desabilitado)       │
├──────────────────────────────────────────────────────────────────────────────┤
│ ( JP ) João Pereira              [Colecionador  ▾]   [○ Inativo  ▾]   jan/2026│
│        joao@email.com                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
1–20 de 516                       ‹ 1 2 3 … 26 ›
```

- Card-lista: Avatar 40 px (iniciais), nome `body font-semibold` + e-mail `body-sm fg-subtle`, data de criação `caption fg-subtle`.
- **Alterar role e status inline**, com `Select` compacto (`h-9`) em cada linha:
  - Papel: Administrador / Colecionador. O trigger tem estilo de Badge (`primary` para admin, `neutral` para colecionador).
  - Status: Ativo / Inativo, com o dot `success` / `fg-subtle` no trigger.
- Toda alteração pede confirmação:
  - Promover: ConfirmDialog (não destrutivo, botão `primary`): "Tornar **{name}** administrador?", com o texto "Terá acesso total ao painel."
  - Rebaixar: "Remover acesso de administrador de **{name}**?"
  - Desativar: ConfirmDialog `danger`: "Desativar **{name}**?", com o texto "Não conseguirá entrar até ser reativado."
  - Reativar: aplica direto, sem dialog.
  - Após confirmar: o Select mostra loading e depois vem o toast "Usuário atualizado."; em erro, reverte e vem o toast "Não foi possível atualizar o usuário."
- **Proteção:** na linha do admin logado aparece o Badge "Você", e os dois Selects ficam desabilitados com tooltip "Você não pode alterar a própria conta aqui." Isso impede o sistema de ficar sem ADMIN.
- `Pagination numbered`.
- **Mobile:** linha-cartão. Avatar + nome/e-mail no topo; os dois Selects lado a lado (`flex-1`) abaixo; data em `caption`.

## Estados
| Estado | Comportamento |
|---|---|
| Carregando | 8 linhas skeleton (circle + 2 linhas + 2 rects) |
| Só o admin cadastrado | lista com o admin + `EmptyState kind="no-content" size="sm"` abaixo: "Nenhum conteúdo disponível." |
| Busca/filtro sem resultado | `EmptyState kind="no-content" size="sm"` + "Limpar filtros" |
| Erro | `ErrorState` dentro da aba |
