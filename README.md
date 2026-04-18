# StageCue

Presenter slide notes for [Even Realities G2](https://www.evenrealities.com/) smart glasses. See your speaker notes on the glasses while presenting — control slides with the R1 ring or temple tap.

Built with [even-toolkit](https://www.npmjs.com/package/even-toolkit).

## Features

- **Import PPTX** — upload a PowerPoint file and slide titles + speaker notes are extracted automatically (client-side, no server)
- **Create decks manually** — add presentations with per-slide titles and notes
- **Present on glasses** — speaker notes are paginated and displayed on the G2's 576×288 micro-LED display
- **Slide navigation** — swipe the R1 ring to move between note pages and slides; long notes auto-paginate
- **Phone companion** — the phone shows a presenter view with slide progress, prev/next controls, and slide thumbnails

## Glass controls

| Gesture | Action |
|---------|--------|
| Swipe down | Next note page, or next slide at end of notes |
| Swipe up | Previous note page, or previous slide at start |
| Tap | Select presentation from home list |
| Double-tap (presenting) | Exit back to presentation list |
| Double-tap (home) | Exit app |

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Test with Simulator

```bash
npx @evenrealities/evenhub-simulator@latest http://localhost:5173
```

## Build for Even Hub

```bash
npm run build
npx @evenrealities/evenhub-cli pack app.json dist
```

Upload the generated `.ehpk` file to the Even Hub.

## Project structure

```
src/
├── contexts/
│   └── PresentationContext.tsx   # State management for decks, slides, presenting
├── glass/
│   ├── AppGlasses.tsx            # Wires React state to the glass display
│   ├── screens/
│   │   ├── home.ts               # Glass home screen — presentation list
│   │   └── presenter.ts          # Glass presenter screen — paginated notes
│   ├── selectors.ts              # Glass screen router
│   ├── shared.ts                 # Snapshot and action types
│   └── splash.ts                 # App splash screen
├── lib/
│   └── pptx-parser.ts            # Client-side PPTX parser (JSZip)
├── screens/
│   ├── PresentationList.tsx       # Browse and import decks
│   ├── PresentationDetail.tsx     # Manage slides in a deck
│   ├── SlideEditor.tsx            # Edit slide title and notes
│   ├── PresenterView.tsx          # Phone presenter companion
│   └── Settings.tsx               # Export, clear data, about
└── layouts/
    └── shell.tsx                  # App shell with drawer navigation
```
