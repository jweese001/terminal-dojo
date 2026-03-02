import { useState, useCallback } from 'react';
import type { GameSession, Challenge } from '../types';
import { XP_VALUES } from '../types';

export function useGame() {
	const [session, setSession] = useState<GameSession | null>(null);

	const currentChallenge: Challenge | null =
		session !== null && session.currentIndex < session.challenges.length
			? session.challenges[session.currentIndex]
			: null;

	const startSession = useCallback((challenges: Challenge[]) => {
		setSession({
			currentIndex: 0,
			challenges,
			answers: [],
		});
	}, []);

	const submitAnswer = useCallback((answer: string): boolean => {
		if (!session || !session.challenges[session.currentIndex]) return false;

		const trimmed = answer.trim();
		const challenge = session.challenges[session.currentIndex];
		const correct = trimmed ? checkAnswer(trimmed, challenge) : false;

		setSession((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				answers: [
					...prev.answers,
					{ challengeId: challenge.id, correct, userAnswer: trimmed },
				],
			};
		});

		return correct;
	}, [session]);

	const nextChallenge = useCallback(() => {
		setSession((prev) => {
			if (!prev) return prev;
			return { ...prev, currentIndex: prev.currentIndex + 1 };
		});
	}, []);

	const endSession = useCallback(() => {
		setSession(null);
	}, []);

	const getResults = useCallback((): { correct: number; total: number; xpEarned: number } => {
		if (!session) {
			return { correct: 0, total: 0, xpEarned: 0 };
		}
		const correctAnswers = session.answers.filter((a) => a.correct);
		const correct = correctAnswers.length;
		const total = session.answers.length;

		let xpEarned = 0;
		for (const ans of correctAnswers) {
			const challenge = session.challenges.find((c) => c.id === ans.challengeId);
			if (challenge) {
				xpEarned += XP_VALUES[challenge.difficulty];
			}
		}

		return { correct, total, xpEarned };
	}, [session]);

	return { session, currentChallenge, startSession, submitAnswer, nextChallenge, endSession, getResults };
}

function checkAnswer(trimmed: string, challenge: Challenge): boolean {
	if (!trimmed) return false;

	if (challenge.type === 'predict') {
		// case-insensitive
		const lower = trimmed.toLowerCase();
		return challenge.answer.some((a) => a.trim().toLowerCase() === lower);
	}

	// type-it, fix-it, fill-blank: exact match (trimmed)
	return challenge.answer.some((a) => a.trim() === trimmed);
}
