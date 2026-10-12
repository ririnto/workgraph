# Security Policy

## Report A Vulnerability

Use [GitHub's private reporting form](https://github.com/ririnto/workgraph/security/advisories/new) to report suspected vulnerabilities confidentially.
Avoid public issues for undisclosed vulnerabilities.
Include the affected release, host, reproduction steps, expected behavior, and potential impact.
Remove credentials, personal paths, and private environment details from evidence.
The maintainer assesses reports and coordinates fixes and disclosure through the private advisory.

## Supported Releases

Security fixes target the current release distributed from `main`.
Update installed copies through the host's plugin update controls after a fix is published.
Older releases receive no separate maintenance.

## Dependency Security

The hook runtime uses Node built-ins and has no third-party npm dependencies.
Development tools have a separate dependency tree and security exposure.
Dependabot vulnerability alerts notify maintainers about known affected dependencies.
Dependabot security updates propose available fixes independently of weekly version updates.
Maintainers validate dependency changes and integrate them through reviewed pull requests with public CI.
Unsupported or unavailable upstream fixes remain tracked with their evidence and acceptance criteria.
The current braces and KaTeX limitations are recorded in [Issue #78](https://github.com/ririnto/workgraph/issues/78) and [Issue #79](https://github.com/ririnto/workgraph/issues/79).

## Host Boundary

Workgraph delivers instructions and does not enforce host permissions or task execution.
Report Workgraph-specific loading, instruction, or dependency defects through this policy.
Report vulnerabilities in host software through that vendor's security channel.
