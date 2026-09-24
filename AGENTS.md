<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Agent Workflow

Use the specialized Codex agents configured for this workspace.

## Explorer

Use the Explorer when beginning a new task or whenever the project is not yet understood. The Explorer must investigate the relevant code, dependencies, documentation, and current behavior before substantial changes are made.

After exploration, explain to the user:

- what was found
- how the relevant part of the project currently works
- which files are relevant
- the recommended implementation approach
- important risks, tradeoffs, or decisions

Then ask the user for permission to start building. Do not start the Builder, edit files, or make implementation changes until the user explicitly approves.

## Builder

Use the Builder only after the exploration findings have been explained and the user has explicitly approved building. The Builder is responsible for implementing the solution, following the existing project structure, keeping changes focused, and running appropriate checks when possible.

## Reviewer

After substantial implementation work, use the Reviewer to independently inspect the result. The Reviewer should look for bugs, missing requirements, unclear logic, edge cases, and unnecessary complexity; it should identify issues rather than simply agreeing with the Builder.

## Documenter

Once the implementation has been reviewed, use the Documenter to update existing project documentation. Documentation should cover what changed, the relevant structure, how to run or use it, important dependencies, and material decisions or limitations without creating unnecessary duplicates.

## Workflow

For substantial tasks, work in this order:

1. Explore.
2. Explain findings and the recommended approach.
3. Ask the user for permission to build.
4. Wait for explicit approval.
5. Build.
6. Review.
7. Document.

Exploration does not authorize implementation. Do not ask one agent to perform all four roles when the work can reasonably be delegated.
