import { describe, it, expect } from "vitest";
import { routing, localeDirection } from "@/i18n/routing";

describe("phase 1 skeleton", () => {
  it("supports English and Arabic locales", () => {
    expect(routing.locales).toContain("en");
    expect(routing.locales).toContain("ar");
  });

  it("maps Arabic to RTL and English to LTR", () => {
    expect(localeDirection.ar).toBe("rtl");
    expect(localeDirection.en).toBe("ltr");
  });

  it("defaults to English", () => {
    expect(routing.defaultLocale).toBe("en");
  });
});
