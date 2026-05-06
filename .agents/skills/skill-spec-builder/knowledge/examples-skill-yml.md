# SKILL.yml — Worked Examples

Pure YAML configurations for the same three workflows as `examples-skill-md.md`. Use these as calibration anchors when generating SKILL.yml. Step counts, dependencies, and intent must match the corresponding SKILL.md and JSONL outputs exactly.

---

## Example 1 — `vercel-preview-smoke-test`

```yaml
skill_intent: Run a Vercel preview-deploy smoke test on PR open and return a markdown reachability report.

environmental_constraints:
  env:
    - VERCEL_TOKEN
    - GITHUB_TOKEN
  bins:
    - curl
    - jq

failure_modes:
  - Do not retry on 4xx HTTP responses; surface them as-is.
  - Do not write the report to disk; return it in-chat only.
  - On 5xx, retry the failing probe exactly once after a 5-second backoff.

execution_steps:
  - id: 1
    action: read_pr_number
    parameters:
      source: user_request
    success_criteria:
      - PR number parsed as a positive integer.

  - id: 2
    action: resolve_preview_url
    parameters:
      pr_number: <from_step_1>
      vercel_token: ${VERCEL_TOKEN}
    success_criteria:
      - URL resolved via Vercel API.
      - URL matches the pattern https://*.vercel.app.

  - id: 3
    action: probe_url
    parameters:
      url: <from_step_2>
      method: HEAD
      timeout_seconds: 10
    success_criteria:
      - HTTP status is in 2xx.
      - Response received within 10 seconds.

  - id: 4
    action: probe_url
    parameters:
      base_url: <from_step_2>
      paths:
        - /
        - /login
        - /checkout
      method: GET
      timeout_seconds: 10
    success_criteria:
      - All three probes returned a status code.
      - Latency captured for each probe.

  - id: 5
    action: retry_failed_probes
    parameters:
      retry_threshold: 5xx
      max_retries: 1
      backoff_seconds: 5
    success_criteria:
      - Each 5xx probe attempted exactly once more.
      - 4xx probes were not retried.

  - id: 6
    action: format_output
    parameters:
      format: markdown_table
      columns:
        - path
        - status
        - latency_ms
        - attempt
    success_criteria:
      - Output is a single markdown table.
      - Every probe has exactly one row per attempt.

  - id: 7
    action: return_to_user
    parameters:
      destination: chat
    success_criteria:
      - Markdown table delivered in-chat.
```

---

## Example 2 — `incident-response-runbook`

```yaml
skill_intent: Compile a structured incident-response packet from a PagerDuty alert ID and return a draft Slack post for human review — never auto-post.

environmental_constraints:
  env:
    - PAGERDUTY_TOKEN
    - GITHUB_TOKEN
    - SLACK_TOKEN
  bins:
    - curl
    - jq

failure_modes:
  - Do not post to Slack automatically; always return drafts for human review.
  - Do not page additional responders.
  - Do not log the value of any token; reference env vars by name only.

execution_steps:
  - id: 1
    action: read_alert_id
    parameters:
      source: user_message
    success_criteria:
      - Alert ID extracted as a string.

  - id: 2
    action: fetch_alert_payload
    parameters:
      alert_id: <from_step_1>
      pagerduty_token: ${PAGERDUTY_TOKEN}
    success_criteria:
      - PagerDuty API returned 200.
      - Payload contains alert title and severity.

  - id: 3
    action: resolve_affected_service
    parameters:
      alert_payload: <from_step_2>
    success_criteria:
      - Service name extracted from alert metadata.

  - id: 4
    action: fetch_recent_deploys
    parameters:
      service: <from_step_3>
      count: 5
      github_token: ${GITHUB_TOKEN}
    success_criteria:
      - GitHub Deployments API returned 200.
      - At least one deploy entry returned, or empty array if service has no deploys.

  - id: 5
    action: compile_summary
    parameters:
      alert: <from_step_2>
      service: <from_step_3>
      deploys: <from_step_4>
    success_criteria:
      - Summary contains alert title, severity, service name, deploy timeline.

  - id: 6
    action: draft_slack_post
    parameters:
      channel: "#incident-${service}"
      summary: <from_step_5>
      status: investigating
    success_criteria:
      - Draft contains the summary block and an "investigating" status line.
      - Draft is not transmitted to Slack.

  - id: 7
    action: return_to_user
    parameters:
      destination: chat
      payload:
        - summary: <from_step_5>
        - draft_slack_post: <from_step_6>
    success_criteria:
      - Both summary and draft delivered in-chat for human approval.
```

---

## Example 3 — `internal-package-publisher`

```yaml
skill_intent: After a merged release PR, run lint plus typecheck plus tests, then publish to the internal npm registry — refusing dirty trees and prerelease versions.

environmental_constraints:
  env:
    - NPM_REGISTRY_TOKEN
  bins:
    - pnpm
    - git

failure_modes:
  - Do not publish if the working tree is dirty.
  - Do not publish prerelease versions (no -alpha, -beta, -rc tags).
  - Do not partial-publish; on any check failure, abort the entire flow.
  - Do not embed the registry token value in any output.

execution_steps:
  - id: 1
    action: read_release_version
    parameters:
      source: merged_pr_title
    success_criteria:
      - Version parsed as valid semver.

  - id: 2
    action: validate_clean_working_tree
    parameters:
      command: git status --porcelain
    success_criteria:
      - Command output is empty.

  - id: 3
    action: validate_not_prerelease
    parameters:
      version: <from_step_1>
    success_criteria:
      - Version contains no -alpha, -beta, or -rc suffix.

  - id: 4
    action: run_lint
    parameters:
      command: pnpm lint
    success_criteria:
      - Exit code is 0.

  - id: 5
    action: run_typecheck
    parameters:
      command: pnpm typecheck
    success_criteria:
      - Exit code is 0.

  - id: 6
    action: run_tests
    parameters:
      command: pnpm test
    success_criteria:
      - Exit code is 0.

  - id: 7
    action: publish_package
    parameters:
      command: pnpm publish
      registry_token: ${NPM_REGISTRY_TOKEN}
    success_criteria:
      - Publish completed with exit code 0.
      - Registry tarball URL returned.

  - id: 8
    action: return_publish_summary
    parameters:
      version: <from_step_1>
      registry_url: <from_step_7>
    success_criteria:
      - Version and registry URL delivered in-chat.
```

---

## Cross-Format Consistency Reminder

For each example in this file:

- The `skill_intent` distills the same scope as the `description` in the corresponding `SKILL.md`.
- `environmental_constraints.env` and `bins` exactly match `metadata.requires.env` and `bins` in `SKILL.md`.
- `execution_steps` count exactly matches the line count in the corresponding JSONL stream.
- `execution_steps[i].action` snake_case maps 1:1 to JSONL `action_directive` imperative form (e.g., `read_pr_number` ↔ `"Read PR number"`).

If you see drift between any two files in your generated output, fix the YAML or the JSONL — never patch by changing the SKILL.md to mask the inconsistency.
