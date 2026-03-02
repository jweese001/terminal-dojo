# Terminal Dojo

React 19 + TypeScript + Vite daily-practice game for terminal commands.

## Commands
```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # tsc -b && vite build → dist/
npm run preview  # Preview prod build
```

## Stack
- React 19 (functional components, hooks only)
- TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`)
- Vite 6, plain CSS with design tokens in `src/styles/global.css`
- localStorage for all persistence — no backend

## Key Files
- `src/types.ts` — all shared types + constants (`Challenge`, `Progress`, `CATEGORIES`, `XP_VALUES`)
- `src/data/challenges.ts` — all challenge content (add challenges here)
- `src/components/` — Dashboard, Challenge, Terminal, Results
- `src/hooks/` — `useGame.ts` (session state), `useProgress.ts` (XP/streak/localStorage)
- `src/tokenize.ts` — shell syntax tokenizer for syntax highlighting

## Conventions
- All types in `src/types.ts`, not scattered across files
- Difficulty: `1`=Easy/10xp · `2`=Medium/20xp · `3`=Hard/30xp
- Challenge types: `'type-it'` | `'fix-it'` | `'predict'` | `'fill-blank'`
- `answer[]` holds all acceptable strings (trimmed, case-sensitive)
- CSS variables only — no hardcoded hex colors
