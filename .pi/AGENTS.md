# Terminal Dojo — Project Context

A daily-practice web game for learning terminal commands and CLI tools. Built with React 19 + TypeScript + Vite.

## Stack

- **Framework**: React 19 (functional components, hooks)
- **Language**: TypeScript 5.7 (strict mode — `noUnusedLocals`, `noUnusedParameters` enforced)
- **Bundler**: Vite 6
- **Styling**: Plain CSS via `src/styles/global.css` using w33s3 design tokens
- **State**: React hooks + `localStorage` (no external state library)
- **No backend** — fully client-side

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # tsc -b && vite build  (output: dist/)
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── App.tsx                  # Root component + page routing (home | challenge | results)
├── main.tsx                 # Entry point
├── types.ts                 # All shared types + constants (Challenge, Progress, CATEGORIES, XP_VALUES…)
├── utils.ts                 # shuffle<T>()
├── tokenize.ts              # Shell syntax tokenizer for highlighting
├── components/
│   ├── Dashboard.tsx        # Home page — streak, XP, category picker
│   ├── Challenge.tsx        # Challenge UI (type-it, fix-it, predict, fill-blank)
│   ├── Terminal.tsx         # Syntax-highlighted terminal input
│   └── Results.tsx          # Session summary screen
├── data/
│   └── challenges.ts        # All challenge objects (add new challenges here)
├── hooks/
│   ├── useGame.ts           # Active session state
│   └── useProgress.ts       # XP / streak / localStorage persistence
└── styles/
    └── global.css           # Design tokens + all styles
```

## Key Conventions

- All types live in `src/types.ts` — don't scatter interfaces across files
- `challenges.ts` is the single source of truth for content; each entry must satisfy the `Challenge` interface
- Difficulty: `1` = Easy (10 XP), `2` = Medium (20 XP), `3` = Hard (30 XP)
- Challenge types: `'type-it'` | `'fix-it'` | `'predict'` | `'fill-blank'`
- `answer` is an array of all acceptable strings (trimmed, case-sensitive)
- TypeScript strict mode is on — no implicit `any`, no unused vars/params
- CSS uses design tokens defined in `:root` in `global.css` — use variables, not hardcoded colors

## Adding Challenges

Add entries to the array in `src/data/challenges.ts`. Required fields: `id`, `category`, `difficulty`, `type`, `title`, `scenario`, `answer`, `hint`, `hint2`, `explanation`. Optional: `setup`.
