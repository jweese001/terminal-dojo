# Terminal Dojo -- Project Documentation

A browser-based daily practice game for learning Linux terminal commands and modern CLI tools. Players complete short challenges across six categories, earn XP, level up, and maintain streaks. No backend -- all progress lives in `localStorage`.

**Live site:** https://jweese001.github.io/terminal-dojo/

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Directory Layout](#directory-layout)
- [Data Model](#data-model)
- [Game Mechanics](#game-mechanics)
- [Styling](#styling)
- [Authoring Challenges](#authoring-challenges)
- [Build and Deployment](#build-and-deployment)
- [Static Assets](#static-assets)
- [Conventions](#conventions)

---

## Quick Start

```bash
npm install
npm run dev      # Dev server on http://localhost:5173
npm run build    # Type-check + production build to dist/
npm run preview  # Preview the production build locally
```

Requires Node 20+.

---

## Architecture

```
index.html
  └─ src/main.tsx           Entry point: mounts React, sets --bg-image CSS variable
       └─ App.tsx            Root component, page routing (home / challenge / results)
            ├─ Dashboard     Category grid, stats, daily quest button
            ├─ Challenge     Question display, terminal input, hints, explanation panel
            ├─ Terminal      Syntax-highlighted shell input with tokenizer overlay
            └─ Results       End-of-session score summary
```

**Routing:** Hash-based, managed by `App.tsx` state -- no router library. Three pages: `home`, `challenge` (with category + index), and `results`.

**State management:**

| Hook           | File                     | Purpose                                           |
|----------------|--------------------------|---------------------------------------------------|
| `useProgress`  | `src/hooks/useProgress.ts` | XP, level, streak, per-category completion. Persisted to `localStorage`. |
| `useGame`      | `src/hooks/useGame.ts`     | Current session: challenge list, current index, submitted answers. Ephemeral. |

**Answer checking** (`useGame.ts`): Trims whitespace. For `predict` type challenges, comparison is case-insensitive. All other types require an exact match against one of the strings in the challenge's `answer[]` array.

**Dependencies:** React 19, React DOM 19. That's it. No router, no state library, no CSS framework.

---

## Directory Layout

```
linux-toys/
├── index.html                  HTML shell (mounts #root, sets body bg)
├── vite.config.ts              Vite config (base: /terminal-dojo/, react plugin)
├── tsconfig.json               TypeScript strict mode, ES2022, bundler resolution
├── package.json                Scripts: dev, build, preview
├── CLAUDE.md                   AI assistant directives and conventions
├── DOCS.md                     This file
├── README.md                   Player-facing overview and usage guide
├── public/
│   ├── favicon.png
│   └── images/                 Static images (hero, dojo background, reward art)
│       ├── hero.webp           Dashboard hero banner
│       ├── dojo.webp           Full-page background scene
│       ├── dojoblur.webp       Blurred variant (unused currently)
│       ├── success.webp        Correct answer reward images (3 variants)
│       ├── success02.webp
│       ├── success03.webp
│       ├── fail.webp           Incorrect answer images (3 variants)
│       ├── fail02.webp
│       ├── fail03.webp
│       └── inprogress.jpg      Category card in-progress image
├── src/
│   ├── main.tsx                Entry point
│   ├── App.tsx                 Root component, page routing, game orchestration
│   ├── types.ts                All shared types and constants
│   ├── tokenize.ts             Shell syntax tokenizer for terminal highlighting
│   ├── utils.ts                Fisher-Yates shuffle
│   ├── components/
│   │   ├── Dashboard.tsx       Home page: hero, stats, category grid
│   │   ├── Challenge.tsx       Challenge view: question, input, hints, explanation
│   │   ├── Terminal.tsx        Syntax-highlighted textarea with token overlay
│   │   └── Results.tsx         End-of-session score screen
│   ├── hooks/
│   │   ├── useGame.ts          Session state: challenge list, answers, navigation
│   │   └── useProgress.ts     Persistent state: XP, level, streak, completions
│   ├── data/
│   │   └── challenges.ts       All 70 challenge definitions
│   └── styles/
│       └── global.css          Full stylesheet with CSS custom property design tokens
└── .github/
    └── workflows/
        └── deploy.yml          GitHub Actions: build + deploy to GitHub Pages
```

---

## Data Model

### Types (`src/types.ts`)

```typescript
type ChallengeType = 'type-it' | 'fix-it' | 'predict' | 'fill-blank';
type Difficulty    = 1 | 2 | 3;
type Category      = 'file-ops' | 'text-processing' | 'modern-tools'
                   | 'pipes' | 'git' | 'system';

interface Challenge {
  id: string;             // e.g. 'file-ops-03'
  category: Category;
  difficulty: Difficulty;  // 1=Easy, 2=Medium, 3=Hard
  type: ChallengeType;
  title: string;
  scenario: string;        // The question/prompt
  setup?: string;          // Optional terminal context shown above the prompt
  answer: string[];        // All acceptable answers (trimmed, case-sensitive*)
  hint: string;            // First hint (free)
  hint2: string;           // Second hint (free)
  explanation: string;     // Shown after answering
}

// * predict type uses case-insensitive matching
```

### Progress (localStorage)

```typescript
interface Progress {
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string;              // ISO date string
  completedChallenges: string[];       // Challenge IDs
  categoryProgress: Record<Category, number>;  // Completed count per category
}
```

Stored under the key `'terminal-dojo-progress'`. Level threshold: 500 XP per level. XP values: Easy=10, Medium=20, Hard=30.

### Game Session (ephemeral)

```typescript
interface GameSession {
  currentIndex: number;
  challenges: Challenge[];  // 5 challenges, shuffled, preferring unseen
  answers: { challengeId: string; correct: boolean; userAnswer: string }[];
}
```

---

## Game Mechanics

**Daily Quest:** Picks 5 challenges (the `CHALLENGES_PER_SESSION` constant) from all categories, shuffled, preferring challenges the player hasn't completed yet.

**Category Practice:** Same as Daily Quest but filtered to one category.

**Hints:** Two levels per challenge, accessed via a button. No XP penalty.

**Streaks:** Tracked by `lastPlayedDate`. If the player completes a session on consecutive calendar days, the streak increments. A missed day resets it to 1.

**Explanation panel:** After answering (correct or incorrect), shows a two-column layout: explanation text on the left, a themed reward/fail image on the right. Images are randomly selected from the success/fail variants.

---

## Styling

All styles live in `src/styles/global.css`. The theme is called **Seaborne Dark** -- a dark maritime palette with gold and blue accents.

### Design Tokens (CSS Custom Properties)

| Variable               | Value                     | Purpose                     |
|------------------------|---------------------------|-----------------------------|
| `--bg`                 | `#001122`                 | Page background             |
| `--card-bg`            | `#1a1a1a`                 | Card backgrounds            |
| `--card-border`        | `#334455`                 | Card border color           |
| `--text`               | `#ffffff`                 | Primary text                |
| `--text-secondary`     | `#cccccc`                 | Secondary text              |
| `--text-muted`         | `#888888`                 | Muted/disabled text         |
| `--gold`               | `#FFD700`                 | Primary accent (buttons, prompts) |
| `--gold-hover`         | `#FFA500`                 | Gold hover state            |
| `--blue`               | `#00BFFF`                 | Secondary accent            |
| `--blue-hover`         | `#0080FF`                 | Blue hover state            |
| `--correct`            | `#00FF7F`                 | Correct answer feedback     |
| `--incorrect`          | `#FF6B6B`                 | Incorrect answer feedback   |
| `--term-bg`            | `#0a0e14`                 | Terminal background          |
| `--term-text`          | `#e4e4e4`                 | Terminal text               |
| `--term-prompt`        | `#FFD700`                 | Terminal prompt character    |
| `--radius-sm/md/lg`    | `0.25/0.375/0.5rem`       | Border radii               |
| `--shadow-sm/md/lg`    | Various                   | Elevation shadows           |
| `--mono`               | SF Mono, Fira Code, etc.  | Monospace font stack        |
| `--sans`               | System sans-serif stack   | UI font stack               |

**Convention:** No hardcoded hex colors in component styles. All colors reference CSS variables.

### Background Scene

The dojo background image (`dojo.webp`) is rendered via `body::before` as a fixed pseudo-element at `opacity: 0.2`. The `--bg-image` CSS variable is set dynamically in `src/main.tsx` to resolve the correct path with Vite's `BASE_URL`.

### Syntax Highlighting Tokens

The terminal uses a custom tokenizer (`src/tokenize.ts`) that classifies shell input into token types: `command`, `flag`, `string`, `pipe`, `redirect`, `variable`, `subshell`, `comment`. Each token type maps to a CSS class (`.token-command`, `.token-flag`, etc.) with colors defined in `global.css`.

### Responsive Design

Single breakpoint at `600px`. Below that: single-column category grid, reduced padding, smaller typography.

---

## Authoring Challenges

Challenges are defined in `src/data/challenges.ts` as an array of `Challenge` objects. Currently 70 challenges across 6 categories.

### Adding a Challenge

1. Open `src/data/challenges.ts`.
2. Add a new object to the `challenges` array:

```typescript
{
  id: 'file-ops-13',                  // category-slug + sequential number
  category: 'file-ops',
  difficulty: 2,                       // 1=Easy, 2=Medium, 3=Hard
  type: 'type-it',                     // 'type-it' | 'fix-it' | 'predict' | 'fill-blank'
  title: 'Find Empty Directories',
  scenario: 'List all empty directories under the current path.',
  setup: '$ tree\n.',                  // Optional terminal context (omit if not needed)
  answer: [
    'find . -type d -empty',
    'find . -empty -type d',
  ],
  hint: 'The find command has a -empty test.',
  hint2: 'Combine -type d with -empty to match only directories.',
  explanation: 'find . -type d -empty lists directories with no entries...',
}
```

3. The `answer` array holds all acceptable answers. Matching is exact (trimmed) for all types except `predict`, which is case-insensitive.
4. The `id` must be unique. Use the pattern `{category}-{number}`.
5. Both `hint` and `hint2` are required.

### Challenge Types

| Type         | Player Action                              | Answer Matching       |
|--------------|--------------------------------------------|-----------------------|
| `type-it`    | Write the full command from scratch        | Exact, case-sensitive |
| `fix-it`     | Correct a broken command shown in `setup`  | Exact, case-sensitive |
| `predict`    | Predict the output of a given command      | Case-insensitive      |
| `fill-blank` | Fill in the missing part of a pipeline     | Exact, case-sensitive |

---

## Build and Deployment

### Local Development

```bash
npm run dev       # Vite dev server with HMR at http://localhost:5173
```

### Production Build

```bash
npm run build     # Runs tsc -b (type-check) then vite build to dist/
npm run preview   # Serve dist/ locally for verification
```

### GitHub Pages Deployment

Automated via `.github/workflows/deploy.yml`:

1. Triggers on push to `main` or manual dispatch.
2. Checks out code, installs dependencies (`npm ci`), builds (`npm run build`).
3. Uploads `dist/` as a Pages artifact.
4. Deploys via `actions/deploy-pages@v4` (artifact-based, no `gh-pages` branch).

The Vite base path is set to `/terminal-dojo/` in `vite.config.ts` to match the GitHub Pages URL.

---

## Static Assets

All static files live in `public/` and are copied to `dist/` at build time.

| File                  | Purpose                                      |
|-----------------------|----------------------------------------------|
| `favicon.png`         | Browser tab icon                             |
| `images/hero.webp`    | Dashboard hero banner                        |
| `images/dojo.webp`    | Full-page background scene (rendered at 20% opacity) |
| `images/dojoblur.webp`| Blurred background variant (reserved)        |
| `images/success.webp` | Correct answer reward image (variant 1)      |
| `images/success02.webp`| Correct answer reward image (variant 2)     |
| `images/success03.webp`| Correct answer reward image (variant 3)     |
| `images/fail.webp`    | Incorrect answer image (variant 1)           |
| `images/fail02.webp`  | Incorrect answer image (variant 2)           |
| `images/fail03.webp`  | Incorrect answer image (variant 3)           |
| `images/inprogress.jpg`| Category card in-progress badge image       |

---

## Conventions

- **Types:** All shared types and constants live in `src/types.ts`. Not scattered.
- **Styling:** CSS custom properties only. No hardcoded hex colors in rules.
- **Components:** Functional components with hooks. No class components.
- **State:** `useProgress` for persistent data, `useGame` for session data. No global state library.
- **Strict TypeScript:** `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all enabled.
- **No external runtime deps:** Only React and React DOM. Everything else is dev tooling (Vite, TypeScript, plugin-react).
- **Challenge IDs:** Pattern is `{category-slug}-{sequential-number}`, e.g. `git-07`.
