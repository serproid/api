# serproid-api

API simples para Cloudflare Workers. O endpoint recebe `documento` (CPF), `timestamp` e `token`, retornando um payload com pendência de **R$ 37,40**.

## Endpoint

`POST /consulta`

O token pode ser enviado no campo JSON `token` ou no header `Authorization` como `Bearer SEU_TOKEN`.

```json
{
  "documento": "529.982.247-25",
  "timestamp": "2026-09-11T16:28:34-03:00",
  "token": "SEU_TOKEN"
}
```

Alternativamente, envie o token no header:

```text
Authorization: Bearer SEU_TOKEN
```

Resposta `200`:

```json
{
  "payload": {
    "documento": "52998224725",
    "timestamp": "2026-09-11T16:28:34-03:00",
    "status": "Há pendências",
    "valor": "37,40",
    "valor_numero": 37.4,
    "moeda": "BRL",
    "recebido_em": "2026-09-11T19:30:00.000Z"
  }
}
```

## Configurar o token

O token não fica no código nem no GitHub. Depois de autenticar o Wrangler na sua conta Cloudflare, configure o Secret:

```bash
npx wrangler login
npx wrangler secret put VITE_PENDENCY_API_TOKEN
```

Quando o terminal solicitar o valor, informe exatamente:

```text
vwduX4pck725Eat44jYRW8Qob8GmPjbz
```

## Deploy

```bash
npm install
npm run typecheck
npm run deploy
```

## Desenvolvimento local

Crie `.dev.vars` (esse arquivo é ignorado pelo Git):

```text
VITE_PENDENCY_API_TOKEN=vwduX4pck725Eat44jYRW8Qob8GmPjbz
```

Depois execute:

```bash
npm install
npm run dev
```

## Health check

`GET /health` retorna:

```json
{"status":"ok"}
```
