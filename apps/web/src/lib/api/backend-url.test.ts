import { describe, expect, it } from "vitest";
import { resolveApiBase } from "./backend-url";

describe("resolveApiBase", () => {
  it("usa o fallback local quando vazio", () => {
    expect(resolveApiBase(undefined)).toBe("http://localhost:3001/api/v1");
    expect(resolveApiBase("")).toBe("http://localhost:3001/api/v1");
  });

  it("adiciona o prefixo /api/v1 quando ausente", () => {
    expect(resolveApiBase("http://localhost:3001")).toBe(
      "http://localhost:3001/api/v1"
    );
    expect(resolveApiBase("https://opspilot-api.onrender.com")).toBe(
      "https://opspilot-api.onrender.com/api/v1"
    );
  });

  it("adiciona https:// quando o host vem sem esquema (fromService host)", () => {
    expect(resolveApiBase("opspilot-api.onrender.com")).toBe(
      "https://opspilot-api.onrender.com/api/v1"
    );
  });

  it("remove barra final e não duplica o prefixo", () => {
    expect(resolveApiBase("https://opspilot-api.onrender.com/")).toBe(
      "https://opspilot-api.onrender.com/api/v1"
    );
    expect(resolveApiBase("https://opspilot-api.onrender.com/api/v1")).toBe(
      "https://opspilot-api.onrender.com/api/v1"
    );
    expect(resolveApiBase("https://opspilot-api.onrender.com/api/v1/")).toBe(
      "https://opspilot-api.onrender.com/api/v1"
    );
  });
});
