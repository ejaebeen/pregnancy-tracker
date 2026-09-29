---
name: notion-task-workflow
description: >-
  Manages development work in a Jira-ticket style using Notion MCP. Use this skill when
  the user wants to plan tasks into a Notion Task Tracker database, implement work
  across dedicated git branches, create commits, push branches to remote GitHub repo,
  open Pull Requests with full descriptions in a continuous batch loop without stopping,
  and present all PRs for review in one go.
---

# Notion Jira-Style Task Tracker Workflow

This skill guides the agent through an agile, ticket-driven development lifecycle where a Notion database serves as the Jira board / task tracker and GitHub Pull Requests serve as the primary medium of code review. Work is executed in an autonomous batch loop, creating multiple PRs across dedicated branches in one go before handoff.

```
┌──────────────┐     ┌────────────────────────────────────────────────────────┐     ┌──────────────┐
│ 1. Plan &    │ ──▶ │ 2. Autonomous Batch Builder Loop                       │ ──▶ │ 3. Batch PR  │
│ Add to Notion│     │    [Pick -> Branch -> Build -> Push -> PR -> Notion] ↺ │     │    Handoff   │
└──────────────┘     └────────────────────────────────────────────────────────┘     └──────────────┘
```


---

## Prerequisites & Environment

1. **Notion MCP Server**: Connected via `composio`.
2. **Python Virtual Environment**: Located at `/home/vscode/venvs/python`. Activate via `source /home/vscode/venvs/python/bin/activate` for backend tasks, testing, and linting.
3. **Git & GitHub Remote Workflow**:
   - **GitHub CLI (`gh`)**: Installed in the devcontainer. Authentication is verified via `gh auth status`. If not yet logged in, authenticate via `gh auth login` or export `GITHUB_TOKEN`.
   - **Git Remote**: `origin` is configured to `https://github.com/ejaebeen/pregnancy-tracker.git`.
   - **GitHub PR as Primary Review**: Code review is conducted on GitHub via Pull Requests. Do NOT just mark the ticket `In Review` in Notion and drop a message in chat asking to review locally. The agent must push the branch to the remote GitHub repo, create a PR with full descriptions, link the PR in Notion, and provide the PR link to the user for review.

## ⭐ Pinned Task Tracker Database

> **ALWAYS use this database. Do NOT search for or create other task databases.** All tickets for this project live here.

- **Name**: `Tasks Tracker`
- **Database ID**: `3e3a1240-592a-808c-a519-edb2b8653785`
- **URL**: https://app.notion.com/p/3e3a1240592a808ca519edb2b8653785

**Schema** (exact, case-sensitive property names — verify with `NOTION_FETCH_DATABASE` on first use if a write fails):

| Property | Type | Allowed values |
|---|---|---|
| `Task name` | `title` (required) | free text, e.g. `[TASK-01] Scaffold FastAPI backend` |
| `Status` | `status` | `Not started`, `In progress`, `In Review`, `Done`, `Blocked` |
| `Priority` | `select` | `High`, `Medium`, `Low` |
| `Task type` | `multi_select` | `🐞 Bug`, `💬 Feature request`, `💅 Polish` |
| `Component` | `select` | `Backend`, `Frontend`, `Database`, `DevOps/Docs` |
| `Effort level` | `select` | `Small`, `Medium`, `Large` |
| `Branch` | `rich_text` | git branch name, e.g. `feat/task-01-scaffold-backend` |
| `PR Link` | `url` | GitHub PR URL created via `gh pr create` (e.g. `https://github.com/ejaebeen/pregnancy-tracker/pull/1`) |
| `Description` | `rich_text` | scope and acceptance criteria |
| `Due date` | `date` | ISO date |
| `Assignee` | `people` | user ID |

> Note: Transition `Status` to `In Review` when code implementation and verification are complete. Always push the branch to remote, open a Pull Request, record the branch name in `Branch`, and populate `PR Link` with the PR URL.


---

## Phase 1: Planning & Task Breakdown (Planner Role)

When the user asks to implement a feature, milestone, or roadmap phase:

1. **Read the task list (always step 1 — use the pinned database above)**:
   1. Call `NOTION_QUERY_DATABASE` with `database_id: 3e3a1240-592a-808c-a519-edb2b8653785`, `page_size: 100`. **Do not search for other databases — the ID is pinned in the table above.**
   2. Summarize existing tasks to the user (Task name, Status, Priority, Task type) and note any `Not started` items as candidates to pick up.
   3. If the query fails (e.g. `object_not_found`/403 — integration not shared with the database), discover the ID via `NOTION_SEARCH_NOTION_PAGE` with `query: "Tasks Tracker"`, `filter_value: "database"`, and retry.
   4. If property names/options look off, verify the schema via `NOTION_FETCH_DATABASE` before writing.
   5. For full detail on a single task (description, PR link), call `NOTION_FETCH_ROW` with its row `page_id`.

2. **Decompose Work into Atomic Tickets**:
    - Break large initiatives into small, self-contained tasks (target: 1 unit of work / PR per task).
    - Each ticket must have:
      - **`Task name`** (title): e.g., `[TASK-01] Scaffold FastAPI backend models and schemas`
      - **`Status`**: start at `Not started`
      - **`Priority`**: `High`, `Medium`, or `Low`
      - **`Task type`**: `🐞 Bug`, `💬 Feature request`, or `💅 Polish`
      - **`Component`**: `Backend`, `Frontend`, `Database`, or `DevOps/Docs`
      - **`Effort level`**: `Small`, `Medium`, or `Large`
      - **`Description`**: scope of the change + concrete acceptance criteria checklist items

3. **Create Notion Rows**:
   - Use `NOTION_INSERT_ROW_DATABASE` targeting the pinned database (`3e3a1240-592a-808c-a519-edb2b8653785`) for each item. `properties` is an array of `{name, type, value}` objects:
     ```json
     {
       "database_id": "3e3a1240-592a-808c-a519-edb2b8653785",
       "properties": [
         { "name": "Task name", "type": "title", "value": "[TASK-01] Scaffold FastAPI backend" },
         { "name": "Status", "type": "status", "value": "Not started" },
         { "name": "Priority", "type": "select", "value": "High" },
         { "name": "Task type", "type": "multi_select", "value": "💬 Feature request" },
         { "name": "Component", "type": "select", "value": "Backend" },
         { "name": "Effort level", "type": "select", "value": "Small" },
         { "name": "Description", "type": "rich_text", "value": "Scope...\nAcceptance criteria:\n- models created in backend/src/models.py\n- tests pass" }
       ]
     }
     ```

4. **Present the Plan**:
   - Output the breakdown table in chat with links/IDs.
   - Ask for user confirmation before executing, or proceed if the user already requested full execution.

---

## Phase 2: Autonomous Batch Builder Loop (Builder Role)

Execute through all planned or queued `Not started` tickets **in a continuous autonomous loop**. Do NOT stop execution or wait for user approval between tickets. Create all Pull Requests in one go.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BATCH EXECUTION LOOP                            │
│                                                                        │
│   ┌───────────────┐     ┌───────────────┐     ┌────────────────────┐   │
│   │ 1. Pick next  │ ──▶ │ 2. Determine  │ ──▶ │ 3. Implement &     │   │
│   │    ticket     │     │    base branch│     │    verify locally  │   │
│   └───────────────┘     └───────────────┘     └────────────────────┘   │
│           ▲                                              │             │
│           │                                              ▼             │
│   ┌───────────────┐     ┌───────────────┐     ┌────────────────────┐   │
│   │ 6. Next ticket│ ◀── │ 5. gh pr      │ ◀── │ 4. git push origin │   │
│   │    (DO NOT    │     │    create &   │     │    feat/branch     │   │
│   │     STOP)     │     │    Notion sync│     │                    │   │
│   └───────────────┘     └───────────────┘     └────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

For **EACH** ticket in the batch:

1. **Pick the Active Item**:
   - Fetch the next `Not started` task from the pinned Tasks Tracker database via `NOTION_QUERY_DATABASE` (respecting dependencies).
   - Set the branch name (e.g. `feat/task-<id>-<short-description>`).
   - Update its row in Notion via `NOTION_UPDATE_ROW_DATABASE`:
     ```json
     {
       "row_id": "<row page UUID>",
       "properties": [
         { "name": "Status", "type": "status", "value": "In progress" },
         { "name": "Branch", "type": "rich_text", "value": "feat/task-<id>-<short-description>" }
       ]
     }
     ```
   - Record the row's `page_id` — it is needed for every subsequent status update.

2. **Determine Base Branch & Create Dedicated Feature Branch**:
   - Analyze dependencies between this task and preceding tasks in the batch:
     - **Case A: Independent Task** (does not depend on unmerged code from earlier tasks):
       Branch directly from `main`:
       ```bash
       git checkout main
       git pull origin main
       git checkout -b feat/task-<id>-<short-description>
       ```
     - **Case B: Dependent / Sequential Task (Stacked Branch)** (builds on code from a prior unmerged task `feat/task-<prev_id>-...`):
       Branch from the prior task's feature branch:
       ```bash
       git checkout feat/task-<prev_id>-<short-description>
       git checkout -b feat/task-<id>-<short-description>
       ```

3. **Implement the Specific Ticket**:
   - Modify only the files directly required by the acceptance criteria for this item.
   - Do NOT introduce changes for future tasks in the same branch.

4. **Verify Locally**:
   - **For Backend tasks**:
     - Activate the virtualenv: `source /home/vscode/venvs/python/bin/activate`
     - Run tests or smoke checks: e.g. `pytest` or `curl -s localhost:8000/health`
   - **For Frontend tasks**:
     - Run linter: `npm run lint` or `oxlint`
     - Run type checks / build: `npm run build` or `tsc -b`
   - Only proceed once all checks pass with 0 errors.

5. **Commit and Push Branch to Remote GitHub Repo**:
   - Stage files explicitly and commit locally:
     ```bash
     git add <modified-files>
     git commit -m "feat(<scope>): <clear description> (refs TASK-<id>)"
     ```
   - Push the feature branch to origin:
     ```bash
     git push -u origin feat/task-<id>-<short-description>
     ```

6. **Open Pull Request via `gh` CLI with Comprehensive Description**:
   - For independent tasks (Case A), target base is `main` (default).
   - For stacked / dependent tasks (Case B), specify `--base feat/task-<prev_id>-<short-description>` or clearly note the dependency in the PR body.
   - Create the PR using `gh pr create` with rich markdown formatting covering the Notion ticket link, summary of changes, verified acceptance criteria, and testing results:
     ```bash
     gh pr create \
       --title "feat: <task title> [TASK-<id>]" \
       --body "$(cat <<'EOF'
     ## 📌 Notion Task
     - **Task**: [TASK-<id>] <Task Title>
     - **Notion Tracker**: [Tasks Tracker Database](https://app.notion.com/p/3e3a1240592a808ca519edb2b8653785)

     ## 📝 Summary of Changes
     - Detailed explanation of what was implemented
     - Key architectural decisions, file changes, and component interactions

     ## ✅ Acceptance Criteria Checklist
     - [x] Verified criterion 1
     - [x] Verified criterion 2

     ## 🧪 Testing & Verification Performed
     - **Backend / API**: e.g., verified with curl / pytest (0 errors)
     - **Frontend**: `npm run lint` and `npm run build` passed with 0 errors
     - **UX States**: Verified Loading, Empty, Submitting, and Error states

     ## 🔍 Review Request
     Please review the code diff and implementation details in this Pull Request.
     EOF
     )"
     ```
   - Capture the created PR URL from the command output (e.g. `https://github.com/ejaebeen/pregnancy-tracker/pull/X`).

7. **Update Notion Ticket**:
   - Transition `Status` to `In Review` and record both `Branch` and `PR Link`:
     ```json
     {
       "row_id": "<row page UUID>",
       "properties": [
         { "name": "Status", "type": "status", "value": "In Review" },
         { "name": "Branch", "type": "rich_text", "value": "feat/task-<id>-<short-description>" },
         { "name": "PR Link", "type": "url", "value": "<PR URL>" }
       ]
     }
     ```

8. **DO NOT STOP — Loop Immediately to the Next Ticket**:
   - Retain the created PR URL, branch name, and ticket ID in execution context.
   - **Immediately proceed to step 1 for the next `Not started` task.**
   - Do NOT stop to wait for user code review or merging between tasks. Continue until all tasks in the queue are completed.

---

## Phase 3: Final Batch PR Handoff

Only halt execution when:
1. All planned / queued `Not started` tickets in the batch have been completed with Pull Requests opened, OR
2. A critical unrecoverable blocker occurs.

Once the entire batch is complete, output a consolidated review summary table in chat:

```markdown
### 🚀 Batch Execution Complete — All PRs Created

| Ticket | Title | Branch | Pull Request | Status |
|---|---|---|---|---|
| [TASK-01] | <Task Title> | `feat/task-01-...` | [PR #X](<PR_URL>) | Ready for Review |
| [TASK-02] | <Task Title> | `feat/task-02-...` | [PR #Y](<PR_URL>) | Ready for Review |

All branches have been pushed and all Notion tickets have been transitioned to `In Review` with PR links. Please review the PRs at your convenience!
```

---

## Phase 4: Review Iteration & Merging (Post-Review Workflow)

Once the user reviews the PRs:

1. **If Changes Requested by User**:
   - The user may leave comments on the GitHub PR or in chat.
   - Transition Notion ticket `Status` to `In progress`.
   - Checkout the task branch: `git checkout feat/task-<id>-<short-description>`.
   - Implement the requested revisions and re-run verification checks.
   - Commit additions: `git commit -m "fix(<scope>): address review feedback (refs TASK-<id>)"`.
   - Push updates to remote: `git push origin feat/task-<id>-<short-description>`.
     *(This automatically updates the open Pull Request on GitHub with the new commits.)*
   - Transition Notion ticket `Status` back to `In Review` and notify the user on the PR/chat that the PR is updated for re-review.

2. **On User Approval & Merge**:
   - Once the user approves the PR:
     - The PR is merged on GitHub (either by the user clicking Merge on GitHub, or by running `gh pr merge --squash --delete-branch` upon user confirmation).
   - Sync local `main`:
     ```bash
     git checkout main
     git pull origin main
     ```
   - **Update Notion Ticket to Done**:
     - Transition via `NOTION_UPDATE_ROW_DATABASE`:
       ```json
       {
         "row_id": "<row page UUID>",
         "properties": [
           { "name": "Status", "type": "status", "value": "Done" }
         ]
       }
       ```
   - If other stacked PRs depended on this merged branch, re-target or rebase their base to `main` as needed.

---

## Reference Setup & Troubleshooting

- **Notion connection**: The `notion` toolkit must be connected via `composio` (see `COMPOSIO_MANAGE_CONNECTIONS`). Verify with `COMPOSIO_SEARCH_TOOLS` that a connection is `ACTIVE` before any `NOTION_*` call.
- **`object_not_found` / 403 on the pinned database**: The database is not shared with the Notion integration/bot. Share `Tasks Tracker` with the connected bot, then retry.
- **Wrong property names in filters/writes**: Always check `NOTION_FETCH_DATABASE` output first — property names are case-sensitive and option labels must match exactly (e.g. `Not started`, not `To Do`).
