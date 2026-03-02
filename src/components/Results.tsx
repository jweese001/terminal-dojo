interface ResultsProps {
	results: { correct: number; total: number; xpEarned: number };
	onHome: () => void;
}

function getMessage(correct: number, total: number): string {
	const ratio = correct / total;
	if (ratio === 1) return 'Flawless.';
	if (ratio >= 0.8) return 'Solid work.';
	if (ratio >= 0.6) return 'Getting there.';
	if (ratio >= 0.4) return 'Keep practicing.';
	return 'Rough session. Try again tomorrow.';
}

export function Results({ results, onHome }: ResultsProps) {
	return (
		<div className="container fade-in">
			<div className="card results">
				<h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
					Session Complete
				</h2>
				<div className="results-score">
					{results.correct}/{results.total}
				</div>
				<div className="results-label">correct</div>
				<div className="results-xp">+{results.xpEarned} XP</div>
				<div className="results-message">
					{getMessage(results.correct, results.total)}
				</div>
				<div style={{ marginTop: '2rem' }}>
					<button className="btn btn-primary btn-lg" onClick={onHome}>
						Back to Home
					</button>
				</div>
			</div>
		</div>
	);
}
