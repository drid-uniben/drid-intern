# Security Policy

DRID Intern takes security seriously. If you find a vulnerability, please report it **privately**.

## Reporting a vulnerability (private)

Preferred:

1. Go to the repository’s **Security** tab.
2. Click **Report a vulnerability**.
3. Submit a private report (GitHub Security Advisory).

If private reporting is unavailable, contact maintainers directly via GitHub.
Do **not** open a public issue with exploit details.

## What to include

Please include as much of the following as possible:

- A clear description of the vulnerability and its impact
- Affected component(s): `frontend/`, `backend/`, CI/workflows, Docker/deployment
- Steps to reproduce (or a proof-of-concept)
- Any relevant logs, request/response examples, or screenshots
- Whether the issue is reliably reproducible
- Suggested mitigation/fix (if you have one)

## Scope

In-scope examples for this repo include (but are not limited to):

- Authentication / authorization issues (role escalation: Admin/Reviewer/Intern)
- Token and cookie handling (JWT access/refresh, cookie flags, session fixation)
- CORS and cross-site request handling
- Invitation and submission token handling/replay protection
- Injection issues (SQL/ORM, command injection)
- Sensitive data exposure (PII, credentials, secrets, logs)
- GitHub Actions/workflow security issues (token leakage, unsafe script usage, over-broad permissions)

Out-of-scope (unless it results in a real security impact):

- Purely theoretical issues without a plausible exploit
- Low-severity UX issues that don’t expose data or change authorization
- Social engineering attempts against maintainers/contributors

## Supported versions

Security fixes are applied to the default branch (`main`) and, when needed, backported by maintainers.

## Coordinated disclosure

- Please keep vulnerability details private until a fix is released or maintainers confirm it’s safe to disclose.
- Maintainers will acknowledge receipt and coordinate verification/remediation timelines.

## Safe testing guidelines

When validating a vulnerability:

- Do not run denial-of-service tests against shared/public environments.
- Do not access or modify real user data.
- Use test accounts and local/dev environments whenever possible.

Thank you for helping keep the project and its users safe.
