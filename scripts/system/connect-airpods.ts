#!/usr/bin/env bun
/**
 * AirPodsに接続する
 *
 * Bluetooth経由でAirPodsに接続し、オーディオ出力を切り替える。
 * 接続成功時に音声でお知らせする。
 *
 * 使用方法:
 *   connect-airpods
 *
 * 設定:
 *   スクリプト内のAIR_PODS_ADDRESSとAIR_PODS_NAMEを
 *   自分のAirPodsの情報に変更してください。
 *
 * 依存関係:
 *   - bluetoothconnector（brew install bluetoothconnector）
 *   - switchaudio-osx（brew install switchaudio-osx）
 */

import { $ } from "bun";

// AirPodsの設定（自分のデバイス情報に変更してください）
const AIR_PODS_ADDRESS = "fc-1d-43-ca-54-cf";
const AIR_PODS_NAME = "AirPods Pro";

// リトライ設定
const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 1000;

/**
 * 指定ミリ秒待機する
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * AirPodsに接続する
 */
export async function connectToAirpods(): Promise<boolean> {
  // 接続を開始
  // 注意: bluetoothconnectorはPATHに存在する必要があります
  await $`bluetoothconnector -c ${AIR_PODS_ADDRESS}`.quiet().nothrow();

  // 接続状態を確認
  for (let i = 0; i < MAX_RETRIES; i++) {
    const result = await $`bluetoothconnector -s ${AIR_PODS_ADDRESS}`
      .quiet()
      .nothrow();

    const status = result.text().trim();

    if (status === "Connected") {
      await sleep(1000);

      // オーディオ出力を切り替え
      // 注意: SwitchAudioSourceのパスは環境により異なる場合があります
      await $`SwitchAudioSource -s ${AIR_PODS_NAME}`.quiet().nothrow();

      await sleep(1000);

      // 接続成功を音声でお知らせ
      await $`say -v samantha Connected`.quiet().nothrow();

      return true;
    }

    await sleep(RETRY_INTERVAL_MS);
  }

  return false;
}

/**
 * メイン関数
 */
export async function main(): Promise<number> {
  console.log(`AirPods (${AIR_PODS_NAME}) に接続中...`);

  const success = await connectToAirpods();

  if (success) {
    console.log("接続成功！");
    return 0;
  } else {
    console.error("接続に失敗しました。AirPodsがペアリングモードか確認してください。");
    return 1;
  }
}

// スクリプトとして直接実行された場合
if (import.meta.main) {
  const exitCode = await main();
  process.exit(exitCode);
}
