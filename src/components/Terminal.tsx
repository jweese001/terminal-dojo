import { useEffect, useRef, useMemo, useCallback } from 'react';
import { tokenize } from '../tokenize';

interface TerminalProps {
	value: string;
	onChange: (v: string) => void;
	onSubmit: () => void;
	disabled?: boolean;
	setup?: string;
	prompt?: string;
}

export function Terminal({ value, onChange, onSubmit, disabled = false, setup, prompt = '$' }: TerminalProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const highlightRef = useRef<HTMLDivElement>(null);

	const tokens = useMemo(() => tokenize(value), [value]);

	const syncScroll = useCallback(() => {
		if (inputRef.current && highlightRef.current) {
			highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
		}
	}, []);

	useEffect(() => {
		if (!disabled) inputRef.current?.focus();
	}, [disabled]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Sync highlight scroll whenever value or cursor moves
	useEffect(syncScroll);

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter' && !disabled) {
			e.preventDefault();
			onSubmit();
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		onChange(e.target.value);
		// Defer scroll sync to after browser has updated scrollLeft
		requestAnimationFrame(syncScroll);
	}

	return (
		<div className="terminal">
			{setup && <div className="terminal-setup">{setup}</div>}
			<div className="terminal-input">
				<span className="terminal-prompt">{prompt}</span>
				<div className="terminal-input-wrapper">
					<div
						ref={highlightRef}
						className={`terminal-highlight${disabled ? ' dimmed' : ''}`}
						aria-hidden="true"
					>
						{tokens.map((t, i) => (
							<span key={i} className={`tok-${t.type}`}>{t.value}</span>
						))}
					</div>
					<input
						ref={inputRef}
						className="terminal-field"
						type="text"
						value={value}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onSelect={syncScroll}
						onScroll={syncScroll}
						disabled={disabled}
						placeholder={disabled ? '' : 'Type your answer\u2026'}
						spellCheck={false}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
					/>
				</div>
			</div>
		</div>
	);
}
