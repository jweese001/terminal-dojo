# Terminal Dojo

Daily practice game for learning terminal commands and modern CLI tools.

## Quick Start

```bash
cd ~/Documents/linux-toys
npm install
npm run dev
```

Then open http://localhost:5173

## How to Play

- **Daily Quest** -- 5 random challenges from all categories. Complete one per day to build your streak.
- **Category Practice** -- Pick a specific topic to drill.
- **Challenge Types**:
  - *Type It* -- Write the command that solves the scenario.
  - *Fix It* -- A command has a bug. Find and fix it.
  - *Predict* -- What will this command output?
  - *Fill the Blank* -- Complete the missing piece of a pipe chain.
- Use the Hint button if stuck (no penalty).
- XP per correct answer: Easy 10, Medium 20, Hard 30.
- Streak bonuses apply for consecutive daily completions.
- Level up every 500 XP.

## Categories

| Category           | What It Teaches                          | Example Commands                  |
|--------------------|------------------------------------------|-----------------------------------|
| File Ops           | Navigate, find, move, and manage files   | `find`, `mv`, `cp`, `ln`, `chmod`|
| Text Processing    | Filter, transform, and analyze text      | `grep`, `sed`, `awk`, `sort`, `cut`|
| Modern Tools       | Faster replacements you can brew install | `rg`, `fd`, `jq`, `fzf`          |
| Pipes & Redirection| Chain commands, redirect streams         | `|`, `>`, `>>`, `<`, `tee`, `xargs`|
| Git Tricks         | Beyond add-commit-push                   | `git stash`, `git rebase -i`, `git bisect`|
| System & Process   | Processes, env, disk, and admin          | `ps`, `lsof`, `htop`, `env`, `df`|

## Adding Custom Challenges

Challenges live in `src/data/challenges.ts`. Each challenge follows this shape:

```typescript
{
  id: 'file-ops-12',
  category: 'file-ops',
  difficulty: 2,              // 1 = Easy, 2 = Medium, 3 = Hard
  type: 'type-it',            // 'type-it' | 'fix-it' | 'predict' | 'fill-blank'
  title: 'Find Large Files',
  scenario: 'Find all files larger than 100MB in the current directory tree.',
  setup: '$ ls -lh\ntotal 2.4G',
  answer: [
    'find . -size +100M',
    'find . -type f -size +100M',
  ],
  hint: 'The find command has a -size flag. + means greater than.',
  explanation: 'find . -size +100M recursively searches for files exceeding 100MB. The + prefix means "greater than"; use - for "less than".',
}
```

Add your entry to the array in that file. The `answer` array holds all acceptable answers (trimmed, case-sensitive). Multiple valid forms of the same command can be listed.

## Tech Stack

- React 19 + TypeScript
- Vite
- CSS with w33s3 design tokens (light chrome, dark terminal)
- localStorage for progress persistence
- No external dependencies beyond React

## Tips for Learning

- Spend 10-15 minutes per day. Consistency beats cramming.
- After each challenge, try the command in your actual terminal.
- Use `man <command>` or `tldr <command>` to go deeper.
- The Modern Tools category teaches replacements you can install via `brew install <tool>`.
- Pay attention to the explanation after each answer -- it often covers flags and edge cases the challenge itself does not.
