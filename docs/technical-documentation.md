# Technical Documentation — Portfolio Assignment 3

## Structure

- `index.html` contains semantic sections, controls, project cards, and status regions.
- `css/styles.css` contains the visual system, responsive layout, focus states, and reduced-motion rules.
- `js/script.js` initializes each feature in its own function and shares a small storage wrapper for persistent settings.
- `assets/images/elham-profile.png` is the supplied portrait resized from 626 × 626 to 320 × 320. Its file size fell from 442,859 to 196,036 bytes (about 56%).

## Project discovery

The project list uses the existing HTML cards and reads each card's category, search text, title, and ISO date once. `updateProjects()` reorders the cards when the sort selection changes and updates visibility, the count, and the empty state as the user filters or searches. Reset restores the default options and returns focus to the search field.

## GitHub API integration
The visitor supplies a GitHub username. The page validates its format and requests up to six public repositories from https://api.github.com/users/{username}/repos?sort=updated&per_page=6&type=owner. Repository names and descriptions are inserted as text nodes, not interpolated HTML. Links open in a separate tab with noopener noreferrer. The interface handles invalid names, unknown users, rate limits, empty repositories, general HTTP errors, network failures, and a ten-second timeout. GitHub's unauthenticated API can impose rate limits, so the user can retry later. No token or private repository data is used.

## State and privacy

The selected theme, visitor name, and simulated sign-in flag use `localStorage`. Storage operations are wrapped so the site remains usable if storage is blocked. The simulated sign-in is only a UI state; it does not authenticate a user or contact a server. The elapsed-time counter starts when the current page is loaded and is not saved. The contact form validates fields in the browser and explicitly reports that it does not send the message.

## Accessibility and performance choices

Controls have labels, visible keyboard focus, status messages, and pressed or expanded states where applicable. The skip link focuses the main content. Escape closes the mobile menu and returns focus to its toggle. Contact validation marks the invalid field and focuses it. Reveal animations respect reduced motion and keep focused content visible.

The portrait has explicit dimensions to reserve layout space. Google Fonts is linked directly in the document so it can load alongside the local stylesheet, with fallback fonts available. The elapsed-time display pauses its updates while the tab is hidden and recalculates from its start time when the tab becomes visible. Starting a new GitHub lookup cancels the previous request and prevents stale results from updating the interface. The page uses plain HTML, CSS, and JavaScript.

## Verification performed

On 2026-11-20, I tested the final website in a browser and checked the following:
- Local files, images, and navigation links loaded correctly.
- Project filtering, searching, sorting, the empty state, and reset worked correctly.
- The theme, visitor name, and simulated sign-in state were saved after refreshing the page.
- The mobile menu opened and closed correctly.
- GitHub repository loading and error messages worked correctly.
- Contact form validation rejected invalid entries and accepted valid ones.
- The visit timer worked correctly.
- The layout displayed correctly on different screen sizes.
- I used Lighthouse to check the website’s performance.
The tested features worked as expected.



