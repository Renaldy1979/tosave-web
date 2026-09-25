# Login — `/login`

**Objetivo:** entrar em < 10 s. Tela de marca forte, formulário mínimo. Logado → redireciona `/`.

## Layout base de Auth (compartilhado com /register e /setup)

```
Desktop (lg+) — split 50/50, altura 100dvh
┌───────────────────────────────┬──────────────────────────────┐
│ ASIDE (ink)                   │                              │
│  bg-hero-glow                 │      [card do formulário]    │
│                               │       max-w-[400px]          │
│   LOGO 220px                  │                              │
│                               │                              │
│   Sua garagem em escala 1:64. │                              │
│                               │                              │
│   mosaico 3×2 de thumbs reais │                              │
│   (6 carros mais recentes,    │                              │
│   rounded-lg, opacity-70,     │                              │
│   leve inclinação -4°)        │                              │
└───────────────────────────────┴──────────────────────────────┘
```

- **Aside** (`hidden lg:flex`): superfície ink, logo, frase em `display-xl font-display italic`, mosaico com as 6 miniaturas mais recentes do banco (`imagemThumb`). Se houver menos de 6 com imagem, o mosaico some e fica só logo + frase (nada de placeholder falso). Máscara gradiente na base (`from-ink`).
- **Coluna do formulário:** `bg-bg`, centralizada vertical e horizontalmente. Link "← Voltar ao catálogo" `body-sm ghost` no topo-esquerdo.
- **Mobile / < lg:** sem aside. Topo com faixa ink de 160 px (logo 160 px centralizada + `bg-hero-glow`), e o formulário sobe sobre ela num card `rounded-t-xl bg-bg -mt-6` ocupando o resto da tela. Sensação de app nativo.

## Formulário

```
Entrar                                ← h1
Bem-vindo de volta à sua garagem.     ← body fg-muted

E-mail      [ voce@email.com        ]
Senha       [ ••••••••          👁 ]

[            Entrar             ]     ← Button primary lg fullWidth

──────────────  ou  ──────────────
Ainda não tem conta? Criar conta      ← link text-primary-text
```

- Validação Zod no blur + no submit: e-mail válido, senha obrigatória.
- Enter envia. Autofocus no e-mail (desktop apenas; mobile não, para não abrir o teclado de cara).
- `autocomplete="email"` e `"current-password"`.
- Após sucesso: redireciona ao `callbackUrl` se houver (ex.: veio de /collections), senão `/`. ADMIN também vai para `/` (o painel fica acessível pelo menu).

## Estados

| Estado | Visual |
|---|---|
| Default | como acima |
| Erro de campo | Input em estado erro com mensagem: "Informe um e-mail válido." / "Informe sua senha." |
| Enviando | botão `loading` ("Entrando…"), campos `disabled` |
| Credenciais inválidas | **Alert** acima do botão: `rounded-md bg-flame-soft border border-flame/30 text-fg body-sm`, ícone `AlertCircle text-flame`: "E-mail ou senha incorretos." Foco volta à senha, senha limpa |
| Usuário inativo (`status`) | mesmo Alert: "Sua conta está desativada. Fale com o administrador." |
| Erro de servidor/rede | Alert: "Não foi possível entrar agora. Tente novamente." |
| Veio de rota protegida | Banner info acima do título: `Lock` "Entre para acessar sua coleção." |

## Modal de login rápido

Usado quando um visitante toca no coração (favoritar) ou em "Adicionar à coleção". `Modal md` (BottomSheet no mobile): logo 120 px, título "Entre para salvar na sua coleção", mesmo formulário, link "Criar conta". Após sucesso, **executa a ação pendente** (adiciona o carro) e fecha, com toast "Adicionado à sua coleção."
