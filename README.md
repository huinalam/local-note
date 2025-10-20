# local-note

`local-note` is a browser-based memo pad that stores everything in IndexedDB, so your notes stay on your device and work offline. The project builds on Next.js and React to deliver a lightweight experience focused on quick note taking.

## Getting started

- Install dependencies with `pnpm install`.
- Start the dev server with `pnpm dev`.
- Open `http://localhost:3000` in your browser to use the memo pad.

## Tech stack

- Next.js 15 with the App Router.
- React 19 for the UI.
- Tailwind CSS for styling.
- IndexedDB (via native browser APIs) for local persistence.

## Project goals

- Provide a fast, offline-friendly memo app that feels native to the web.
- Keep data on the device by default—no external storage required.
- Offer simple organization features that stay out of the way.

## Deployment

Deploy with your preferred Next.js hosting provider (for example, Vercel or Netlify). Build the production bundle with `pnpm build`, then follow the platform-specific instructions.
