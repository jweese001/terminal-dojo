import { useState, useCallback } from 'react';
import { useProgress } from './hooks/useProgress';
import { useGame } from './hooks/useGame';
import { challenges } from './data/challenges';
import { Dashboard } from './components/Dashboard';
import { Challenge } from './components/Challenge';
import { Results } from './components/Results';
import type { Category } from './types';
import { shuffle } from './utils';
import { CHALLENGES_PER_SESSION, XP_VALUES } from './types';

type Page = 'home' | 'challenge' | 'results';

function pickChallenges(
	pool: typeof challenges,
	completed: string[],
	count: number,
): typeof challenges {
	const unseen = pool.filter((c) => !completed.includes(c.id));
	const source = unseen.length >= count ? unseen : pool;
	return shuffle(source).slice(0, count);
}

export default function App() {
	const [page, setPage] = useState<Page>('home');
	const progress = useProgress();
	const game = useGame();

	const handleStartDailyQuest = useCallback(() => {
		const picked = pickChallenges(challenges, progress.progress.completedChallenges, CHALLENGES_PER_SESSION);
		if (picked.length === 0) return;
		game.startSession(picked);
		setPage('challenge');
	}, [progress.progress.completedChallenges, game]);

	const handleSelectCategory = useCallback((category: Category) => {
		const pool = challenges.filter((c) => c.category === category);
		const picked = pickChallenges(pool, progress.progress.completedChallenges, CHALLENGES_PER_SESSION);
		if (picked.length === 0) return;
		game.startSession(picked);
		setPage('challenge');
	}, [progress.progress.completedChallenges, game]);

	const handleSubmit = useCallback((answer: string): boolean => {
		const isCorrect = game.submitAnswer(answer);
		if (isCorrect && game.currentChallenge) {
			const xp = XP_VALUES[game.currentChallenge.difficulty];
			progress.addXP(xp);
			progress.markCompleted(game.currentChallenge.id, game.currentChallenge.category);
		}
		return isCorrect;
	}, [game, progress]);

	const handleNext = useCallback(() => {
		const nextIndex = game.session!.currentIndex + 1;
		const total = game.session!.challenges.length;
		game.nextChallenge();
		if (nextIndex >= total) {
			progress.updateStreak();
			setPage('results');
		}
	}, [game, progress]);

	const handleHome = useCallback(() => {
		game.endSession();
		setPage('home');
	}, [game]);

	const handleReset = useCallback(() => {
		if (window.confirm('Reset all progress? This cannot be undone.')) {
			progress.resetProgress();
		}
	}, [progress]);

	switch (page) {
		case 'home':
			return (
				<Dashboard
					progress={progress.progress}
					onStartDailyQuest={handleStartDailyQuest}
					onSelectCategory={handleSelectCategory}
					onReset={handleReset}
				/>
			);
		case 'challenge':
			if (!game.session || !game.currentChallenge) {
				setPage('home');
				return null;
			}
			return (
				<Challenge
					session={game.session}
					currentChallenge={game.currentChallenge}
					onSubmit={handleSubmit}
					onNext={handleNext}
					onQuit={handleHome}
				/>
			);
		case 'results':
			return (
				<Results
					results={game.getResults()}
					onHome={handleHome}
				/>
			);
	}
}
