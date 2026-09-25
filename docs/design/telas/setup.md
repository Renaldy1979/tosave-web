# Setup inicial — `/setup`

**Objetivo:** criar o primeiro ADMIN. É a **primeira tela que alguém vê** no produto recém-instalado — precisa transmitir "produto pronto", não "tela técnica". Qualquer rota redireciona para cá enquanto não existir ADMIN; depois disso, `/setup` fica bloqueada para sempre.

## Layout

Variação do layout de Auth, mas **sem mosaico** (ainda não há carros no banco):

- **Aside (lg+, ink):** logo 220 px, título `display-xl font-display italic` "Vamos ligar os motores.", e uma lista de 3 passos com ícones em círculo `bg-primary-soft text-primary-text`:
  1. `ShieldCheck` **Crie o administrador** — conta com acesso total ao painel.
  2. `Layers` **Cadastre marcas e séries** — a base do catálogo.
  3. `Car` **Adicione as miniaturas** — com fotos e galeria.
  Passo 1 destacado (`text-fg`, conector vertical com gradiente `flame`); 2 e 3 `text-fg-subtle`.
- **Mobile:** faixa ink com logo; os 3 passos viram um stepper horizontal compacto (3 dots + "Passo 1 de 3") acima do formulário.

## Formulário

```
CONFIGURAÇÃO INICIAL                 ← eyebrow text-primary-text
Criar administrador                  ← h1
Esta conta terá acesso total ao painel da ToSave.

Nome              [                  ]
E-mail            [                  ]
Senha             [              👁 ]   ▰▰▰▱ Boa
Confirmar senha   [              👁 ]

[        Criar administrador        ]   ← Button flame lg fullWidth
🔒 Esta página será desativada após a criação.   ← caption fg-subtle
```

Mesmas regras de validação e medidor do `/register`.

## Estados

| Estado | Visual |
|---|---|
| Erros de campo | idênticos ao /register |
| Enviando | botão loading "Criando administrador…" |
| Erro de servidor | Alert flame-soft: "Não foi possível concluir a configuração. Tente novamente." |
| **Sucesso** | Tela de conclusão no mesmo card (sem navegar): ícone `CheckCircle2` 56 px `text-success` com anel de glow, título "Tudo pronto!", texto "Sua conta de administrador foi criada.", `Button primary lg` "Ir para o painel" (→ `/admin`, já autenticado se o Backend fizer login automático; senão → `/login`) |
| **Já existe ADMIN** (acesso posterior) | Middleware redireciona para `/login` (ou `/` se logado). Não renderizar nenhuma mensagem sobre a existência do setup |
