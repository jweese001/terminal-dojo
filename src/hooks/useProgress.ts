import { useState, useCallback } from 'react';
import type { Progress, Category } from '../types';
import { XP_PER_LEVEL } from '../types';

const STORAGE_KEY = 'terminal-dojo-progress';

function defaultProgress(): Progress {
	return {
		xp: 0,
		level: 1,
		streak: 0,
		lastPlayedDate: '',
		completedChallenges: [],
		categoryProgress: {
			'file-ops': 0,
			'text-processing': 0,
			'modern-tools': 0,
			'pipes': 0,
			'git': 0,
			'system': 0,
		},
	};
}

function loadProgress(): Progress {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Progress;
			return parsed;
		}
	} catch {
		// corrupted data — fall through to defaults
	}
	return defaultProgress();
}

function saveProgress(progress: Progress): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function todayStr(): string {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

function yesterdayStr(): string {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

export function useProgress() {
	const [progress, setProgress] = useState<Progress>(loadProgress);

	const addXP = useCallback((amount: number) => {
		setProgress((prev) => {
			let { xp, level } = prev;
			xp += amount;
			while (xp >= XP_PER_LEVEL) {
				xp -= XP_PER_LEVEL;
				level++;
			}
			const next = { ...prev, xp, level };
			saveProgress(next);
			return next;
		});
	}, []);

	const markCompleted = useCallback((challengeId: string, category: Category) => {
		setProgress((prev) => {
			const alreadyDone = prev.completedChallenges.includes(challengeId);
			const completedChallenges = alreadyDone
				? prev.completedChallenges
				: [...prev.completedChallenges, challengeId];
			const categoryProgress = {
				...prev.categoryProgress,
				[category]: prev.categoryProgress[category] + (alreadyDone ? 0 : 1),
			};
			const next = { ...prev, completedChallenges, categoryProgress };
			saveProgress(next);
			return next;
		});
	}, []);

	const updateStreak = useCallback(() => {
		setProgress((prev) => {
			const today = todayStr();
			if (prev.lastPlayedDate === today) {
				return prev; // already played today, no change
			}
			const yesterday = yesterdayStr();
			const streak = prev.lastPlayedDate === yesterday ? prev.streak + 1 : 1;
			const next = { ...prev, streak, lastPlayedDate: today };
			saveProgress(next);
			return next;
		});
	}, []);

	const resetProgress = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
		const fresh = defaultProgress();
		setProgress(fresh);
	}, []);

	return { progress, addXP, markCompleted, updateStreak, resetProgress };
}
