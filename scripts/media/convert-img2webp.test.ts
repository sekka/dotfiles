import { describe, expect, test } from "bun:test";
import { getImageExtension, getCwebpOptions } from "./convert-img2webp";

describe("convert-img2webp", () => {
  describe("getImageExtension", () => {
    test("PNGファイルの場合は.pngを返す", () => {
      expect(getImageExtension("image.png")).toBe(".png");
      expect(getImageExtension("IMAGE.PNG")).toBe(".png");
      expect(getImageExtension("path/to/image.png")).toBe(".png");
    });

    test("JPGファイルの場合は.jpgを返す", () => {
      expect(getImageExtension("image.jpg")).toBe(".jpg");
      expect(getImageExtension("IMAGE.JPG")).toBe(".jpg");
      expect(getImageExtension("path/to/image.jpg")).toBe(".jpg");
    });

    test("JPEGファイルの場合は.jpgを返す", () => {
      expect(getImageExtension("image.jpeg")).toBe(".jpg");
      expect(getImageExtension("IMAGE.JPEG")).toBe(".jpg");
    });

    test("サポートされていない形式の場合はnullを返す", () => {
      expect(getImageExtension("image.gif")).toBeNull();
      expect(getImageExtension("image.webp")).toBeNull();
      expect(getImageExtension("image.bmp")).toBeNull();
      expect(getImageExtension("document.pdf")).toBeNull();
    });
  });

  describe("getCwebpOptions", () => {
    test("PNGの場合はロスレス圧縮オプションを返す", () => {
      const options = getCwebpOptions(".png");
      expect(options).toContain("-lossless");
      expect(options).toContain("-metadata");
      expect(options).toContain("icc");
    });

    test("JPGの場合は品質90のオプションを返す", () => {
      const options = getCwebpOptions(".jpg");
      expect(options).toContain("-q");
      expect(options).toContain("90");
      expect(options).toContain("-metadata");
      expect(options).toContain("icc");
      expect(options).toContain("-sharp_yuv");
    });
  });

  // 注意: 実際のWebP変換テストはcwebpコマンドが必要なため、
  // ここではユーティリティ関数のテストのみ実施
});
