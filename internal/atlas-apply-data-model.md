# Atlas Apply Data Model (C# Rebuild Baseline)

This document defines the initial relational model for rebuilding Atlas Apply in C# with PostgreSQL.

## Source Inputs

- Legacy Python ORM models: `D:/www/legacy/atlasuniversalis-legacy-20260307-080256/atlasops/models/`
- Legacy C# entities (archive): `D:/www/legacy/atlasuniversalis-legacy-20260307-080256/src/Atlas.Core/Entities/`
- Current deployment assumptions: PostgreSQL available on production host (`atlas-apply.service` starts after `postgresql.service`)

## Core Entities (Phase 1)

### User

Purpose:
- Account identity and ownership root.

Key fields:
- `Id` (guid)
- `Email` (unique)
- `PasswordHash`
- `DisplayName`
- `CreatedUtc`
- `UpdatedUtc`
- `LastLoginUtc`
- `IsActive`

Relations:
- 1-to-many with `Profile`
- 1-to-many with `Opportunity`
- 1-to-many with `Application`
- 1-to-many with `WorkflowEvent`
- 1-to-many with `ExtensionIngestion`

### Profile

Purpose:
- Candidate profile and preferences used by automation/generation.

Key fields:
- `Id` (guid)
- `UserId`
- `Headline`
- `Summary`
- `Location`
- `LinkedInUrl`
- `GithubUrl`
- `SkillsJson` (jsonb)
- `PreferencesJson` (jsonb)
- `CreatedUtc`
- `UpdatedUtc`

### ResumeAsset

Purpose:
- Uploaded/parsing-ready resume files and extracted metadata.

Key fields:
- `Id` (guid)
- `UserId`
- `ProfileId` (nullable)
- `FileName`
- `StoragePath`
- `MimeType`
- `SizeBytes`
- `ParsedText` (nullable)
- `ParsedJson` (jsonb, nullable)
- `CreatedUtc`

### Opportunity

Purpose:
- Normalized job/opportunity records from manual entry or extension ingest.

Key fields:
- `Id` (guid)
- `UserId`
- `SourceType` (`Manual`, `Extension`, `Import`)
- `ExternalId` (nullable)
- `Company`
- `RoleTitle`
- `Location`
- `CompensationText` (nullable)
- `PostingUrl` (nullable)
- `DescriptionRaw` (nullable)
- `DescriptionNormalized` (nullable)
- `MetadataJson` (jsonb, nullable)
- `CreatedUtc`
- `UpdatedUtc`

### Application

Purpose:
- Tracks applied workflows and status progression.

Key fields:
- `Id` (guid)
- `UserId`
- `OpportunityId`
- `Status` (`Saved`, `Applied`, `Interview`, `Offer`, `Closed`)
- `Priority` (`Low`, `Normal`, `High`)
- `AppliedUtc` (nullable)
- `Notes` (nullable)
- `CreatedUtc`
- `UpdatedUtc`

### WorkflowEvent

Purpose:
- Immutable event stream for user-visible timeline and auditing.

Key fields:
- `Id` (guid)
- `UserId`
- `ApplicationId` (nullable)
- `OpportunityId` (nullable)
- `EventType`
- `PayloadJson` (jsonb)
- `CreatedUtc`

### ExtensionIngestion

Purpose:
- Stores browser extension payloads and processing status.

Key fields:
- `Id` (guid)
- `UserId` (nullable while unauthenticated flows are disabled)
- `SourceDomain`
- `PageUrl`
- `PayloadJson` (jsonb)
- `ProcessingStatus` (`Pending`, `Processed`, `Rejected`, `Failed`)
- `ErrorMessage` (nullable)
- `CreatedUtc`
- `ProcessedUtc` (nullable)

## Supporting Entities (Phase 2)

- `BillingCustomer`
- `Subscription`
- `WebhookEvent`
- `ApiClientToken` (if extension adopts token auth)
- `FeatureFlag`

## Index and Constraint Baseline

- Unique: `Users.Email`
- Index: `Opportunities.UserId`, `Opportunities.CreatedUtc`
- Index: `Applications.UserId`, `Applications.Status`, `Applications.UpdatedUtc`
- Index: `WorkflowEvents.UserId`, `WorkflowEvents.CreatedUtc`
- Index: `ExtensionIngestions.ProcessingStatus`, `ExtensionIngestions.CreatedUtc`

## Migration Sequence

1. Users + Profiles + ResumeAssets
2. Opportunities + Applications + WorkflowEvents
3. ExtensionIngestions
4. Billing/entitlement tables

## Notes

- Use UTC for all timestamps.
- Prefer explicit enums in C# with string conversion in APIs.
- Keep jsonb columns for flexible ingestion metadata while core fields stay relational.
