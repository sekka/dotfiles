# Git clean filter for home/codex/config.toml.
# Strips [projects.*] and [marketplaces.*] sections so per-machine state
# (absolute paths to home directory, marketplace timestamps, etc.) does not
# enter the public dotfiles repository. codex re-creates these blocks
# locally as needed; the clean filter strips them again on the next stage.

BEGIN { skip = 0; last_blank = 1 }

/^\[/ {
  if ($0 ~ /^\[projects\./ || $0 ~ /^\[marketplaces\./) {
    skip = 1
    next
  }
  skip = 0
}

skip { next }

/^[[:space:]]*$/ {
  if (last_blank) next
  last_blank = 1
  print
  next
}

{ last_blank = 0; print }
