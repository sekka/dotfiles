#!/bin/bash
# Rust and cargo utilities setup script

rustup --version
rustup check
rustup update stable

# cargo install zellij       # https://crates.io/crates/zellij すごいtmux
# cargo install starship     # https://crates.io/crates/starship すごいプロンプト
# cargo install eza          # https://crates.io/crates/eza すごいls
# cargo install bat          # https://crates.io/crates/bat すごいcat
# cargo install hexyl        # https://crates.io/crates/hexyl すごいod
# cargo install ruget        # https://crates.io/crates/ruget すごいwget
# cargo install procs        # https://crates.io/crates/procs すごいps
# cargo install hgrep        # https://crates.io/crates/hgrep すごいgrep
# cargo install ripgrep      # https://crates.io/crates/ripgrep すごいgrep
# cargo install fd-find      # https://crates.io/crates/fd-find すごいfind
# cargo install hx           # https://crates.io/crates/hx HTTPie / 高機能cURL
# cargo install cargo-update # https://crates.io/crates/cargo-update
# cargo install rtop         # https://crates.io/crates/rtop システムモニタリング
cargo install mise         # https://crates.io/crates/mise タスクランナー
cargo install --locked --git 'https://github.com/anatawa12/git-vrc.git'

cargo install-update -a # 全てのクレートを最新に (cargo-update)
