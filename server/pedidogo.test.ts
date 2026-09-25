import { describe, expect, it } from "vitest";
import { slugify } from "./db";

describe("PedidoGO tenant helpers", () => {
  it("creates URL-safe slugs from establishment names", () => {
    expect(slugify("Açaí & Burger do Centro")).toBe("acai-burger-do-centro");
    expect(slugify("  Meu Negócio  ")).toBe("meu-negocio");
  });

  it("keeps a safe fallback when the name has no letters", () => {
    expect(slugify("***")).toBe("meu-cardapio");
  });
});
