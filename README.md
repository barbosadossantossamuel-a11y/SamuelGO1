# PedidoGO

Cardápios digitais e pedidos pelo WhatsApp.

## Deploy na Vercel

1. Importe o repositório `barbosadossantossamuel-a11y/SamuelGO1` na Vercel.
2. Use a raiz do repositório como **Root Directory**.
3. Deixe o framework como **Vite**.
4. O projeto já inclui `vercel.json` com:
   - Build: `pnpm build`
   - Saída: `dist/public`
   - Backend serverless em `api/index.ts`
   - Rewrites para `/api/trpc` e `/api/oauth/callback`
5. Configure as variáveis de ambiente do ambiente WebDev/Manus no painel da Vercel, especialmente `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`.
6. Faça o deploy usando a branch `main`.

> Nunca coloque tokens, senhas ou arquivos `.env` no GitHub. Os secrets devem ser cadastrados em Vercel → Settings → Environment Variables.

## Desenvolvimento local

```bash
pnpm install
pnpm dev
```

## Validação

```bash
pnpm check
pnpm test
pnpm build
```
