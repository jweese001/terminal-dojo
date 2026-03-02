import type { Progress, Category } from '../types';
import { CATEGORIES, XP_PER_LEVEL } from '../types';

interface DashboardProps {
	progress: Progress;
	onStartDailyQuest: () => void;
	onSelectCategory: (cat: Category) => void;
	onReset: () => void;
}

export function Dashboard({ progress, onStartDailyQuest, onSelectCategory, onReset }: DashboardProps) {
	const xpInLevel = progress.xp % XP_PER_LEVEL;
	const xpPercent = (xpInLevel / XP_PER_LEVEL) * 100;

	return (
		<div className="container fade-in">
			<div className="hero-image-wrap">
				<img className="hero-image" src={`${import.meta.env.BASE_URL}images/hero.webp`} alt="Terminal Dojo hero banner" />
				<div className="hero-overlay">
					<div className="hero-copy">
						<h1>Terminal Dojo</h1>
						<div className="gradient-rule" />
						<p className="subhead">Sharpen your shell-fu one command at a time—where every typo is a training montage.</p>
					</div>
					<span className="level-badge">Level {progress.level}</span>
				</div>
			</div>

			<div className="stats-row">
				<div className="stat">
					<div className="stat-value">{progress.streak}</div>
					<div className="stat-label">Streak</div>
				</div>
				<div className="stat">
					<div className="stat-value">{progress.xp}</div>
					<div className="stat-label">Total XP</div>
				</div>
				<div className="stat">
					<div className="stat-value">{progress.completedChallenges.length}</div>
					<div className="stat-label">Completed</div>
				</div>
			</div>

			<div className="xp-bar">
				<div className="xp-bar-label">
					<span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
					<span>Level {progress.level + 1}</span>
				</div>
				<div className="progress-bar">
					<div className="progress-fill" style={{ width: `${xpPercent}%` }} />
				</div>
			</div>

			<button
				className="btn btn-primary daily-quest-btn"
				onClick={onStartDailyQuest}
			>
				Daily Quest
			</button>

			<div className="category-grid">
				{CATEGORIES.map((cat) => {
					const completed = progress.categoryProgress[cat.id] || 0;
					const hasBadge = completed > 0;
					const mastered = completed >= 10;
					const rewardSrc = mastered ? `${import.meta.env.BASE_URL}images/success.webp` : `${import.meta.env.BASE_URL}images/inprogress.jpg`;
					const rewardAlt = mastered ? `${cat.name} mastery reward unlocked` : `${cat.name} in progress`;
					return (
						<div
							key={cat.id}
							className={`category-card${hasBadge ? ' has-reward' : ''}${mastered ? ' mastered' : ''}`}
							style={{ borderLeftColor: cat.color } as React.CSSProperties}
							onClick={() => onSelectCategory(cat.id)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onSelectCategory(cat.id);
								}
							}}
						>
							{hasBadge && (
								<div className="reward-showcase">
									<img src={rewardSrc} alt={rewardAlt} className="reward-image" />
									<div className="reward-sheen" />
								</div>
							)}
							<div className="category-card-body">
								<div className="category-card-header">
									<span className="category-card-icon" style={{ color: cat.color }}>{cat.icon}</span>
									<span className="category-card-name">{cat.name}</span>
								</div>
								<div className="category-card-desc">{cat.description}</div>
								<div className="category-card-footer">
									<span className="category-card-progress">{completed} completed</span>
									{hasBadge && (
										<span className={`reward-tag${mastered ? ' reward-tag-gold' : ''}`}>
											{mastered ? 'Cleared' : 'In Progress'}
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className="footer">
				<button
					className="btn btn-outline btn-sm"
					onClick={onReset}
				>
					Reset Progress
				</button>
			</div>
		</div>
	);
}
