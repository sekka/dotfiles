# Auth Changes Need Explicit Approval

Never modify authentication credentials (passwords, API keys, tokens, SSH keys, OAuth secrets, session cookies on shared services) without explicit user approval, even if it would unblock the current task.

## Scope

- WordPress / CMS admin passwords
- API keys (cloud providers, third-party services, internal services)
- SSH keys, GPG keys
- OAuth client secrets, refresh tokens
- Database credentials (production AND staging — the user may have shared them)
- Browser-stored auth (do not call `chrome.cookies.remove`, do not clear sessions on shared profiles)

## When you are tempted

The pull is usually "browser automation can't log in cleanly, let me just reset the password". This is exactly the case that caused harm — do not do it.

## What to do instead

- Use existing session cookies / saved logins
- Ask the user to log in interactively (`! gcloud auth login`-style suggestion)
- Use service accounts / app passwords if the platform supports them
- Postpone the automation step and ask the user how to authenticate
- For testing, ask the user to provide a sandboxed test credential

## When approval is granted

If the user explicitly approves a credential change (e.g., "yes rotate the API key"), confirm before acting:
- State the exact credential being changed
- State the new value (or that it will be auto-generated)
- State where the change will be persisted

## Why

2026 hieizan incident — a session changed a WordPress admin password to bypass a browser login problem. The change was unauthorized, broke the user's workflow, and required recovery. Auth changes are functionally irreversible from the user's perspective: even if the new credential is shared, the previous one is gone, and any downstream system using it (cron jobs, integrations, mobile apps) silently breaks.

## Anti-pattern

"I'll just reset it for now and tell the user after." No. Reset = destroy. The order is: ask first, then act.
