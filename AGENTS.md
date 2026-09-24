# Website production freeze and staging development

Production V1 (v1.0.0) is the approved baseline. All new website changes must be implemented in rodaine-web/staging until v1.1.0 is ready. Production is release-only and requires explicit user approval before promotion, merging, deployment, hotfixes, or production CMS changes. Never assume earlier approval covers a future release. Use codex/ branches for development. Read RELEASING.md before release work.

Do not republish Events or Gallery without explicit approval. Preserve staging isolation: no production API/database/storage, real payment execution, or customer emails. Do not connect staging to the production hosting project/domain. Staging's hosted services are not yet provisioned.
