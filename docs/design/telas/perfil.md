# Perfil — `/profile`

**Decisão:** o perfil edita **nome, e-mail e senha**. A troca de senha exige a senha atual.
Somente autenticado; deslogado → `/login?callbackUrl=/profile`.

**Objetivo:** identidade do colecionador + conta + preferências. Curto, elegante, sem cara de "formulário de cadastro". A edição acontece em modais, e a página principal é de leitura.

## Layout

```
Navbar
┌ CAPA (ink, h-40 lg:h-56, bg-hero-glow) ───────────────────────────────┐
└────────────────────────────────────────────────────────────────────────┘
   ( Avatar 96px )   Renata Souza                      ← h1 font-display
   -mt-12, ring-4    Colecionador desde mar/2026       ← body-sm fg-subtle
   ring-bg           [Badge primary: Administrador]    (só ADMIN)

┌ RESUMO DA COLEÇÃO ───────────────────────────────┐
│  128 unidades · 112 modelos · 16 repetidos       │  números font-display italic
│  Últimas adicionadas:  ▢ ▢ ▢ ▢ ▢   Ver coleção → │  5 thumbs 64px rounded-md
└──────────────────────────────────────────────────┘

┌ CONTA ───────────────────────────────────────────┐
│  Nome      Renata Souza                 [Editar] │
│  E-mail    renata@email.com             [Editar] │
│  Senha     ••••••••                    [Alterar] │
└──────────────────────────────────────────────────┘

┌ PREFERÊNCIAS ────────────────────────────────────┐
│  Tema      ( Escuro | Claro | Sistema )          │  ← segmented control
└──────────────────────────────────────────────────┘

[ Painel administrativo → ]   (só ADMIN, Button secondary)
[ Sair ]                      (Button ghost, text-danger)
```

- Coluna única `max-w-[720px] mx-auto`; cards `rounded-lg bg-surface shadow-card p-5 sm:p-6`, espaçados 16 px.
- Linhas da "Conta": `grid grid-cols-[96px_1fr_auto] items-center py-3 border-b border-border`; label `body-sm fg-subtle`, valor `body`, ação `Button ghost sm`.
- Avatar: iniciais em `font-display` 36 px, `bg-primary-soft text-primary-text`.
- Segmented control: container `bg-surface-2 rounded-md p-1`, item ativo `bg-surface-3 text-fg shadow-card`.

## Modais de edição (Modal `md`, BottomSheet no mobile)

| Modal | Campos | Regras |
|---|---|---|
| **Editar nome** | Nome * | Pré-preenchido. Salvar desabilitado sem mudança. |
| **Editar e-mail** | Novo e-mail * · Senha atual * | Confirmar com a senha atual é recomendação de segurança; se o Backend não exigir, o campo sai. Erro: "Este e-mail já está em uso." |
| **Alterar senha** | Senha atual * · Nova senha * (medidor de força) · Confirmar nova senha * | Senha atual obrigatória (decisão). Erros: "Senha atual incorreta." (inline no campo) · "As senhas não coincidem." · regra Zod da nova senha. |

- Footer: Cancelar (secondary) + Salvar (primary, loading "Salvando…").
- Sucesso: fecha o modal, o valor da página atualiza e vem o toast "Nome atualizado." / "E-mail atualizado." / "Senha alterada."
- Após trocar o e-mail, a sessão é atualizada (o nome/e-mail no menu do avatar muda na hora).

## Estados
| Estado | Comportamento |
|---|---|
| Carregando | skeleton da capa + circle do avatar + 3 cards de linhas |
| Coleção vazia | o card "Resumo" mostra `EmptyState kind="no-content" size="sm"` → "Nenhum conteúdo disponível." + link "Explorar catálogo" |
| Erro de servidor no modal | Alert `flame-soft` no topo do modal; dados digitados preservados |
| Erro ao carregar | `ErrorState` |

## Mobile
Capa `h-32`; avatar 80 px centralizado; nome/data centralizados; cards full-width; nas linhas da Conta o valor quebra abaixo do label (`grid-cols-[1fr_auto]`, label em cima). "Sair" `Button secondary fullWidth` no fim. TabBar com "Perfil" ativo.
