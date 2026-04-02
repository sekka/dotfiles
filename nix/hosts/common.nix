{ pkgs, ... }: {

  # --- Nix で管理する CLI ツール ---
  # Brewfile から移行した Rust/Go 製ツール
  environment.systemPackages = with pkgs; [
    bat             # すごいcat
    eza             # すごいls
    fd              # すごいfind
    hexyl           # すごいod
    procs           # すごいps
    ripgrep         # すごいgrep
    starship        # プロンプト
    zoxide          # すごいcd
  ];

  # Nix の管理は Determinate に任せる（nix-darwin と競合するため）
  nix.enable = false;

  # nixpkgs の設定
  nixpkgs.hostPlatform = "aarch64-darwin";

  # macOS のバージョン指定（nix-darwin が要求）
  system.stateVersion = 6;
}
