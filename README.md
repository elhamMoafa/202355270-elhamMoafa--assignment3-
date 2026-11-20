# Elham Moafa — Portfolio Assignment 3

A responsive personal portfolio extended from Assignment 2 with live GitHub repository loading, combined project filtering/search/sorting, persistent visitor preferences, a simulated sign-in state, a visit timer, and accessible form feedback.

## Student

- **Name:** Elham Moafa
- **Student ID:** 202355270
- **Suggested repository name:** `202355270-elhammoafa-assignment3`

## Run locally

1. Download or clone this repository.
2. From the project folder, run `python -m http.server 8000` if you have Python installed, then open `http://localhost:8000`. You can also use VS Code Live Server or open `index.html` directly to preview the portfolio.
3. In the **Live from GitHub** section, enter a GitHub username and select **Load repositories**. The page requests public repositories from GitHub's unauthenticated REST API.
4. Use the project controls to filter, search, and sort the portfolio cards. Theme and visitor preferences are stored in this browser only.

No package installation, API key, build step, or backend is required. Internet access is required for GitHub repository loading; the rest of the portfolio works without it.

## Features

- Responsive page with mobile navigation, skip link, keyboard focus styling, and reduced-motion support.
- Project category filtering, text search, result feedback, empty state, reset control, and newest/oldest/title sorting.
- GitHub public repositories API integration with input checks, timeout, loading state, empty results, and readable error messages.
- Light/dark theme, visitor name, and simulated sign-in preference saved locally with storage-failure handling.
- Per-visit elapsed-time counter.
- Contact form validation with a clear notice that it does not send messages to a server.

## Documentation

- [Technical documentation](docs/technical-documentation.md) explains the implementation, API behavior, and completed checks.
- `docs/ai-usage-report.md` records AI assistance. Review it, complete the evidence submission, and sign the declaration only if every statement is accurate and you understand the submitted code.

## AI evidence and repository setup

The course requires complete, unedited AI conversations and intermediate artifacts in a separate AI Evidence ZIP. Export the full conversation from the AI service and add it under `conversations/`; preserve the pre-edit generated artifacts under `artifacts/`. Name the evidence ZIP `202355270-elhammoafa-assignment3-ai-evidence.zip` and submit it separately through Blackboard. Do not commit the evidence ZIP or conversation logs to this repository. This source package does not fabricate conversation exports or claim the evidence ZIP is complete.

Create a public GitHub repository with the suggested name, then push these files. Credit AI-assisted commits, for example:

```text
Add Assignment 3 portfolio features

Assisted-by: ChatGPT (OpenAI)
```
