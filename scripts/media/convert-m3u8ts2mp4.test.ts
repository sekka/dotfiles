import { describe, expect, test } from "bun:test";
import { convertM3u8ToMp4 } from "./convert-m3u8ts2mp4";

describe("convert-m3u8ts2mp4", () => {
  describe("convertM3u8ToMp4", () => {
    test("存在しないファイルの場合はfalseを返す", async () => {
      const result = await convertM3u8ToMp4("/nonexistent/file.m3u8");
      expect(result).toBe(false);
    });
  });

  // 注意: 実際のMP4変換テストはffmpegコマンドと
  // 有効なm3u8ファイルが必要なため、ここではスキップ
});
