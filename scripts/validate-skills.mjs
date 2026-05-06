#!/usr/bin/env node
// Walks .agents/skills/*/SKILL.md and validates each skill against the
// agentskills.io.md SPEC. Exits non-zero on any spec violation so this
// can gate CI. Resolution is convention-based: .agents/skills/<name>/.
//
// Validates:
//   §2.1 name == parent directory
//   §2.2 SKILL.md present
//   §3.1 frontmatter fields (required, lengths, name pattern)
//   §3.2 file refs in SKILL.md are relative + under canonical dirs (error)
//   §3.2 file ref chain depth ≤ 1 (warning)
//   §4   optional dirs are scripts/ | references/ | assets/ (warning)
//        stray files at skill root (warning)
//        body line count ≤ 500 (warning)

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(repoRoot, ".agents", "skills");

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NAME_MAX = 64;
const DESC_MAX = 1024;
const COMPAT_MAX = 500;
const BODY_LINE_SOFT = 500;

const CANONICAL_DIRS = new Set(["scripts", "references", "assets"]);
const ALLOWED_ROOT_FILES = new Set([
  "SKILL.md",
  "README.md",
  "LICENSE",
  "LICENSE.txt",
]);

const errors = [];
const warnings = [];

function parseFrontmatter(text, file) {
  if (!text.startsWith("---\n")) {
    errors.push(`${file}: missing frontmatter (file must start with ---)`);
    return null;
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    errors.push(`${file}: unterminated frontmatter (no closing ---)`);
    return null;
  }
  const block = text.slice(4, end);
  const body = text.slice(end + 5);
  const fm = {};
  let currentKey = null;
  for (const raw of block.split("\n")) {
    if (!raw.trim()) continue;
    const m = raw.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (m) {
      currentKey = m[1];
      fm[currentKey] = m[2];
    } else if (currentKey && /^\s+/.test(raw)) {
      fm[currentKey] = (fm[currentKey] || "") + "\n" + raw;
    }
  }
  return { fm, body };
}

function validateFrontmatter(dirName, fm, body) {
  const where = `${dirName}/SKILL.md`;
  if (!fm.name) errors.push(`${where}: missing required field 'name'`);
  if (!fm.description) errors.push(`${where}: missing required field 'description'`);
  if (fm.name && fm.name !== dirName)
    errors.push(`${where}: name '${fm.name}' must match parent directory '${dirName}'`);
  if (fm.name && (fm.name.length < 1 || fm.name.length > NAME_MAX))
    errors.push(`${where}: name length ${fm.name.length} not in [1, ${NAME_MAX}]`);
  if (fm.name && !NAME_RE.test(fm.name))
    errors.push(`${where}: name '${fm.name}' violates pattern (lowercase a-z0-9, hyphen-separated, no leading/trailing/consecutive hyphens)`);
  if (fm.description) {
    const dlen = fm.description.replace(/^["']|["']$/g, "").length;
    if (dlen < 1 || dlen > DESC_MAX)
      errors.push(`${where}: description length ${dlen} not in [1, ${DESC_MAX}]`);
  }
  if (fm.compatibility && fm.compatibility.length > COMPAT_MAX)
    errors.push(`${where}: compatibility length ${fm.compatibility.length} > ${COMPAT_MAX}`);
  const bodyLines = body.split("\n").length;
  if (bodyLines > BODY_LINE_SOFT)
    warnings.push(`${where}: body has ${bodyLines} lines (>${BODY_LINE_SOFT} soft cap)`);
}

// Pull candidate file references out of markdown text.
// Returns paths from backtick spans + markdown links that look path-like.
// Filters out placeholders (<x>), globs (*?), and obvious non-paths.
function extractRefs(text) {
  const refs = new Set();
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    const p = m[1].trim();
    if (looksLikePath(p)) refs.add(p);
  }
  for (const m of text.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g)) {
    const p = m[1].trim();
    if (/^https?:\/\//i.test(p)) continue;
    if (p.startsWith("#")) continue;
    if (looksLikePath(p)) refs.add(p);
  }
  return [...refs];
}

// A real file reference per SPEC §3.2 points under a canonical optional dir
// (scripts/, references/, assets/) — relative or via a sibling-escape `../`.
// Anything else (slash commands, illustrative absolute paths, output examples
// the skill *produces*) is not a SKILL.md self-reference and is not validated.
function looksLikePath(s) {
  if (!s) return false;
  if (s.includes("<") || s.includes(">")) return false;
  if (s.includes("*") || s.includes("?")) return false;
  if (s.includes(" ")) return false;
  if (/^(scripts|references|assets)\/.+/.test(s)) return true;
  if (/^\.\.\/(scripts|references|assets)\/.+/.test(s)) return true;
  return false;
}

function validateRefs(dirName, skillDir, body) {
  const where = `${dirName}/SKILL.md`;
  const refs = extractRefs(body);
  for (const ref of refs) {
    const stripped = ref.replace(/\/+$/, "");
    if (stripped.startsWith("../")) {
      errors.push(`${where}: reference '${ref}' escapes skill root (SPEC §3.2 requires relative paths from skill root)`);
      continue;
    }
    const abs = join(skillDir, stripped);
    if (!existsSync(abs)) {
      errors.push(`${where}: reference '${ref}' does not exist at ${abs}`);
      continue;
    }
    // Chain depth check: if ref is a file under a canonical dir, peek inside
    // and warn if it itself contains canonical-dir refs.
    if (statSync(abs).isFile() && /\.(md|txt)$/.test(stripped)) {
      const childText = readFileSync(abs, "utf8");
      const childRefs = extractRefs(childText).filter(
        (r) => /^(scripts|references|assets)\//.test(r)
      );
      if (childRefs.length) {
        warnings.push(
          `${where}: '${ref}' references further files (${childRefs
            .slice(0, 3)
            .join(", ")}${childRefs.length > 3 ? "…" : ""}) — SPEC §3.2 recommends one-level-deep chains`
        );
      }
    }
  }
}

function validateLayout(dirName, skillDir) {
  for (const entry of readdirSync(skillDir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isDirectory()) {
      if (!CANONICAL_DIRS.has(entry.name))
        warnings.push(
          `${dirName}: non-standard top-level directory '${entry.name}/' (SPEC §4 names scripts/, references/, assets/)`
        );
    } else if (entry.isFile()) {
      if (!ALLOWED_ROOT_FILES.has(entry.name))
        warnings.push(
          `${dirName}: stray file at skill root '${entry.name}' (expected SKILL.md, README.md, LICENSE)`
        );
    }
  }
}

if (!existsSync(skillsDir)) {
  console.error(`No skills directory at ${skillsDir}`);
  process.exit(2);
}

let count = 0;
for (const dirName of readdirSync(skillsDir).sort()) {
  const skillDir = join(skillsDir, dirName);
  if (!statSync(skillDir).isDirectory()) continue;
  const skillFile = join(skillDir, "SKILL.md");
  if (!existsSync(skillFile)) {
    errors.push(`${dirName}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(skillFile, "utf8");
  const parsed = parseFrontmatter(text, `${dirName}/SKILL.md`);
  if (!parsed) continue;
  validateFrontmatter(dirName, parsed.fm, parsed.body);
  validateRefs(dirName, skillDir, parsed.body);
  validateLayout(dirName, skillDir);
  count++;
}

for (const w of warnings) console.warn(`warn: ${w}`);
for (const e of errors) console.error(`error: ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${count} skill(s)`);
  process.exit(1);
}
console.log(`ok: ${count} skill(s) validated, ${warnings.length} warning(s)`);
