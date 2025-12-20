import { describe, expect, test } from "bun:test";
import { extractGpx } from "./ext-gpx";

describe("ext-gpx", () => {
	describe("extractGpx", () => {
		test("存在しないファイルの場合はfalseを返す", async () => {
			// gopro2gpxコマンドがインストールされていない場合でも失敗する
			const result = await extractGpx("/nonexistent/file.mp4");
			expect(result).toBe(false);
		});
	});

	// 注意: 実際のGPX抽出テストはgopro2gpxコマンドと
	// GoProのMP4ファイルが必要なため、ここではスキップ
});
