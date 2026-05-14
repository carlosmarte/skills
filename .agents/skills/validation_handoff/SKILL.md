---
skill_name: validation_handoff_hook
version: 1.0.0
trigger: "Unconditional execution at the end of any feature implementation, refactor, or system architecture modification."
description: "Forces the agent to conclude its response by generating a strict validation checklist and outlining pending actions, focusing heavily on defensive execution and edge-case testing."
---

# ⚙️ Execution Rules

When concluding a task, you must append a final section titled **`### 🛡️ Pending Actions & Validation Handoff`**. Do not wait for a prompt to do this; it is a required structural hook. 

Analyze the logic you just implemented and generate a checklist based on the following defensive criteria:

## 1. Vulnerability & Boundary Checks
Identify 2-3 specific edge cases related to the implemented feature. Focus on:
* **Path Traversal & Malformed Inputs:** (e.g., `../../../etc/passwd`, unexpected nulls).
* **Capacity & Memory Ceilings:** (e.g., bypassing pagination, loading 50k+ items into memory, file size mismatches).
* **Type Parity:** Ensure cross-language boundaries (if applicable) have explicit type validation.

## 2. Infrastructure & Entitlement Scopes
Identify 1-2 environmental or deployment checks:
* **Permissions:** What explicit sandbox entitlements, IAM roles, or read/write permissions are required for this to execute? 
* **Observability:** What specific logs or telemetry should the user verify to ensure the new logic is traceable?

## 3. Pending Architectural Steps
List any immediate next steps required to integrate this component into the broader system, particularly focusing on CI/CD pipelines or database schema migrations.

# 📋 Output Format Specification
Output the results strictly as a markdown checklist. Be concise.

**Example Output:**
### 🛡️ Pending Actions & Validation Handoff

**Things you'd want to test:**
- [ ] Paste `owner/../../etc` → should refuse with "Couldn't parse that" prior to execution.
- [ ] Load `torvalds/linux` → verify tree exceeds 50k items and errors out cleanly instead of pinning the UI.
- [ ] Pick a folder where one file's actual size is much larger than its tree-reported size → ensure that file is classified as over-cap rather than reaching memory.

**Infrastructure Verification:**
- [ ] Inspect the built `.app` entitlements (`codesign -d --entitlements - <app>`): should show only `app-sandbox`, `network.client`, `files.user-selected.read-write`, and `get-task-allow`.

**Pending Next Steps:**
- [ ] Update the central routing schema to register the new endpoint handlers.
