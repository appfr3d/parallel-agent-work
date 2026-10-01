# Three-way agent workshop: Claude Code and Portless

This workshop has three parts: name and message Claude Code sessions, delegate work across a Git worktree and review it, then run two worktree previews in parallel with Portless. You give requests to the main Claude session; it coordinates the other sessions.

Claude Code cross-session messaging works between sessions that are already running. It passes text such as tasks, findings, and status; it does not start Claude processes or transfer code between worktrees. Same-machine messages use local IPC, not Anthropic’s servers. See the [Claude Code cross-session messaging guide](https://code.claude.com/docs/en/cross-session-messaging) for details.

## 1. Name the sessions and ask one to brief the other

Start two Claude Code sessions in this project directory. In the first, run `/rename main-agent`; in the second, run `/rename review-agent`. From the main session, run `/list-agents` and make sure `review-agent` appears.

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

Create a linked worktree and start a new Claude Code session from it. For example:

```sh
git worktree add ../parallel-agent-implementation -b workshop/implementation
cd ../parallel-agent-implementation
npm install
claude
```

In that session, run `/rename implementation-agent`. Keep the main and review sessions open. This step introduces worktrees: the implementation agent has its own checkout, so its edits stay apart from the main checkout while it works.

Give this prompt to **main-agent**:

```text
Ask @implementation-agent to add a category filter to the article list in its
worktree. Ask it to keep the change focused and, when finished, send you the
worktree path, a short summary, and whether npm run build succeeded. Do not
start a dev server yet.

When it reports back, ask @review-agent to review the implementation at that
worktree path. Ask for critical correctness issues only. If it finds one,
relay the specific issue to @implementation-agent and ask it to fix it. When
the fix is ready, ask @review-agent for one focused re-review, then report the
outcome to me.
```

Keep this loop short: one implementation pass and, only if needed, one repair and re-review. Review findings and code changes still travel separately; the agents use their shared Git repository and worktree paths to inspect the code.

## 3. Run two agent previews at once with Portless

Now ask: **what happens if both agents want to run the app from their own worktrees?** The standard `npm run dev` starts Vite on port `5173` and the API on `3001`. In a second worktree, the API competes for `3001`; even if Vite selects another port, its proxy still points at `localhost:3001`. The two previews can collide or show data from the wrong worktree.

Portless solves this by routing each worktree to its own named `.localhost` URL and assigning its app a free local port. This project’s `npm run dev:portless` runs the UI and API together behind that route. It uses local HTTPS by default; first startup may set up certificate trust and request permission to bind port `443`.

Use Node.js 20.19 or newer and run `npm install` in each worktree. Base the worktrees on a commit that includes this project’s Portless setup; Git worktrees do not include uncommitted files. Keep `implementation-agent` open in its worktree. Create a second linked worktree and start one more Claude Code session:

```sh
git worktree add ../parallel-agent-variant -b workshop/variant
cd ../parallel-agent-variant
npm install
claude
```

In the new session, run `/rename parallel-agent`. Both implementation sessions and the review session should now be visible to main via `/list-agents`. Cross-session messaging does not launch sessions, so this is the last manual session setup. **Only give the next prompt to main-agent; it starts both pieces of work in parallel by messaging the two existing workers.**

```text
Send these two tasks now; don't wait for one to finish before sending the other.

@implementation-agent: In your worktree, create an editorial, image-led
front-page treatment. Keep your changes on your branch. When it is ready,
start `npm run dev:portless` in the background and send me the preview URL.

@parallel-agent: In your worktree, create a contrasting compact-headlines
front-page treatment. Keep your changes on your branch. When it is ready,
start `npm run dev:portless` in the background and send me the preview URL.

When both URLs arrive, ask @review-agent to open both previews, compare the
two treatments, and verify each URL loads its assigned design and responds
from `/api/health` and `/api/articles`. Have it report to you. If it finds a
critical issue, send that issue to the relevant worker, wait for the fix and
new URL, then request one focused re-review. Summarize the comparison and
review to me. Do not merge the branches.
```

The reviewer can now inspect both running versions side by side while each agent keeps working in its own worktree. Without Portless, this project’s fixed API port and Vite proxy make that parallel full-stack preview unreliable without manual port and proxy changes.

| Mode | Command | Preview | Parallel worktrees |
| --- | --- | --- | --- |
| Standard | `npm run dev` | `http://localhost:5173` | Fixed API port; proxy targets `localhost:3001` |
| Portless | `npm run dev:portless` | Branch-specific `https://…bg.localhost` | Separate named previews and assigned ports |
