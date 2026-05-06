## Appendix: Vercel Skills CLI Usage Guide

The `skills` CLI (accessed via `npx skills`) acts as the universal package manager for the open agent skills ecosystem. Below is a comprehensive usage document explaining each core command and its advanced options based on the Vercel specification.

### 1. Adding Skills (`skills add` or `skills a`)

Used to install new skills from repositories or local paths into your environment.

- `npx skills add vercel-labs/agent-skills`: Installs the complete skill package into the current project's agent directory.
- `npx skills add vercel-labs/agent-skills -g`: The `-g` or `--global` flag installs the skill globally (e.g., `~/.config/devin/skills/`), making it available across all projects on your machine.
- `npx skills add vercel-labs/agent-skills --agent devin cursor`: Installs the skill specifically for the `devin` and `cursor` agents.
- `npx skills add anthropics/skills --skill pdf`: Performs a targeted installation of only the `pdf` skill from the larger repository.
- `npx skills add <repo> --copy`: Copies the files physically to the agent directories instead of utilizing the default symlink architecture.

### 2. Removing Skills (`skills remove` or `skills rm`)

Used to safely uninstall or detach skills from your agents.

- `npx skills remove`: Running this without arguments launches an interactive menu allowing you to check off which skills to remove.
- `npx skills remove web-design`: Instantly removes the specific skill named `web-design` from the current project.
- `npx skills rm --global frontend-design`: Removes the `frontend-design` skill exclusively from the global system scope.

### 3. Listing Skills (`skills list` or `skills ls`)

Displays the skills currently installed and available to your agents.

- `npx skills list`: Displays a formatted list of all project-level skills.
- `npx skills ls -g`: Uses the shorthand `ls` with the `-g` flag to list all globally installed skills.
- `npx skills ls -a claude-code`: Filters the list to show only the skills configured for the `claude-code` agent.
- `npx skills ls --json`: Outputs the installed skills in raw JSON format, which is highly useful for CI/CD pipelines or piping into other command-line tools like `jq`.

### 4. Finding & Discovering Skills (`skills find`)

Queries the central registry (skills.sh) for new capabilities.

- `npx skills find`: Launches an interactive search interface to browse available skills.
- `npx skills find typescript`: Instantly queries the registry for skills matching the keyword `typescript` and returns the results.

### 5. Updating Skills (`skills update` & `skills check`)

Keeps installed skills synchronized with their upstream repositories.

- `npx skills check`: Reads the lockfile to detect which tracked skills have updates available from their source repositories.
- `npx skills update`: Scans and updates all locally installed skills to their latest versions.
- `npx skills update my-skill`: Targets and updates only the specific skill named `my-skill`.
- `npx skills update -g`: Updates all of your globally installed skills.

### 6. Synchronization and Lockfiles (`experimental_install` & `experimental_sync`)

Advanced commands for team synchronization, automated environments, and dependency crawling.

- `npx skills experimental_install`: Functioning similarly to `npm ci`, this command reads the `skills-lock.json` file and deterministically restores the exact cryptographic versions of the skills. This is essential for ensuring team members and CI runners have identical setups.
- `npx skills experimental_sync`: Scans the project's `node_modules` directory to automatically detect if any installed NPM packages contain embedded agent skills, prompting you to sync them into the active agent directories.
- `npx skills experimental_sync -y`: Runs the same sync operation completely unattended, bypassing all confirmation prompts.

### 7. Scaffolding New Skills (`skills init`)

Used by developers to author new custom agent instructions.

- `npx skills init my-skill`: Scaffolds a new, empty skill directory named `my-skill`, generating the required `SKILL.md` template and basic folder structure for immediate development.
