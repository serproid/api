const DEFAULT_VALUE = "37,40";
const CORS_HEADERS = {
  "access-control-allow-origin": "https://serproid.pages.dev",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-max-age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function normalizeCpf(documento) {
  return String(documento ?? "").replace(/\D/g, "");
}

function validCpf(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^([0-9])\1{10}$/.test(cpf)) return false;

  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(cpf[tamanho])) return false;
  }
  return true;
}

function validTimestamp(timestamp) {
  return typeof timestamp === "string" &&
    timestamp.trim() !== "" &&
    !Number.isNaN(Date.parse(timestamp));
}

function requestToken(request, dados) {
  const authorization = request.headers.get("Authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i);
  return dados.token ?? (bearer ? bearer[1] : "");
}

function configuredToken(env) {
  return env.VITE_PENDENCY_API_TOKEN || env.API_TOKEN || "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname === "/consulta") {
      return corsPreflight();
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok" });
    }

    if (request.method !== "POST" || url.pathname !== "/consulta") {
      return json({ erro: "Rota não encontrada." }, 404);
    }

    let dados;
    try {
      dados = await request.json();
    } catch {
      return json({ erro: "O corpo deve ser um JSON válido." }, 400);
    }

    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
      return json({ erro: "O corpo deve ser um JSON." }, 400);
    }

    if (requestToken(request, dados) !== configuredToken(env)) {
      return json({ erro: "Token inválido." }, 401);
    }

    const documento = normalizeCpf(dados.documento);
    if (!validCpf(documento)) {
      return json({ erro: "Documento inválido. Informe um CPF válido." }, 400);
    }

    if (!validTimestamp(dados.timestamp)) {
      return json({
        erro: "Timestamp inválido. Use ISO 8601, por exemplo 2026-09-11T16:28:34-03:00.",
      }, 400);
    }

    return json({
      payload: {
        documento,
        timestamp: dados.timestamp,
        status: "Há pendências",
        valor: DEFAULT_VALUE,
        valor_numero: 37.4,
        moeda: "BRL",
        recebido_em: new Date().toISOString(),
      },
    });
  },
};
