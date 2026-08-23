# Atlas Apply Parity Checklist

This checklist tracks rebuild parity from legacy Atlas Apply into the new C# implementation.

## Source Baseline

- Legacy frontend: `D:/www/legacy/atlasuniversalis-legacy-20260307-080256/frontend`
- Legacy backend: `D:/www/legacy/atlasuniversalis-legacy-20260307-080256/atlasops`
- Legacy extension: `D:/www/legacy/atlasuniversalis-legacy-20260307-080256/extension`

## Must-Have for Relaunch

### Platform Foundation

- [ ] New `src/Atlas.Apply` project exists and runs on `127.0.0.1:5010`
- [ ] `/healthz` responds healthy in production deployment
- [ ] Nginx apply vhost routes `/`, `/_blazor`, `/api/`, `/uploads/` as expected
- [ ] App-level configuration and secrets template added for Apply

### Auth and Access

- [ ] Register/login/logout implemented
- [ ] Session validation endpoint implemented
- [ ] Password reset flow (request + complete) implemented
- [ ] OAuth callback compatibility validated for configured providers

### Core Job/Application Workflows

- [ ] Opportunity ingestion from manual input works
- [ ] Extension ingestion endpoint accepts and stores payload
- [ ] Opportunity normalization pipeline stores parse result
- [ ] Application CRUD works
- [ ] Status pipeline transitions work (`Saved` -> `Applied` -> `Interview` -> `Offer`/`Closed`)
- [ ] Workflow timeline/events recorded and displayed

### Profile and Resume

- [ ] Profile CRUD implemented
- [ ] Resume upload persists metadata
- [ ] Resume parse pipeline writes parsed artifacts

### Extension Reconnect

- [ ] Extension source reconciled (single canonical folder)
- [ ] Extension API base URL updated for C# backend
- [ ] Auth/session strategy for extension finalized
- [ ] Extension package generated and served at download endpoint

### Billing (Initial)

- [ ] Entitlement check middleware/service exists
- [ ] Billing webhook endpoint validates and persists events

### Quality Gates

- [ ] Smoke test: login -> ingest -> create application -> status update
- [ ] Smoke test: extension payload -> opportunity record created
- [ ] Smoke test: resume upload -> profile update visible
- [ ] Logs include correlation IDs for ingestion and workflow operations

## Phase-2 Enhancements

- [ ] Advanced generation flows (cover letter variants, deep-dive assistance)
- [ ] Admin analytics dashboards
- [ ] Additional automations and batch processing optimization
- [ ] Reporting/export UX improvements

## Cutover Criteria

All items below must be true before setting `apply_api_backend` to `atlas_dotnet_apply`:

- [ ] Auth and ingestion endpoints stable in production
- [ ] Error rate and response latency within acceptable thresholds
- [ ] Rollback instructions validated in deploy docs
- [ ] Manual acceptance walkthrough completed
