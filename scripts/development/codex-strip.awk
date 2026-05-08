# Git clean filter for home/codex/config.toml.
# Strips [projects.*], [marketplaces.*], and [apps.connector_*] sections so
# per-machine state (absolute paths to home directory, marketplace timestamps,
# OAuth connector instance IDs, etc.) does not enter the public dotfiles
# repository. codex re-creates these blocks locally as needed; the clean
# filter strips them again on the next stage.

BEGIN { skip = 0 }

/^\[/ {
  if ($0 ~ /^\[projects\./ || $0 ~ /^\[marketplaces\./ || $0 ~ /^\[apps\.connector_[[:xdigit:]]{32}[].]/) {
    skip = 1
    next
  }
  skip = 0
}

skip { next }

{ print }
