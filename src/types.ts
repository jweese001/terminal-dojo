export type ChallengeType = 'type-it' | 'fix-it' | 'predict' | 'fill-blank';
export type Difficulty = 1 | 2 | 3;
export type Category = 'file-ops' | 'text-processing' | 'modern-tools' | 'pipes' | 'git' | 'system';

export interface Challenge {
  id: string;
  category: Category;
  difficulty: Difficulty;
  type: ChallengeType;
  title: string;
  scenario: string;
  setup?: string;
  answer: string[];
  hint: string;
  hint2: string;
  explanation: string;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Progress {
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string;
  completedChallenges: string[];
  categoryProgress: Record<Category, number>;
}

export interface GameSession {
  currentIndex: number;
  challenges: Challenge[];
  answers: { challengeId: string; correct: boolean; userAnswer: string }[];
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'file-ops', name: 'File Ops', description: 'Navigate, find, move, and manage files', icon: '/', color: '#c4c67a' },
  { id: 'text-processing', name: 'Text Processing', description: 'grep, sed, awk, sort, and friends', icon: '|', color: '#9dd9d9' },
  { id: 'modern-tools', name: 'Modern Tools', description: 'ripgrep, fd, jq, fzf — the new guard', icon: '*', color: '#c77dcd' },
  { id: 'pipes', name: 'Pipes & Redirection', description: 'Chain commands, redirect streams', icon: '>', color: '#00BFFF' },
  { id: 'git', name: 'Git Tricks', description: 'Beyond add-commit-push', icon: '#', color: '#FFD700' },
  { id: 'system', name: 'System & Process', description: 'Processes, env, disk, and admin', icon: '$', color: '#FF8C42' },
];

export const XP_PER_LEVEL = 500;
export const XP_VALUES: Record<Difficulty, number> = { 1: 10, 2: 20, 3: 30 };
export const CHALLENGES_PER_SESSION = 5;
