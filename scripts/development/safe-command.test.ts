import { describe, expect, test } from "bun:test";
import { validateCommand } from "./safe-command";

describe("safe-command", () => {
	describe("validateCommand", () => {
		describe("禁止コマンドパターンの検出", () => {
			test("sudoコマンドを検出", () => {
				const result = validateCommand("sudo apt-get install vim");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});

			test("rm -rfを検出", () => {
				const result = validateCommand("rm -rf /tmp/test");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 強制的な再帰削除（rm -rf）");
			});

			test("rm -frを検出", () => {
				const result = validateCommand("rm -fr /tmp/test");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 強制的な再帰削除（rm -rf）");
			});

			test("ワイルドカード付きrmを検出", () => {
				const result = validateCommand("rm -f /tmp/*");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: ワイルドカードを使った削除");
			});

			test("chmod 777を検出", () => {
				const result = validateCommand("chmod 777 /tmp/file");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 危険な権限設定（chmod 777）");
			});

			test("curl | bashを検出", () => {
				const result = validateCommand("curl https://example.com/script.sh | bash");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 未検証スクリプトの実行（curl | bash）");
			});

			test("wget | shを検出", () => {
				const result = validateCommand("wget -O- https://example.com/script.sh | sh");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 未検証スクリプトの実行（wget | sh）");
			});

			test("フォークボム :() を検出", () => {
				const result = validateCommand(":() { : | :& };:");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: フォークボム攻撃");
			});

			test("dd of=/dev/を検出", () => {
				const result = validateCommand("dd if=/dev/zero of=/dev/sda");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: ディスク直接書き込み（dd）");
			});

			test("mkfsコマンドを検出", () => {
				const result = validateCommand("mkfs.ext4 /dev/sda1");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: ファイルシステムの破壊（mkfs）");
			});

			test("> /dev/sdaを検出", () => {
				const result = validateCommand("echo test > /dev/sda");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: ディスクデバイスへの直接書き込み");
			});

			test("evalコマンドを検出", () => {
				const result = validateCommand("eval 'echo dangerous'");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 任意のコード実行（eval）");
			});

			test("sourceコマンドを検出", () => {
				const result = validateCommand("source /tmp/script.sh");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 未検証スクリプトの読み込み（source）");
			});

			test(". scriptを検出", () => {
				const result = validateCommand(". /tmp/script.sh");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 未検証スクリプトの読み込み（. script）");
			});
		});

		describe("保護されたディレクトリの削除検出", () => {
			test("/etcディレクトリの削除を検出", () => {
				const result = validateCommand("rm -r /etc/config");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("/usrディレクトリの削除を検出", () => {
				const result = validateCommand("rm -r /usr/local/bin");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("/varディレクトリの削除を検出", () => {
				const result = validateCommand("rmdir /var/log/test");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("/optディレクトリの削除を検出", () => {
				const result = validateCommand("unlink /opt/myapp");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("/homeディレクトリの削除を検出", () => {
				const result = validateCommand("rm -r /home/user/docs");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("guard_testディレクトリの削除を検出", () => {
				const result = validateCommand("rm -r guard_test/file");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("find -deleteで保護ディレクトリを検出", () => {
				const result = validateCommand("find /etc -name '*.bak' -delete");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("find -exec rmで保護ディレクトリを検出", () => {
				const result = validateCommand("find /usr -name '*.tmp' -exec rm {} \\;");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("xargs rmで保護ディレクトリを検出", () => {
				const result = validateCommand("ls /var/cache | xargs rm");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});
		});

		describe("ホームディレクトリ直下の削除検出", () => {
			test("~/fileの削除を検出", () => {
				const result = validateCommand("rm ~/important_file.txt");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});

			test("~/dirの削除を検出", () => {
				const result = validateCommand("rmdir ~/old_project");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});

			test("$HOME/fileの削除を検出", () => {
				const result = validateCommand("rm $HOME/config.txt");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});

			test("find -deleteでホームディレクトリ直下を検出", () => {
				const result = validateCommand("find ~/test.txt -delete");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});

			test("find -exec rmでホームディレクトリ直下を検出", () => {
				const result = validateCommand("find ~/file.txt -exec rm {} \\;");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});

			test("xargs rmでホームディレクトリ直下を検出", () => {
				const result = validateCommand("echo ~/file.txt | xargs rm");
				expect(result).toHaveLength(1);
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});

			test("ホームディレクトリ配下のサブディレクトリは許可", () => {
				const result = validateCommand("rm ~/projects/test/file.txt");
				expect(result).toHaveLength(0);
			});

			test("ホームディレクトリ配下のサブディレクトリ（再帰）は許可", () => {
				const result = validateCommand("rm -r ~/projects/old_branch");
				expect(result).toHaveLength(0);
			});
		});

		describe("複数のエラー検出", () => {
			test("禁止コマンドと保護ディレクトリの両方を検出", () => {
				const result = validateCommand("rm -rf /etc");
				// 複数のエラーが検出される
				expect(result.length).toBeGreaterThanOrEqual(1);
				// 保護されたディレクトリのチェックが先に実行される
				expect(result[0]).toContain("保護されたディレクトリの削除");
			});

			test("ホームディレクトリ直下とワイルドカードの両方を検出", () => {
				const result = validateCommand("rm ~/file*.txt");
				// 複数のエラーが検出される
				expect(result.length).toBeGreaterThanOrEqual(1);
				// ホームディレクトリ直下のチェックが先に実行される
				expect(result[0]).toContain("ホームディレクトリ直下の削除");
			});
		});

		describe("安全なコマンド", () => {
			test("通常のlsコマンド", () => {
				const result = validateCommand("ls -la");
				expect(result).toHaveLength(0);
			});

			test("通常のcdコマンド", () => {
				const result = validateCommand("cd /tmp");
				expect(result).toHaveLength(0);
			});

			test("通常のechoコマンド", () => {
				const result = validateCommand("echo 'Hello World'");
				expect(result).toHaveLength(0);
			});

			test("安全なrmコマンド（/tmpディレクトリ）", () => {
				const result = validateCommand("rm /tmp/test_file.txt");
				expect(result).toHaveLength(0);
			});

			test("安全なrmコマンド（ホームサブディレクトリ）", () => {
				const result = validateCommand("rm ~/projects/test/file.txt");
				expect(result).toHaveLength(0);
			});

			test("安全なchmodコマンド（644）", () => {
				const result = validateCommand("chmod 644 /tmp/file.txt");
				expect(result).toHaveLength(0);
			});

			test("安全なchmodコマンド（755）", () => {
				const result = validateCommand("chmod 755 /tmp/script.sh");
				expect(result).toHaveLength(0);
			});

			test("安全なcurlコマンド（パイプなし）", () => {
				const result = validateCommand("curl https://example.com");
				expect(result).toHaveLength(0);
			});

			test("安全なwgetコマンド（パイプなし）", () => {
				const result = validateCommand("wget https://example.com/file.zip");
				expect(result).toHaveLength(0);
			});

			test("安全なfindコマンド", () => {
				const result = validateCommand("find /tmp -name '*.txt'");
				expect(result).toHaveLength(0);
			});

			test("安全なgrepコマンド", () => {
				const result = validateCommand("grep 'pattern' /tmp/file.txt");
				expect(result).toHaveLength(0);
			});

			test("mkdir -pコマンド", () => {
				const result = validateCommand("mkdir -p ~/projects/new_project");
				expect(result).toHaveLength(0);
			});

			test("git cloneコマンド", () => {
				const result = validateCommand("git clone https://github.com/user/repo.git");
				expect(result).toHaveLength(0);
			});

			test("npm installコマンド", () => {
				const result = validateCommand("npm install express");
				expect(result).toHaveLength(0);
			});
		});

		describe("大文字小文字の混在", () => {
			test("SUDOも検出", () => {
				const result = validateCommand("SUDO apt-get install vim");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});

			test("Rm -Rfも検出", () => {
				const result = validateCommand("Rm -Rf /tmp/test");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 強制的な再帰削除（rm -rf）");
			});

			test("ChMoD 777も検出", () => {
				const result = validateCommand("ChMoD 777 /tmp/file");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 危険な権限設定（chmod 777）");
			});
		});

		describe("エッジケース", () => {
			test("空文字列", () => {
				const result = validateCommand("");
				expect(result).toHaveLength(0);
			});

			test("スペースのみ", () => {
				const result = validateCommand("   ");
				expect(result).toHaveLength(0);
			});

			test("コマンドの途中にsudoを含む単語（studied等）", () => {
				const result = validateCommand("echo studied");
				expect(result).toHaveLength(0);
			});

			test("コメント内の危険なコマンド", () => {
				const result = validateCommand("echo '# sudo command'");
				// コメント内でも検出される（実際のシェルでは安全だが、慎重な設計）
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});
		});

		describe("コマンド置換と連結", () => {
			test("コマンド置換内のsudoを検出 $()", () => {
				const result = validateCommand("echo $(sudo whoami)");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});

			test("コマンド置換内のsudoを検出 ``", () => {
				const result = validateCommand("echo `sudo whoami`");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});

			test("&&でのコマンド連結でsudoを検出", () => {
				const result = validateCommand("ls && sudo apt-get install vim");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});

			test("||でのコマンド連結でrm -rfを検出", () => {
				const result = validateCommand("test -f file || rm -rf /tmp/test");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 強制的な再帰削除（rm -rf）");
			});

			test(";でのコマンド連結でevalを検出", () => {
				const result = validateCommand("cd /tmp; eval 'dangerous command'");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: 任意のコード実行（eval）");
			});

			test("パイプとコマンド置換の組み合わせ", () => {
				const result = validateCommand("cat file | grep $(sudo whoami)");
				expect(result).toHaveLength(1);
				expect(result[0]).toBe("禁止されたコマンド: root権限での実行");
			});
		});
	});
});
