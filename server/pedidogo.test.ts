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


describe("delivery zone helpers", () => {
  it("matches neighborhoods ignoring accents, case, and extra spaces", async () => {
    const { resolveDeliveryZone } = await import("./db");
    const zone = resolveDeliveryZone([{ neighborhood: "Jardim América", fee: 800, estimatedMinutes: 40 }], "  jardim   america ");
    expect(zone).toMatchObject({ fee: 800, estimatedMinutes: 40 });
  });

  it("returns no zone when the neighborhood is outside the delivery area", async () => {
    const { resolveDeliveryZone } = await import("./db");
    expect(resolveDeliveryZone([{ neighborhood: "Centro", fee: 500, estimatedMinutes: 30 }], "Bairro Novo")).toBeUndefined();
  });
});
