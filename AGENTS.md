<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Agent Workflow

Use the specialized Codex agents configured for this workspace.

## Explorer

Use the Explorer when beginning a new task or whenever the project is not yet understood. The Explorer investigates the relevant code, dependencies, documentation, and current behavior before changes are made.

After exploration, explain findings and the recommended approach when appropriate, but builds may proceed without waiting for approval.

## Builder

The Builder is authorized to proceed with implementation directly without waiting for explicit user approval. The Builder is responsible for implementing the solution, following the existing project structure, keeping changes focused, and running appropriate checks when possible.

## Reviewer

After substantial implementation work, use the Reviewer to independently inspect the result. The Reviewer should look for bugs, missing requirements, unclear logic, edge cases, and unnecessary complexity; it should identify issues rather than simply agreeing with the Builder.

## Documenter

Once the implementation has been reviewed, use the Documenter to update existing project documentation. Documentation should cover what changed, the relevant structure, how to run or use it, important dependencies, and material decisions or limitations without creating unnecessary duplicates.

## Workflow

For substantial tasks, work in this order:

1. Explore and plan as needed.
2. Build (all builds permitted without waiting for manual approval).
3. Review.
4. Document.
