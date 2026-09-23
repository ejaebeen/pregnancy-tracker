---
name: notion-task-workflow
description: >-
  Manages development work in a Jira-ticket style using Notion MCP. Use this skill when
  the user wants to plan tasks into a Notion Task Tracker database, implement work
  item-by-item on dedicated git branches, create commits, push branches, and open
  Pull Requests for user review and merging.
---

# Notion Jira-Style Task Tracker Workflow

This skill guides the agent through an agile, ticket-driven development lifecycle where a Notion database serves as the Jira board / task tracker.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. Plan &    │ ──▶ │ 2. Build     │ ──▶ │ 3. Push &    │ ──▶ │ 4. Review &  │
│ Add to Notion│     │ Item-by-Item │     │ Open PR      │     │ Merge Gate   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Prerequisites & Environment

1. **Notion MCP Server**: Connected via `composio`.
2. **Python Virtual Environment**: Located at `/home/vscode/venvs/python`. Activate via `source /home/vscode/venvs/python/bin/activate` for backend tasks, testing, and linting.
3. **Git & GitHub Workflow**:
   - **Current State: Local Mode** (Git remote / `gh` CLI not yet configured). Development happens on local git branches with local verification and manual review/merge to `main`.
   - **Remote Mode (Future)**: Once the user configures the git remote and `gh` auth, the agent pushes branches to remote and opens Pull Requests.

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
| `PR Link` | `url` | optional PR URL (populated once git remote is configured) |
| `Description` | `rich_text` | scope and acceptance criteria |
| `Due date` | `date` | ISO date |
| `Assignee` | `people` | user ID |

> Note: Transition `Status` to `In Review` when code implementation and verification are complete. In Local Mode, record the branch name in `Branch`. Once remote is configured, also populate `PR Link`.


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

## Phase 2: Building Item-by-Item (Builder Role)

Execute **one ticket at a time**. Never bundle multiple tickets into a single branch.

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

2. **Create a Dedicated Branch**:
   - Ensure the working tree is clean and branched from `main`:
     ```bash
     git checkout main
     # If remote is configured: git pull origin main
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

---

## Phase 3: Commit & Review Handoff

1. **Craft Semantic Commits**:
   - Stage files explicitly and commit locally:
     ```bash
     git add <modified-files>
     git commit -m "feat(<scope>): <clear description> (refs TASK-<id>)"
     ```

2. **Handoff for Review (Local Mode vs. Remote Mode)**:

   ### Mode A: Local Mode (Default / Current)
   *Git remote / `gh` CLI is not configured yet. Everything stays local.*
   - **Update Notion Ticket**:
     ```json
     {
       "row_id": "<row page UUID>",
       "properties": [
         { "name": "Status", "type": "status", "value": "In Review" },
         { "name": "Branch", "type": "rich_text", "value": "feat/task-<id>-<short-description>" }
       ]
     }
     ```
   - **Report to User**:
     - Present the summary of changes and `git diff --stat`.
     - Confirm all acceptance criteria are verified.
     - Provide the exact command for the user to review/run locally (e.g. `uvicorn src.main:app --reload` or `npm run dev`).
     - Request user verification.

   ### Mode B: Remote PR Mode (When Git Remote is Configured)
   *Once git remote and `gh` auth are set up:*
   - Push branch to remote:
     ```bash
     git push -u origin feat/task-<id>-<short-description>
     ```
   - Open Pull Request via `gh`:
     ```bash
     gh pr create \
       --title "feat: <title> [TASK-<id>]" \
       --body "$(cat <<'EOF'
     ## Notion Task
     - Task: [TASK-<id>] <Task Title>

     ## Summary of Changes
     - Detailed bullet 1
     - Detailed bullet 2

     ## Acceptance Criteria Verification
     - [x] Verified criterion 1
     - [x] Verified criterion 2

     ## Testing & Verification
     - [x] Checks passed
     EOF
     )"
     ```
   - **Update Notion Ticket**:
     ```json
     {
       "row_id": "<row page UUID>",
       "properties": [
         { "name": "Status", "type": "status", "value": "In Review" },
         { "name": "Branch", "type": "rich_text", "value": "feat/task-<id>-<short-description>" },
         { "name": "PR Link", "type": "url", "value": "https://github.com/owner/repo/pull/12" }
       ]
     }
     ```

---

## Phase 4: Review Gate & Iteration (Wait for User)

> [!IMPORTANT]
> **Do NOT merge automatically without user approval.**
> The user is the reviewer. Stop execution after moving the ticket to `In Review` and presenting the handoff.

1. **If Changes Requested by User**:
   - Set Notion ticket `Status` to `In progress`.
   - Checkout the task branch if not already on it (`git checkout feat/task-<id>-<short-description>`).
   - Implement requested revisions and re-run verification checks.
   - Commit additions: `git commit -m "fix(<scope>): address review feedback (refs TASK-<id>)"`.
   - If in Remote Mode, push to remote (`git push origin feat/...`).
   - Set Notion ticket `Status` back to `In Review` and notify user.

2. **On User Approval**:
   - **In Local Mode**:
     - Merge local feature branch into `main`:
       ```bash
       git checkout main
       git merge --no-ff feat/task-<id>-<short-description> -m "feat(<scope>): merge task-<id> into main"
       ```
   - **In Remote Mode**:
     - User merges the PR on GitHub.
     - Checkout `main` and pull updates: `git checkout main && git pull origin main`.
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
   - Proceed to the next `Not started` item (re-query the pinned database first).

---

## Reference Setup & Troubleshooting

- **Notion connection**: The `notion` toolkit must be connected via `composio` (see `COMPOSIO_MANAGE_CONNECTIONS`). Verify with `COMPOSIO_SEARCH_TOOLS` that a connection is `ACTIVE` before any `NOTION_*` call.
- **`object_not_found` / 403 on the pinned database**: The database is not shared with the Notion integration/bot. Share `Tasks Tracker` with the connected bot, then retry.
- **Wrong property names in filters/writes**: Always check `NOTION_FETCH_DATABASE` output first — property names are case-sensitive and option labels must match exactly (e.g. `Not started`, not `To Do`).
