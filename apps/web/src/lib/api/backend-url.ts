const LOCAL_FALLBACK = "http://localhost:3001/api/v1";
const PREFIX = "/api/v1";

/**
 * Normaliza a base da API para sempre conter esquema e o prefixo global `/api/v1`.
 * Aceita desde um host do Render (`opspilot-api.onrender.com`, via fromService),
 * uma URL completa (`https://host`) ou uma base já com o prefixo.
 */
export function resolveApiBase(raw?: string): string {
  const value = (raw ?? "").trim();
  if (!value) {
    return LOCAL_FALLBACK;
  }

  let url = value;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, "");

  if (!url.toLowerCase().endsWith(PREFIX)) {
    url = `${url}${PREFIX}`;
  }

  return url;
}
