# Layered Strategies

A guided brand strategy workshop that runs in the browser. A facilitator works through it with a client, section by section, and it turns their answers into a finished, printable brand brief.

**Try it:** [layered-discovery.vercel.app](https://layered-discovery.vercel.app)

---

## What it does

- **Guides the conversation.** Twelve sections take you from the business basics to visual direction. Every question is written in plain language, so clients answer real questions instead of branding jargon.
- **Coaches the facilitator.** Most questions have a **Tip** with a way to ask it out loud and an example of a strong answer. The tips draw on established strategy thinking: Simon Sinek's Golden Circle and 5 Whys, Marty Neumeier's Onlyness, brand archetypes, Jennifer Aaker's brand personality dimensions, Jobs to be Done, and the Nielsen Norman Group's work on voice and tone.
- **Writes the brief.** When you're done, it lays your answers out as an A4 brand brief that you can download as a PDF or copy as Markdown.
- **Works on any screen.** It runs on desktop, tablet and phone. On a phone the sections become a deck of cards you swipe through.

## The twelve sections

| Phase | Sections | About |
|---|---|---|
| **Frame** | Setup, Business | Who is in the room and what the business needs |
| **Diagnose** | Audience, Landscape, Perception | Who you serve, who you compete with, and how you're seen today |
| **Decide** | Purpose, Positioning, Character, Voice, Brand Idea | What the brand stands for and how it behaves |
| **Express** | Visual, Scope | How it should look, and what the project will deliver |

Each section shows a time estimate. A full session takes about 3½–4 hours, and many teams split it across two sittings.

## How to use it

1. **Open the app** and start with **Setup**. A progress ring on each section card shows how many of its questions are answered.
2. **Work through the sections.** Follow the order or jump to any section. Open a question's **Tip** whenever you need help asking it.
3. **Generate the brief.** Click **Generate Brief** at any time to see the document so far.
4. **Download or share.** Download the brief as a PDF or copy it as Markdown.

Want to see a finished brief first? Open **Sample brief** from the Preview controls (in the **⋯** menu on a phone).

## Your data

- **Nothing leaves your browser.** There is no account, server or database. Your answers stay on your device.
- **Autosave.** Your work is saved in this browser automatically. When you come back, the app offers to restore your last session.
- **Save and Load.** Click **Save** to download the session as a `.gsx` file, and **Load** to open one later or on another computer. Autosave only lives in one browser, so save a `.gsx` file for anything you want to keep.

## Run it locally

You need [Node.js](https://nodejs.org) 18.18 or later.

```bash
git clone https://github.com/leganri/layered-discovery.git
cd layered-discovery
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To try it on a phone or tablet on the same Wi‑Fi network, start the server with `npx next dev -H 0.0.0.0` and open `http://<your-computer's-ip>:3000` on the device.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with live reload |
| `npm run build` | Creates a production build |
| `npm start` | Serves the production build |

## Built with

- [Next.js](https://nextjs.org) 15 (App Router) and [React](https://react.dev) 19
- [Motion](https://motion.dev) for animation
- [Geist](https://vercel.com/font) and [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) for type
- Hosted on [Vercel](https://vercel.com)

## Project structure

```
src/app/
├── layout.jsx            Page shell, fonts, metadata
├── page.jsx              Loads the app (client-side only)
└── discovery/
    ├── DiscoveryApp.jsx  Main app: navigation, autosave, save/load
    ├── schema.js         The sections, questions and session data model
    ├── sections/         One component per workshop section
    ├── content/          Tips, answer options and the sample brief
    ├── brief/            The generated brief document
    ├── logic/            Completion checks and the Markdown export
    └── ui/               Shared components: home grid, controls, icons
```

## License

© Regan Li, Layered Studio. All rights reserved. The source is published for reference only. You may not copy, modify, redistribute or use it commercially without written permission.
