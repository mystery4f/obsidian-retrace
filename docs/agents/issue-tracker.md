# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `mystery4f/obsidian-retrace`. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue edit <parent> --add-sub-issue <child>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/mystery4f/obsidian-retrace/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`. Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's native issue dependencies. `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/mystery4f/obsidian-retrace/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database id (`gh api repos/mystery4f/obsidian-retrace/issues/<n> --jq .id`). A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/mystery4f/obsidian-retrace/issues/<n> --jq .issue_dependencies_summary.blocked_by`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it with `gh issue view <number>`.
