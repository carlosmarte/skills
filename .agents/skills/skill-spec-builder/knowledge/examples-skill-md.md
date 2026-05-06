# SKILL.md — Worked Examples

Three end-to-end examples spanning the most common skill archetypes: a CI/CD smoke test (`vercel-preview-smoke-test`), an ops runbook (`incident-response-runbook`), and a registry publisher (`internal-package-publisher`). Each example shows the imagined user dialogue, then the resulting `SKILL.md`.

These examples are calibration anchors. When uncertain about format details, mirror what you see here.

---

## Example 1 — `vercel-preview-smoke-test`

**Imagined user dialogue (compressed):**
> "I want a skill that runs when a PR opens. It pulls the Vercel preview URL, hits it with a HEAD request, then runs three smoke probes (homepage, login, checkout). It needs the Vercel token. Don't retry on 4xx. If 5xx, retry once after 5s. Output a markdown table."

```markdown
---
name: vercel-preview-smoke-test
description: Use when a user opens a pull request and asks for a preview-deploy smoke test against the Vercel preview URL. Resolves the preview URL via the Vercel API, issues HEAD plus three configured probes (homepage, login, checkout), and returns a markdown reachability report.
metadata:
  requires:
    env:
      - VERCEL_TOKEN
      - GITHUB_TOKEN
    bins:
      - curl
      - jq
---
## When to Use
- A user opens a pull request and requests a preview-deploy smoke test.
- A CI pipeline emits a "preview ready" webhook and the agent must verify reachability before approving merge.
- A user pastes a Vercel preview URL and asks "is this live?"

## Steps
1. Read the PR number from the user's request.
2. Resolve the matching Vercel preview URL via the Vercel API using `${VERCEL_TOKEN}`.
3. Issue a `HEAD` request against the resolved URL with a 10-second timeout.
4. If the HEAD response is in 2xx, run probes against `/`, `/login`, and `/checkout` with the same timeout.
5. If any probe returns 5xx, retry that probe once after a 5-second backoff.
6. Format probe results as a markdown table with columns: path, status, latency_ms, attempt.
7. Return the table to the user.

## Notes
- Do not retry on 4xx responses; surface them as-is in the report.
- Do not write the report to disk; return it in-chat.
```

---

## Example 2 — `incident-response-runbook`

**Imagined user dialogue (compressed):**
> "Skill for our oncall when an alert fires. They paste the alert ID. The skill pulls the alert from PagerDuty, summarizes the affected service, links the recent deploys, and drafts an initial Slack post for the incident channel. Needs PagerDuty token, GitHub token, Slack token. Never auto-post — always return draft for human review."

```markdown
---
name: incident-response-runbook
description: Use when an oncall engineer pastes a PagerDuty alert ID and needs a structured incident-response packet — alert summary, affected service, recent deploys, and a draft Slack post for the incident channel. Always returns a draft for human review; never auto-posts.
metadata:
  requires:
    env:
      - PAGERDUTY_TOKEN
      - GITHUB_TOKEN
      - SLACK_TOKEN
    bins:
      - curl
      - jq
---
## When to Use
- An oncall engineer pastes a PagerDuty alert ID and asks for incident-response context.
- A "page received" message arrives in chat and the agent must compile the response packet.
- An engineer asks "what's deployed on <service> right now?" in response to an alert.

## Steps
1. Read the alert ID from the user's message.
2. Fetch the alert payload from PagerDuty using `${PAGERDUTY_TOKEN}`.
3. Resolve the affected service from the alert metadata.
4. Fetch the last five deploys for that service from the GitHub Deployments API using `${GITHUB_TOKEN}`.
5. Compile a summary block: alert title, severity, affected service, deploy timeline.
6. Draft an initial Slack post for `#incident-{service}` containing the summary and an "investigating" status.
7. Return the summary block and the draft Slack post in-chat for human approval.

## Notes
- Do not post to Slack automatically. The Slack token is read-only in this skill's scope.
- Do not page additional responders; that decision belongs to the human.
```

---

## Example 3 — `internal-package-publisher`

**Imagined user dialogue (compressed):**
> "After we merge a release PR, this skill bumps the version, runs lint+typecheck+test, and if all green, publishes to our internal npm registry. Uses pnpm. Don't publish if working tree is dirty. Don't publish prerelease versions. Output the published version and registry URL."

```markdown
---
name: internal-package-publisher
description: Use after a release pull request is merged and the user requests a publish to the internal npm registry. Bumps the version per the release PR title, runs lint and typecheck and tests, and on full pass publishes via pnpm. Refuses to publish from a dirty working tree or for prerelease tags.
metadata:
  requires:
    env:
      - NPM_REGISTRY_TOKEN
    bins:
      - pnpm
      - git
---
## When to Use
- A release pull request was just merged and the user requests publishing the new version.
- The user explicitly invokes "publish" after a clean merge to the release branch.

## Steps
1. Read the new version number from the merged release PR title (semver).
2. Validate the working tree is clean via `git status --porcelain`; abort if not.
3. Validate the version is not a prerelease tag (no `-alpha`, `-beta`, `-rc`); abort if so.
4. Run `pnpm lint`; abort on non-zero exit.
5. Run `pnpm typecheck`; abort on non-zero exit.
6. Run `pnpm test`; abort on non-zero exit.
7. Run `pnpm publish --registry $NPM_REGISTRY_URL` with `${NPM_REGISTRY_TOKEN}` for auth.
8. Return the published version and the registry URL of the new tarball.

## Notes
- Abort means: print the failure reason and exit without publishing. Never partial-publish.
- The skill assumes `package.json` was already version-bumped by the release PR.
```

---

## What to Imitate

When generating a new `SKILL.md` for a user:

- **Description style:** factual, activation-cue-shaped, no marketing.
- **Trigger bullets:** specific user phrasings or system signals, not abstract scenarios.
- **Steps:** numbered, imperative, atomic (one verb-target per step), no nesting.
- **Notes:** terse caveats only — no narrative.
- **Frontmatter:** include `metadata.requires` only when dependencies were explicitly elicited; never invent them.

When in doubt, prefer the structure of Example 1 — it covers the most common shape (read input, call APIs, format output, return).
