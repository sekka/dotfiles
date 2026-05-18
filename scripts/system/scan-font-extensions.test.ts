import { describe, expect, it } from "bun:test";
import {
  classifyExtension,
  detectMagic,
  FONT_EXTS,
  RESOURCE_FORK_EXTS,
} from "./scan-font-extensions.ts";

// ---------------------------------------------------------------------------
// detectMagic
// ---------------------------------------------------------------------------

function makeBuf(bytes: number[]): Buffer {
  const b = Buffer.alloc(12, 0);
  for (let i = 0; i < bytes.length && i < 12; i++) {
    b[i] = bytes[i] ?? 0;
  }
  return b;
}

describe("detectMagic", () => {
  it("OTTO magic → otf", () => {
    const buf = makeBuf([0x4f, 0x54, 0x54, 0x4f]);
    expect(detectMagic(buf)).toBe("otf");
  });

  it("0x00010000 magic → ttf", () => {
    const buf = makeBuf([0x00, 0x01, 0x00, 0x00]);
    expect(detectMagic(buf)).toBe("ttf");
  });

  it("'true' magic → ttf", () => {
    const buf = makeBuf([0x74, 0x72, 0x75, 0x65]);
    expect(detectMagic(buf)).toBe("ttf");
  });

  it("'typ1' magic → ttf", () => {
    const buf = makeBuf([0x74, 0x79, 0x70, 0x31]);
    expect(detectMagic(buf)).toBe("ttf");
  });

  it("'ttcf' magic → ttc", () => {
    const buf = makeBuf([0x74, 0x74, 0x63, 0x66]);
    expect(detectMagic(buf)).toBe("ttc");
  });

  it("'wOFF' magic → woff", () => {
    const buf = makeBuf([0x77, 0x4f, 0x46, 0x46]);
    expect(detectMagic(buf)).toBe("woff");
  });

  it("'wOF2' magic → woff2", () => {
    const buf = makeBuf([0x77, 0x4f, 0x46, 0x32]);
    expect(detectMagic(buf)).toBe("woff2");
  });

  it("random bytes → unknown", () => {
    const buf = makeBuf([0xde, 0xad, 0xbe, 0xef]);
    expect(detectMagic(buf)).toBe("unknown");
  });

  it("buffer shorter than 4 bytes → unknown", () => {
    const buf = Buffer.alloc(2);
    expect(detectMagic(buf)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// classifyExtension
// ---------------------------------------------------------------------------

describe("classifyExtension", () => {
  it("correct .otf extension → OK", () => {
    const r = classifyExtension(".otf", "otf");
    expect(r.status).toBe("OK");
    expect(r.expectedExt).toBe(".otf");
  });

  it("correct .ttf extension → OK", () => {
    const r = classifyExtension(".ttf", "ttf");
    expect(r.status).toBe("OK");
  });

  it("correct .ttc extension → OK", () => {
    const r = classifyExtension(".ttc", "ttc");
    expect(r.status).toBe("OK");
  });

  it(".otc extension with ttc magic → OK_OTC", () => {
    const r = classifyExtension(".otc", "ttc");
    expect(r.status).toBe("OK_OTC");
    expect(r.expectedExt).toBe(".ttc");
  });

  it("no extension with font magic → MISSING_EXT", () => {
    const r = classifyExtension("", "otf");
    expect(r.status).toBe("MISSING_EXT");
    expect(r.expectedExt).toBe(".otf");
  });

  it(".ttf extension but OTTO magic → WRONG_FONT_EXT", () => {
    const r = classifyExtension(".ttf", "otf");
    expect(r.status).toBe("WRONG_FONT_EXT");
    expect(r.expectedExt).toBe(".otf");
  });

  it(".otf extension but ttc magic → WRONG_FONT_EXT", () => {
    const r = classifyExtension(".otf", "ttc");
    expect(r.status).toBe("WRONG_FONT_EXT");
    expect(r.expectedExt).toBe(".ttc");
  });

  it(".bin extension with font magic → WRONG_NON_FONT_EXT", () => {
    const r = classifyExtension(".bin", "otf");
    expect(r.status).toBe("WRONG_NON_FONT_EXT");
    expect(r.expectedExt).toBe(".otf");
  });

  it(".dat extension with woff2 magic → WRONG_NON_FONT_EXT", () => {
    const r = classifyExtension(".dat", "woff2");
    expect(r.status).toBe("WRONG_NON_FONT_EXT");
    expect(r.expectedExt).toBe(".woff2");
  });

  it(".ttf extension with unknown magic → NOT_FONT_BUT_FONT_EXT", () => {
    const r = classifyExtension(".ttf", "unknown");
    expect(r.status).toBe("NOT_FONT_BUT_FONT_EXT");
    expect(r.expectedExt).toBe("");
  });

  it(".otf extension with unknown magic → NOT_FONT_BUT_FONT_EXT", () => {
    const r = classifyExtension(".otf", "unknown");
    expect(r.status).toBe("NOT_FONT_BUT_FONT_EXT");
    expect(r.expectedExt).toBe("");
  });

  it(".jpg extension with unknown magic → OK (non-font, skip)", () => {
    const r = classifyExtension(".jpg", "unknown");
    expect(r.status).toBe("OK");
  });

  it("FONT_EXTS contains expected set", () => {
    expect(FONT_EXTS.has(".otf")).toBe(true);
    expect(FONT_EXTS.has(".ttf")).toBe(true);
    expect(FONT_EXTS.has(".ttc")).toBe(true);
    expect(FONT_EXTS.has(".otc")).toBe(true);
    expect(FONT_EXTS.has(".woff")).toBe(true);
    expect(FONT_EXTS.has(".woff2")).toBe(true);
  });

  // Resource-fork exemptions
  it(".dfont + unknown magic → OK_RESOURCE_FORK (not anomaly)", () => {
    const r = classifyExtension(".dfont", "unknown");
    expect(r.status).toBe("OK_RESOURCE_FORK");
    expect(r.expectedExt).toBe("");
  });

  it(".suit + unknown magic → OK_RESOURCE_FORK", () => {
    const r = classifyExtension(".suit", "unknown");
    expect(r.status).toBe("OK_RESOURCE_FORK");
  });

  it(".pfb + unknown magic → OK_RESOURCE_FORK", () => {
    const r = classifyExtension(".pfb", "unknown");
    expect(r.status).toBe("OK_RESOURCE_FORK");
  });

  it(".pfm + unknown magic → OK_RESOURCE_FORK", () => {
    const r = classifyExtension(".pfm", "unknown");
    expect(r.status).toBe("OK_RESOURCE_FORK");
  });

  it(".bin + unknown magic → OK (non-font, skip)", () => {
    const r = classifyExtension(".bin", "unknown");
    expect(r.status).toBe("OK");
  });

  it("RESOURCE_FORK_EXTS contains expected members", () => {
    expect(RESOURCE_FORK_EXTS.has(".dfont")).toBe(true);
    expect(RESOURCE_FORK_EXTS.has(".suit")).toBe(true);
    expect(RESOURCE_FORK_EXTS.has(".pfb")).toBe(true);
    expect(RESOURCE_FORK_EXTS.has(".pfm")).toBe(true);
  });
});
