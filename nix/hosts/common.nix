{ pkgs, config, ... }: {

  # --- Nix で管理する CLI ツール ---
  # Homebrew から移行。OS深部に関わらない純粋な CLI のみ対象
  environment.systemPackages = with pkgs; [
    # コマンド代替（モダン版 coreutils）
    bat             # https://github.com/sharkdp/bat              # cat + シンタックスハイライト
    eza             # https://github.com/eza-community/eza        # ls + Git/アイコン対応
    fd              # https://github.com/sharkdp/fd               # find + 高速・直感的
    hexyl           # https://github.com/sharkdp/hexyl            # hexdump + カラー表示
    procs           # https://github.com/dalance/procs            # ps + カラー・ツリー表示
    ripgrep         # https://github.com/BurntSushi/ripgrep       # grep + 高速・.gitignore対応
    zoxide          # https://github.com/ajeetdsouza/zoxide       # cd + 学習型ジャンプ
    # シェル・プロンプト
    sheldon         # https://github.com/rossmacarthur/sheldon    # Zshプラグインマネージャ
    starship        # https://github.com/starship/starship        # クロスシェルプロンプト
    # ターミナル強化
    fzf             # https://github.com/junegunn/fzf             # 汎用ファジーファインダー
    fpp             # https://github.com/facebook/PathPicker      # パスピッカー
    navi            # https://github.com/denisidoro/navi          # インタラクティブチートシート
    tailspin        # https://github.com/bensadeh/tailspin        # ログハイライト付きtail
    terminal-notifier # https://github.com/julienXX/terminal-notifier # macOS通知ツール
    tree            # https://github.com/Old-Man-Programmer/tree  # ディレクトリツリー表示
    # ターミナル（テキスト処理）
    coreutils       # https://www.gnu.org/software/coreutils      # GNU基本ツール（gtimeout等）
    gawk            # https://www.gnu.org/software/gawk           # GNU Awk（macOS互換性）
    nkf             # https://osdn.net/projects/nkf               # 文字コード変換ツール
    pstree          # https://github.com/FredHucht/pstree         # psをツリーで表示
    silver-searcher # https://github.com/ggreer/the_silver_searcher # 高速コード検索（ag）
    # ファイルマネージャ
    superfile       # https://github.com/yorukot/superfile        # TUIファイルマネージャ
    walk            # https://github.com/antonmedv/walk           # TUIファイルナビゲータ
    yazi            # https://github.com/sxyazi/yazi              # 非同期TUIファイルマネージャ
    glow            # https://github.com/charmbracelet/glow       # ターミナルMarkdownビューワ
    # git
    git             # https://git-scm.com                         # バージョン管理システム
    github-cli      # https://github.com/cli/cli                  # GitHub CLI（gh）
    ghq             # https://github.com/x-motemen/ghq            # git clone管理
    # git TUI・ビューア
    delta           # https://github.com/dandavison/delta         # git diff + シンタックスハイライト
    diff-so-fancy   # https://github.com/so-fancy/diff-so-fancy   # git diff 整形
    diffnav         # https://github.com/dlvhdr/diffnav           # delta連携diff ナビゲータ
    gitui           # https://github.com/extrawurst/gitui         # 高速git TUI（Rust製）
    lazygit         # https://github.com/jesseduffield/lazygit    # git TUI（Go製）
    tig             # https://github.com/jonas/tig                # git テキストUI
    # システムモニタ
    btop            # https://github.com/aristocratos/btop        # リソースモニタ（C++製）
    htop            # https://github.com/htop-dev/htop            # プロセスビューワ
    (mactop.overrideAttrs (old: { doCheck = false; }))  # https://github.com/context-labs/mactop  # macOS専用プロセスビューワ（テストがNixサンドボックスで失敗するため無効化）
    zenith          # https://github.com/bvaisvil/zenith          # ターミナルシステムモニタ
    # 開発ツール
    direnv          # https://github.com/direnv/direnv            # ディレクトリ別環境変数
    dprint          # https://github.com/dprint/dprint            # 高速コードフォーマッタ
    hgrep           # https://github.com/rhysd/hgrep              # grep + シンタックスハイライト
    jq              # https://github.com/jqlang/jq                # JSONプロセッサ
    mise            # https://github.com/jdx/mise                 # タスクランナー・バージョン管理
    neovim          # https://github.com/neovim/neovim            # モダンVim
    pre-commit      # https://pre-commit.com                      # Gitフック管理ツール
    shellcheck      # https://github.com/koalaman/shellcheck      # シェルスクリプトリンター
    shfmt           # https://github.com/mvdan/sh                 # シェルスクリプトフォーマッタ
    vim             # https://github.com/vim/vim                  # テキストエディタ
    xh              # https://github.com/ducaale/xh               # HTTPクライアント（Rust製）
    yamllint        # https://github.com/adrienverge/yamllint     # YAMLリンター
    pnpm            # https://github.com/pnpm/pnpm                # 高速パッケージマネージャ
    yarn            # https://github.com/yarnpkg/yarn             # パッケージマネージャ（Classic）
    # Python
    uv              # https://github.com/astral-sh/uv             # Python環境管理ツール（高速）
    # ファイル・メディア処理
    exiftool        # https://github.com/exiftool/exiftool        # 画像・音声メタデータ取得
    ffmpeg          # https://github.com/FFmpeg/FFmpeg             # 動画・音声変換
    imagemagick     # https://github.com/ImageMagick/ImageMagick  # 画像処理ツール
    libavif         # https://github.com/AOMediaCodec/libavif     # AVIF画像処理
    libwebp         # https://github.com/webmproject/libwebp      # WebP画像処理
    mediainfo       # https://mediaarea.net/en/MediaInfo          # メディアファイル情報取得（yazi用）
    ouch            # https://github.com/ouch-org/ouch            # 圧縮・展開（自動形式判別）
    poppler-utils   # https://gitlab.freedesktop.org/poppler      # PDF処理CLIツール（pdftotext等）
    silicon         # https://github.com/Aloxaf/silicon           # コード画像生成
    # アーカイブ
    _7zz            # https://7-zip.org                           # 7zアーカイブ（yazi用）
    cabextract      # https://www.cabextract.org.uk               # CABアーカイブ展開ツール
    cdrtools        # https://cdrtools.sourceforge.net            # ISO作成ツール（mkisofs等）
    gnupg           # https://gnupg.org                          # 署名ツール
    wimlib          # https://wimlib.net                          # WIMアーカイブ展開ツール
    # ネットワーク
    aria2           # https://aria2.github.io                     # 分割ダウンロードツール
    bandwhich       # https://github.com/imsnif/bandwhich         # ネットワークトラフィック監視
    dstp            # https://github.com/ycd/dstp                 # ネットワーク調査ツール
    httpstat        # https://github.com/reorx/httpstat           # cURLの統計情報表示
    snitch          # https://github.com/nicholasgasior/snitch    # ネットワーク監視ツール
    wget            # https://www.gnu.org/software/wget           # HTTP/FTPダウンローダ
    # クラウド・デプロイ
    awscli2         # https://github.com/aws/aws-cli              # AWS CLI v2
    firebase-tools  # https://github.com/firebase/firebase-tools  # Firebase CLI
    heroku          # https://github.com/heroku/cli               # Heroku CLI
    netlify-cli     # https://github.com/netlify/cli              # Netlify CLI
    # ウェブ開発
    http-server     # https://github.com/http-party/http-server   # ローカルHTTPサーバー
    mycli           # https://mycli.net                           # MySQL便利ツール（オートコンプリート）
    svgo            # https://github.com/svg/svgo                 # SVG最適化ツール
    # Docker
    colima          # https://github.com/abiosoft/colima           # macOS用コンテナランタイム（Lima backend）
    docker-client   # https://github.com/moby/moby                # Docker CLI（compose v2 + buildx 同梱）
    lazydocker      # https://github.com/jesseduffield/lazydocker # Docker管理TUI（Go製）
    # AI
    ollama          # https://github.com/ollama/ollama            # ローカルLLM実行環境
    # 検索
    platinum-searcher # https://github.com/monochromegane/the_platinum_searcher # 高速コード検索（pt）
    # OS
    m-cli           # https://github.com/rgcr/m-cli               # macOS設定CLI（Swiss Army Knife）
    mas             # https://github.com/mas-cli/mas              # Mac App Store CLIツール
    # その他
    emojify         # https://github.com/mrowa44/emojify          # テキスト→絵文字変換
    lnav            # https://github.com/tstack/lnav              # ログファイルビューア
    tmux            # https://github.com/tmux/tmux                # ターミナルマルチプレクサ
    tmuxPlugins.tmux-sessionx  # https://github.com/omerxx/tmux-sessionx  # セッション選択・作成TUI
    tmuxPlugins.tmux-fzf       # https://github.com/sainnhe/tmux-fzf     # fzfでtmux操作
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

  # --- Yazi プラグイン ---

  system.activationScripts.yaziPlugins.text = let
    user = config.system.primaryUser;
    ya = "${pkgs.yazi}/bin/ya";
    plugins = [
      # Tier 1: 必須
      "yazi-rs/plugins:git"
      "yazi-rs/plugins:full-border"
      "yazi-rs/plugins:smart-enter"
      "dedukun/bookmarks"
      # Tier 2: 開発者向け
      "Reledia/glow"
      "boydaihungst/mediainfo.yazi:mediainfo"
      "yazi-rs/plugins:chmod"
      "yazi-rs/plugins:jump-to-char"
      # Tier 3: 特定用途
      "ndtoan96/ouch"
      "KKV9/compress"
      "Sonico98/exifaudio.yazi:exifaudio"
    ];
    installCmd = builtins.concatStringsSep "\n" (map (p:
      ''sudo -u ${user} ${ya} pkg add "${p}" || true''
    ) plugins);
  in installCmd;

  # --- GitHub CLI 拡張機能 ---

  system.activationScripts.ghExtensions.text = let
    user = config.system.primaryUser;
    gh = "${pkgs.github-cli}/bin/gh";
    extensions = [
      "him0/gh-sync"
      "dlvhdr/gh-dash"
      "mislav/gh-branch"
    ];
    installCmd = builtins.concatStringsSep "\n" (map (ext:
      ''sudo -u ${user} ${gh} extension install "${ext}" || true''
    ) extensions);
  in installCmd;

  # --- LaunchAgents ---

  launchd.user.agents.ollama = {
    command = "${pkgs.ollama}/bin/ollama serve";
    serviceConfig = {
      KeepAlive = true;
      RunAtLoad = true;
      StandardOutPath = "/tmp/ollama.stdout.log";
      StandardErrorPath = "/tmp/ollama.stderr.log";
    };
  };

  # darwin-rebuild を実行するプライマリユーザー
  system.primaryUser = "kei";

  # Nix の管理は Determinate に任せる（nix-darwin と競合するため）
  nix.enable = false;

  # nixpkgs の設定
  nixpkgs.hostPlatform = "aarch64-darwin";

  # macOS のバージョン指定（nix-darwin が要求）
  system.stateVersion = 6;
}
