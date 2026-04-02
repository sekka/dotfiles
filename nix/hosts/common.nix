{ pkgs, config, ... }: {

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

  # =============================================
  # macOS defaults
  # =============================================

  system.defaults = {

    # --- NSGlobalDomain（システム全体） ---
    NSGlobalDomain = {
      AppleShowAllExtensions = true;          # 全ファイルの拡張子を表示
      KeyRepeat = 1;                          # キーリピート速度（最速）
      InitialKeyRepeat = 10;                  # キーリピート開始までの遅延（最短）
      NSAutomaticSpellingCorrectionEnabled = false;  # スペル自動修正を無効化
      NSAutomaticCapitalizationEnabled = false;      # 自動大文字化を無効化
      NSAutomaticQuoteSubstitutionEnabled = false;   # スマート引用符を無効化
      NSAutomaticDashSubstitutionEnabled = false;    # スマートダッシュを無効化
      NSNavPanelExpandedStateForSaveMode = true;     # 保存ダイアログを常に展開表示
      NSNavPanelExpandedStateForSaveMode2 = true;    # 同上（新API）
      "com.apple.mouse.tapBehavior" = 1;             # タップでクリック
      "com.apple.trackpad.scaling" = 3.0;            # トラックパッド速度（最速）
    };

    # --- Dock ---
    dock = {
      autohide = true;  # Dock を自動的に隠す
      tilesize = 20;    # アイコンサイズ（小さめ）
    };

    # --- Finder ---
    finder = {
      AppleShowAllFiles = true;              # 隠しファイルを表示
      ShowPathbar = true;                    # パスバーを表示
      ShowStatusBar = true;                  # ステータスバーを表示
      _FXShowPosixPathInTitle = true;        # タイトルバーにフルパスを表示
      FXDefaultSearchScope = "SCcf";         # 検索時にカレントフォルダをデフォルトに
      FXEnableExtensionChangeWarning = false; # 拡張子変更時の警告を無効化
      FXPreferredViewStyle = "clmv";         # カラム表示をデフォルトに
    };

    # --- スクリーンショット ---
    screencapture = {
      disable-shadow = true;  # ウィンドウキャプチャ時の影を無効化
    };

    # --- トラックパッド ---
    trackpad = {
      Clicking = true;  # タップでクリックを有効化
    };

    # --- メニューバー時計 ---
    menuExtraClock = {
      Show24Hour = true;   # 24時間表示
      ShowSeconds = true;  # 秒を表示
    };

    # --- nix-darwin ネイティブ未サポート設定 ---
    CustomUserPreferences = {
      "com.apple.finder" = {
        QLEnableTextSelection = true;   # Quick Look でテキスト選択可能に
        _FXSortFoldersFirst = false;    # フォルダを先頭にソートしない
      };
      "com.apple.desktopservices" = {
        DSDontWriteNetworkStores = true;  # ネットワークボリュームに .DS_Store を作らない
        DSDontWriteUSBStores = true;      # USB ボリュームに .DS_Store を作らない
      };
      "com.apple.frameworks.diskimages" = {
        skip-verify = false;         # ディスクイメージ検証を有効（通常）
        skip-verify-locked = false;  # 同上（ロック済みイメージ）
        skip-verify-remote = false;  # 同上（リモートイメージ）
      };
      "com.apple.CrashReporter" = {
        DialogType = "none";  # クラッシュレポートダイアログを非表示
      };
      NSGlobalDomain = {
        # nix-darwin の NSGlobalDomain モジュールに未定義のキー
        PMPrintingExpandedStateForPrint = true;   # 印刷ダイアログを常に展開表示
        PMPrintingExpandedStateForPrint2 = true;  # 同上（新API）
      };
      "com.apple.TextEdit" = {
        RichText = 0;                   # プレーンテキストモードをデフォルトに
        PlainTextEncoding = 4;          # 読み込み時 UTF-8
        PlainTextEncodingForWrite = 4;  # 書き込み時 UTF-8
      };
      "com.apple.menuextra.battery" = {
        ShowPercent = true;  # バッテリー残量をパーセント表示
      };
    };
  };

  # --- nix-darwin の defaults 機構では対応できない設定 ---
  # defaults -currentHost write が必要 / サンドボックス保護ドメイン
  system.activationScripts.postActivation.text = let
    user = config.system.primaryUser;
  in ''
    # メニューバーアイテム間隔（-currentHost が必要）
    sudo -u ${user} defaults -currentHost write -globalDomain NSStatusItemSpacing -int 8 2>/dev/null || true
    sudo -u ${user} defaults -currentHost write -globalDomain NSStatusItemSelectionPadding -int 6 2>/dev/null || true

    # Bluetooth トラックパッド tap-to-click（trackpad.Clicking とは別ドメイン）
    sudo -u ${user} defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad Clicking -bool true 2>/dev/null || true

    # メニューバー時計のカスタム日本語フォーマット（例: 4月2日(水) 12:30:00）
    sudo -u ${user} defaults write com.apple.menuextra.clock DateFormat -string 'M\u6708d\u65e5(EEE) H:mm:ss' 2>/dev/null || true

    # タイトルバーにアイコン表示（保護ドメイン）
    sudo -u ${user} defaults write com.apple.universalaccess showWindowTitlebarIcons -bool true 2>/dev/null || true

    # Safari 開発者ツール（サンドボックス保護ドメイン）
    sudo -u ${user} defaults write com.apple.Safari IncludeDevelopMenu -bool true 2>/dev/null || true
    sudo -u ${user} defaults write com.apple.Safari ShowFullURLInSmartSearchField -bool true 2>/dev/null || true
    sudo -u ${user} defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true 2>/dev/null || true
    sudo -u ${user} defaults write com.apple.Safari com.apple.Safari.ContentPageGroupIdentifier.WebKit2DeveloperExtrasEnabled -bool true 2>/dev/null || true
  '';

  # darwin-rebuild を実行するプライマリユーザー
  system.primaryUser = "kei";

  # Nix の管理は Determinate に任せる（nix-darwin と競合するため）
  nix.enable = false;

  # nixpkgs の設定
  nixpkgs.hostPlatform = "aarch64-darwin";

  # macOS のバージョン指定（nix-darwin が要求）
  system.stateVersion = 6;
}
