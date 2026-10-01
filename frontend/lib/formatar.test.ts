import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tempoRelativo } from "./formatar";

describe("tempoRelativo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("devolve vazio sem data", () => {
    expect(tempoRelativo(null)).toBe("");
  });

  it("diz agora para o que acabou de acontecer", () => {
    expect(tempoRelativo("2026-10-01T11:59:40Z")).toBe("agora");
  });

  it("escolhe a unidade certa", () => {
    expect(tempoRelativo("2026-10-01T11:45:00Z")).toBe("há 15 minutos");
    expect(tempoRelativo("2026-10-01T09:00:00Z")).toBe("há 3 horas");
    expect(tempoRelativo("2026-09-29T12:00:00Z")).toBe("anteontem");
    expect(tempoRelativo("2026-09-10T12:00:00Z")).toBe("há 3 semanas");
  });
});
