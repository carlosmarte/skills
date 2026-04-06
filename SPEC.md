# Software Requirements Specification (SPEC): Agent Skills Format

## 1. Introduction

### 1.1 Purpose

This document specifies the structural, metadata, and formatting requirements for creating "Agent Skills." It serves as the official specification for developers and client implementors to ensure skills are consistently formatted, easily validated, and optimally consumed by AI agents.

### 1.2 Scope

This specification covers the mandatory directory structure, the `SKILL.md` file formatting (including required and optional frontmatter fields), standard optional directories, progressive disclosure context management, and skill validation.

---

## 2. Structural Requirements

### 2.1 Base Directory

A skill MUST be encapsulated within a single parent directory. The name of this directory MUST perfectly match the `name` field defined in the skill's frontmatter.

### 2.2 Directory Contents

At minimum, the directory MUST contain a `SKILL.md` file. The following structure is standard:

```
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
```

---

## 3. SKILL.md Specification

The `SKILL.md` file is the core component of any skill. It MUST consist of a YAML frontmatter block followed by standard Markdown body content.

### 3.1 YAML Frontmatter Fields

The frontmatter defines the metadata loaded by the agent at startup.

| Field | Required | Constraints & Validation Rules |
| ----- | -------- | ------------------------------ |
| `name` | **Yes** | 1 to 64 characters long. Allowed characters: Unicode lowercase alphanumeric (`a-z`, `0-9`) and hyphens (`-`). Cannot start or end with a hyphen. Cannot contain consecutive hyphens (`--`). Must exactly match the parent directory name. |
| `description` | **Yes** | 1 to 1024 characters long. Non-empty. Must describe _what_ the skill does and _when_ the agent should trigger it. Should include semantic keywords to help agents identify tasks. |
| `license` | No | Should be short (e.g., license name like `Apache-2.0` or a reference to a bundled `LICENSE.txt` file). |
| `compatibility` | No | Maximum 500 characters. Indicates environment requirements (e.g., targeted product, system packages like `git` or `docker`, network access). |
| `metadata` | No | Arbitrary string-to-string key-value mapping. Key names should be unique to avoid conflicts (e.g., `author`, `version`). |
| `allowed-tools` | No | Space-delimited list of pre-approved tools the skill may use. _Note: This field is currently experimental._ |

### 3.2 Body Content

The Markdown body immediately following the frontmatter provides the instructions for the agent.

- **Format:** Markdown. No strict format restrictions apply.
- **Content Recommendations:** Step-by-step instructions, input/output examples, and common edge cases.
- **Length Constraints:** The main `SKILL.md` body SHOULD be kept under 500 lines to optimize context windows.
- **References:** File references inside `SKILL.md` MUST use relative paths from the skill root (e.g., `scripts/extract.py`). File reference chains should be kept one level deep.

---

## 4. Optional Directories

To prevent bloating the agent's context window, extended functionality should be modularized into the following optional directories:

### 4.1 `scripts/`

- **Purpose:** Contains executable code the agent can run (e.g., Python, Bash, JavaScript).
- **Requirements:** Scripts MUST be self-contained (or clearly document dependencies), handle edge cases gracefully, and return helpful error messages to the agent.

### 4.2 `references/`

- **Purpose:** Contains supplemental documentation loaded _on-demand_ by the agent.
- **Examples:** `REFERENCE.md` (detailed tech specs), `FORMS.md` (structured data formats), or domain-specific files (`legal.md`).
- **Requirements:** Individual reference files MUST be kept focused and small to minimize context usage when loaded.

### 4.3 `assets/`

- **Purpose:** Contains static resources.
- **Examples:** Document templates, configuration templates, images (diagrams), and static data files (schemas, lookup tables).

---

## 5. System Behaviors & Progressive Disclosure

Agent implementations consuming these skills MUST support Progressive Disclosure to ensure efficient token usage:

1. **Startup (~100 tokens):** The agent loads only the `name` and `description` from the metadata.
2. **Activation (< 5000 tokens):** Once the agent decides to use the skill, it loads the complete body of the `SKILL.md` file.
3. **Execution (As needed):** Secondary resources in `scripts/`, `references/`, and `assets/` are only read by the agent on demand during the task execution.

---

## 6. Validation Requirements

Skill creators MUST validate their skills using the official `skills-ref` reference library:

```bash
skills-ref validate ./my-skill
```

The validator will strictly verify that the `SKILL.md` frontmatter is valid and perfectly adheres to all character constraints and naming conventions specified in Section 3.1.
