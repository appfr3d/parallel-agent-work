# Three-way agent workshop: Claude Code and Portless

This workshop has three parts: name and message Claude Code sessions, delegate work across a Git worktree and review it, then run two worktree previews in parallel with Portless. You give requests to the main Claude session; it coordinates the other sessions.

Claude Code cross-session messaging works between sessions that are already running. It passes text such as tasks, findings, and status; it does not start Claude processes or transfer code between worktrees. Same-machine messages use local IPC, not Anthropic’s servers. See the [Claude Code cross-session messaging guide](https://code.claude.com/docs/en/cross-session-messaging) for details.

## 1. Name the sessions and ask one to brief the other

Start two Claude Code sessions in this project directory, each in its own terminal, by running `claude`. Other sessions find and message a session by its name, so give each one a name with `/rename` inside the session:

```text
/rename main-agent
```

```text
/rename review-agent
```

Run the first command in one session and the second in the other. In later steps you will name sessions at startup with `claude --name <name>` instead.

From the main session, run `/list-agents` and make sure `review-agent` appears.

Cross-session messaging requires Claude Code 2.1.224 or later on macOS/Linux/WSL 2, or 2.1.234 or later on Windows. The `@`-mention picker requires 2.1.232 or later.

Give this prompt to **main-agent**:

```text
Ask @review-agent to inspect the whole project and send you a concise overview:
the app structure, important entry points, how data flows, the API, and the
main npm scripts. Ask it not to edit any files. Once it replies, summarize
the overview to me.
```

The main session sends the request, receives the review session’s message, and reports back to you. This is the basic communication loop: you talk to main; main talks to review.

## 2. Delegate implementation in a worktree, then review it

In a new terminal in this project directory, start a Claude Code session in its own worktree:

```sh
claude --worktree implementation-agent --name implementation-agent
```

Claude Code creates the worktree at `.claude/worktrees/implementation-agent` on a new branch and starts the session there. Worktrees do not share `node_modules`, so install dependencies from inside the new session:

```text
! npm install
```

Keep the main and review sessions open. This step introduces worktrees: the implementation agent has its own checkout, so its edits stay apart from the main checkout while it works.

### See what the agents built

The project includes a UI test that opens the front page and saves a full-page screenshot to `screenshots/front-page.png` in the worktree it runs from. Install the Playwright browser once per machine (from any checkout):

```sh
npx playwright install chromium
```

Then `npm run test:ui` starts `npm run dev` and tests `http://localhost:5173`; it fails rather than reuse a dev server that is already running, so it never screenshots another worktree's app. To test a preview that is already running, such as a Portless URL, set `BASE_URL`:

```sh
BASE_URL=https://example.bg.localhost npm run test:ui
```

Open the screenshot to see what an agent changed without opening its dev server yourself.

Give this prompt to **main-agent**:

```text
Ask @implementation-agent to add a category filter to the article list in its
worktree. Ask it to keep the change focused and, when finished, send you the
worktree path, a short summary, whether npm run build succeeded, and the
absolute path to screenshots/front-page.png after running npm run test:ui.

When it reports back, ask @review-agent to review the implementation at that
worktree path. Ask for critical correctness issues only. If it finds one,
relay the specific issue to @implementation-agent and ask it to fix it. When
the fix is ready, ask @review-agent for one focused re-review, then report the
outcome to me with the screenshot path so I can see the result.
```

Keep this loop short: one implementation pass and, only if needed, one repair and re-review. Review findings and code changes still travel separately; the agents use their shared Git repository and worktree paths to inspect the code.

## 3. Run two agent previews at once with Portless

Now ask: **what happens if both agents want to run the app from their own worktrees?** The standard `npm run dev` starts Vite on port `5173` and the API on `3001`. In a second worktree, the API competes for `3001`; even if Vite selects another port, its proxy still points at `localhost:3001`. The two previews can collide or show data from the wrong worktree.

Portless solves this by routing each worktree to its own named `.localhost` URL and assigning its app a free local port. This project’s `npm run dev:portless` runs the UI and API together behind that route. It uses local HTTPS through the Portless proxy, which needs `sudo` to bind port `443` and may ask to trust its local certificate the first time.

Use Node.js 20.19 or newer. Worktrees do not include uncommitted files, so make sure the branch they start from includes this project’s Portless and UI test setup.

Before any agent starts a Portless preview, set up Portless once. In a separate terminal, install it globally and start the local HTTPS proxy, then leave that terminal running:

```sh
npm install -g portless
sudo portless proxy start --https
```

Keep `implementation-agent` open in its worktree. In a new terminal in this project directory, start one more Claude Code session in its own worktree:

```sh
claude --worktree parallel-agent --name parallel-agent
```

Then install dependencies from inside that session:

```text
! npm install
```

Both implementation sessions and the review session should now be visible to main via `/list-agents`. Cross-session messaging does not launch sessions, so this is the last manual session setup. **Only give the next prompt to main-agent; it starts both pieces of work in parallel by messaging the two existing workers.**

```text
Send these two tasks now; don't wait for one to finish before sending the other.

@implementation-agent: In your worktree, create an editorial, image-led
front-page treatment. Keep your changes on your branch. When it is ready,
start `npm run dev:portless` in the background, run
`BASE_URL=<your preview URL> npm run test:ui`, and send me the preview URL
and the absolute path to screenshots/front-page.png.

@parallel-agent: In your worktree, create a contrasting compact-headlines
front-page treatment. Keep your changes on your branch. When it is ready,
start `npm run dev:portless` in the background, run
`BASE_URL=<your preview URL> npm run test:ui`, and send me the preview URL
and the absolute path to screenshots/front-page.png.

When both URLs arrive, ask @review-agent to open both previews, compare the
two treatments, and verify each URL loads its assigned design and responds
from `/api/health` and `/api/articles`. Have it report to you. If it finds a
critical issue, send that issue to the relevant worker, wait for the fix and
new URL, then request one focused re-review. Summarize the comparison and
review to me, including both screenshot paths. Do not merge the branches.
```

Open the two screenshots to compare the treatments yourself. The reviewer can also inspect both running versions side by side while each agent keeps working in its own worktree. Without Portless, this project’s fixed API port and Vite proxy make that parallel full-stack preview unreliable without manual port and proxy changes.

| Mode | Command | Preview | Parallel worktrees |
| --- | --- | --- | --- |
| Standard | `npm run dev` | `http://localhost:5173` | Fixed API port; proxy targets `localhost:3001` |
| Portless | `npm run dev:portless` | Branch-specific `https://…bg.localhost` | Separate named previews and assigned ports |
