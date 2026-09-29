# Lote: Painel "usuários+" (só web — backend + painel admin)

Aprovado pelo usuário em 29/09/2026. Vem depois do lote de navegação.

## Objetivo

Trazer para o painel admin (`admin.tosave.cloud`) ações que hoje só dá pra fazer no console do Appwrite, usando a Users API do Appwrite (o backend já fala com ela via `APPWRITE_API_KEY`, com escopo `sessions.write` e `users.write`, ver `src/services/appwrite.ts`).

## Escopo

1. **Verificação de e-mail:** mostrar na lista e no detalhe do usuário; permitir marcar/desmarcar à mão.
2. **Sessões:** listar sessões ativas (aparelho, navegador, IP, país, data) no detalhe do usuário; encerrar uma ou todas. Encerrar todas automaticamente ao bloquear um usuário.
3. **Atividades:** histórico de eventos (login, troca de senha, sessão criada/encerrada) com IP, aparelho e data, no detalhe do usuário.
4. **Redefinir senha:** botão "enviar e-mail de redefinição" no detalhe do usuário.
5. **Excluir conta pelo painel:** reaproveita a mesma exclusão usada pelo app (Postgres + Appwrite), agora acessível a um admin.
6. **Registro das ações de admin:** cada ação (bloquear, dar/tirar admin, encerrar sessão, excluir conta, etc.) grava no nosso banco quem fez, o quê e quando — porque o log de atividades do Appwrite expira.
7. **Correção do bug de senha:** em `account.service.ts`/`appwrite.ts` (`passwordMatches`), separar `user_invalid_credentials` (senha errada de verdade) de `user_unauthorized` (problema de configuração/escopo) e registrar no log o segundo caso, em vez de devolver "Senha incorreta" nos dois.

## Fora de escopo

- Definir senha direto pelo painel (preferimos o e-mail de redefinição).
- MFA, login social, envio de mensagens pelo Appwrite.

## Execução

- **Backend (Alicerce):** rotas `/admin/users/:id/sessions`, `/admin/users/:id/sessions/:sessionId` (DELETE), `/admin/users/:id/logs`, `/admin/users/:id/verify-email`, `/admin/users/:id/send-recovery`, `/admin/users/:id` (DELETE), tabela de auditoria (migration aditiva). Branch `feat/painel-usuarios-mais`, commit sem push.
- **Painel (Lanterna):** telas do detalhe do usuário com as novas ações. Só começa depois que o Alicerce entregar as rotas (ou junto, se o contrato for combinado antes). Branch `feat/painel-usuarios-mais`, commit sem push.
- **Critério de pronto:** e2e do backend passando; typecheck e `next build --webpack` limpos no painel; teste local do usuário antes do deploy.
