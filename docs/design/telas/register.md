# Cadastro — `/register`

**Objetivo:** criar conta de COLLECTOR em um passo. Mesmo layout de Auth do `/login` (aside ink com mosaico; mobile com faixa ink no topo).

## Formulário

```
Criar conta                                      ← h1
Comece a organizar sua coleção hoje.             ← body fg-muted

Nome              [                        ]
E-mail            [                        ]
Senha             [                    👁 ]
                  ▰▰▰▱  Boa                      ← medidor de força
Confirmar senha   [                    👁 ]

[             Criar conta             ]          ← Button primary lg fullWidth

Já tem conta? Entrar
```

- Todo cadastro público cria **COLLECTOR** (role não aparece na tela).
- **Medidor de força:** 4 segmentos 4 px `rounded-full`; cores por nível: `danger` → `warning` → `primary` → `success`; rótulo `caption` ("Fraca", "Razoável", "Boa", "Forte"). A regra mínima de senha é definida pelo Backend (Zod) — o texto de `hint` do campo repete essa regra.
- Confirmação: valida ao digitar após o primeiro blur; quando bate, ícone `Check text-success` no campo.
- `autocomplete`: `name`, `email`, `new-password`.
- Mobile: campos com `h-12` (mais toque); o botão segue o fluxo da página (não fixo), para não cobrir o teclado.

## Estados

| Estado | Visual |
|---|---|
| Erros de campo | "Informe seu nome." · "Informe um e-mail válido." · (regra de senha do Zod) · "As senhas não coincidem." |
| Enviando | botão loading "Criando conta…", campos disabled |
| E-mail já cadastrado | erro inline no campo e-mail: "Este e-mail já está em uso." + link "Entrar" dentro da mensagem |
| Erro de servidor | Alert flame-soft: "Não foi possível criar sua conta agora. Tente novamente." |
| Sucesso | login automático → `/` com toast "Conta criada. Bem-vindo à ToSave!" (se o Backend não fizer login automático: → `/login` com banner success "Conta criada. Entre para continuar.") |
