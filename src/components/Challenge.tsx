import { useState, useEffect, useMemo } from 'react';
import type { GameSession, Challenge as ChallengeData } from '../types';
import { CATEGORIES, XP_VALUES } from '../types';
import { Terminal } from './Terminal';

interface ChallengeProps {
	session: GameSession;
	currentChallenge: ChallengeData;
	onSubmit: (answer: string) => boolean;
	onNext: () => void;
	onQuit: () => void;
}

function getPromptForType(type: ChallengeData['type']): string {
	return type === 'predict' ? '>' : '$';
}

function getTypeLabel(type: ChallengeData['type']): string {
	switch (type) {
		case 'type-it': return 'Type It';
		case 'fix-it': return 'Fix It';
		case 'predict': return 'Predict';
		case 'fill-blank': return 'Fill in the Blank';
	}
}

const BASE = import.meta.env.BASE_URL;
const SUCCESS_IMAGES = [`${BASE}images/success.webp`, `${BASE}images/success02.webp`, `${BASE}images/success03.webp`];
const FAIL_IMAGES = [`${BASE}images/fail.webp`, `${BASE}images/fail02.webp`, `${BASE}images/fail03.webp`];

export function Challenge({ session, currentChallenge, onSubmit, onNext, onQuit }: ChallengeProps) {
	const [input, setInput] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [correct, setCorrect] = useState(false);
	const [hintLevel, setHintLevel] = useState(0);
	const [flashClass, setFlashClass] = useState('');

	const category = CATEGORIES.find((c) => c.id === currentChallenge.category);
	const counter = `${session.currentIndex + 1} of ${session.challenges.length}`;

	const rewardImages = useMemo(() => ({
		success: SUCCESS_IMAGES[Math.floor(Math.random() * SUCCESS_IMAGES.length)],
		fail: FAIL_IMAGES[Math.floor(Math.random() * FAIL_IMAGES.length)],
	}), [currentChallenge.id]);

	useEffect(() => {
		setInput('');
		setSubmitted(false);
		setCorrect(false);
		setHintLevel(0);
		setFlashClass('');
	}, [currentChallenge.id]);

	function handleSubmit() {
		if (!input.trim() || submitted) return;
		const isCorrect = onSubmit(input.trim());
		setCorrect(isCorrect);
		setSubmitted(true);
		setFlashClass(isCorrect ? 'flash-correct' : 'flash-incorrect');
		setTimeout(() => setFlashClass(''), 800);
	}

	function handleNext() {
		onNext();
	}

	return (
		<div className="container fade-in">
			<div className="challenge-header">
				<div className="challenge-header-left">
					<button className="btn-back" onClick={onQuit} aria-label="Quit">
						←
					</button>
					{category && (
						<span
							className="badge"
							style={{ background: category.color + '22', color: category.color }}
						>
							{category.icon} {category.name}
						</span>
					)}
					<div className="difficulty">
						{[1, 2, 3].map((d) => (
							<span
								key={d}
								className={`dot${d <= currentChallenge.difficulty ? ' filled' : ''}`}
							/>
						))}
					</div>
				</div>
				<span className="challenge-counter">{counter}</span>
			</div>

			<div className="challenge-type">{getTypeLabel(currentChallenge.type)}</div>
			<h2 className="challenge-title">{currentChallenge.title}</h2>
			<p className="challenge-scenario">{currentChallenge.scenario}</p>

			<div style={{ marginTop: '1rem' }} className={flashClass}>
				<Terminal
					value={input}
					onChange={setInput}
					onSubmit={handleSubmit}
					disabled={submitted}
					setup={currentChallenge.setup}
					prompt={getPromptForType(currentChallenge.type)}
				/>
			</div>
			<div className="challenge-actions">
				{!submitted && (
					<>
						{hintLevel < 2 && (
							<button
								className="btn btn-outline btn-sm"
								onClick={() => setHintLevel((l) => l + 1)}
							>
								{hintLevel === 0 ? 'Hint' : 'Another Hint'}
							</button>
						)}
						<button
							className="btn btn-primary"
							onClick={handleSubmit}
							disabled={!input.trim()}
						>
							Submit
						</button>
					</>
				)}
				{submitted && (
					<div style={{ display: 'flex', gap: '0.625rem' }}>
						{!correct && (
							<button
								className="btn btn-outline"
								onClick={() => {
									setSubmitted(false);
									setCorrect(false);
									setFlashClass('');
								}}
							>
								Try Again
							</button>
						)}
						<button className="btn btn-primary" onClick={handleNext}>
							{session.currentIndex + 1 < session.challenges.length ? 'Next' : 'See Results'}
						</button>
					</div>
				)}
			</div>

			{hintLevel >= 1 && (
				<div className="hint">{currentChallenge.hint}</div>
			)}
			{hintLevel >= 2 && (
				<div className="hint hint-2">{currentChallenge.hint2}</div>
			)}

			{submitted && (
				<div className={`explanation ${correct ? 'explanation-correct' : 'explanation-incorrect'}`}>
					<div className="explanation-reward">
						<img
							src={correct ? rewardImages.success : rewardImages.fail}
							alt={correct ? 'Success!' : 'Not quite'}
							className="explanation-reward-img"
						/>
						{correct && (
							<div className="explanation-badge">
								<svg className="celebration-check" viewBox="0 0 52 52">
									<circle className="celebration-circle" cx="26" cy="26" r="25" fill="none" />
									<path className="celebration-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
								</svg>
								<div className="celebration-xp">+{XP_VALUES[currentChallenge.difficulty]} XP</div>
							</div>
						)}
					</div>
					<div className="explanation-text">
						<div className="explanation-verdict">
							{correct ? 'Correct!' : 'Not quite.'}
						</div>
						<div>{currentChallenge.explanation}</div>
						{!correct && (
							<div className="explanation-answer-row">
								Answer: <code className="explanation-answer">{currentChallenge.answer[0]}</code>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
