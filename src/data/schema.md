# Dummy data shapes

All files live in `src/data/`. Each shape matches `src/shared/api/types.ts`.
None contain `content` / `messages` / `transcripts` / `body` / `text` fields - enforced by `tests/privacy.test.ts`.

## Files

- `users.json` — array of `UserSummary`. Pro/business users have `paymentHistory[]` and `renewals[]`. Free users have empty arrays.
- `user-detail.json` — single `UserDetail`. Falls back to `users.json` entries.
- `admin-account.json` — single `AdminAccount` with `avatarUrl` and `lastSignInAt`.
- `audit.json` — array of `AuditEntry`. New events: `tier.update`, `model.toggle`, `usage.toggle`, `legal.publish`, `legal.restore`, `legal.delete`, `support.reply`, `support.close` (all carry `meta`).
- `config-tiers.json` — array of `TierConfig` with `requestsLimit` (use `-1` for unlimited), `tokensLimit`, `models: ModelId[]`, `features: { fileUpload, voice, priority }`.
- `config-models.json` — array of `ModelConfig` with `includedInTiers: Tier[]`.
- `plan-defaults.json` — pristine defaults used by the TierEditor Reset button. Mirrors `backend/src/ai/plans.ts`.
- `usage-visibility.json` — `{ enabled, updatedAt, updatedBy }`. Toggled from `/admin/config/usage`.
- `legal-terms.json` / `legal-privacy.json` — `{ currentVersionId, versions: [{ id, body, createdAt, createdBy, summary }] }`.
- `support-tickets.json` — array of `Ticket`. Each ticket has `replies: SupportReply[]`.
- `overview.json`, `revenue.json`, `usage.json`, `providers-health.json`, `ticket-detail.json` — unchanged.
