import { BadRequestException } from "@nestjs/common";

export const MIN_RELATO = 20;
export const MAX_RELATO = 8000;

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(as\s+)?(regras|instru[çc][õo]es|o\s+que\s+foi\s+dito)/i,
  /desconsidere\s+(as\s+)?(regras|instru[çc][õo]es)/i,
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+instructions/i,
  /revele?\s+(o\s+)?(seu\s+)?(prompt|system\s*prompt)/i,
  /you\s+are\s+now\s+/i,
];

export function hasInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

const CNPJ_RE = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;
const CPF_RE = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const CARD_RE = /\b(?:\d[ -]?){13,16}\b/g;

export function maskSensitive(text: string): string {
  return text
    .replace(CNPJ_RE, "***")
    .replace(CPF_RE, "***")
    .replace(CARD_RE, "***");
}

export function assertWithinLimits(text: string): void {
  if (text.length < MIN_RELATO) {
    throw new BadRequestException({
      code: "VALIDATION_ERROR",
      message: `O relato deve ter no mínimo ${MIN_RELATO} caracteres`,
    });
  }
  if (text.length > MAX_RELATO) {
    throw new BadRequestException({
      code: "VALIDATION_ERROR",
      message: `O relato deve ter no máximo ${MAX_RELATO} caracteres`,
    });
  }
}
