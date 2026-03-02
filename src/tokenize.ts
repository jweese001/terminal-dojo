export type TokenType = 'command' | 'flag' | 'string' | 'operator' | 'variable' | 'text' | 'ws';

export interface Token {
	type: TokenType;
	value: string;
}

const STOP = new Set([' ', '\t', '|', ';', '&', '>', '<', '"', "'", '$', ')']);

/**
 * Lightweight shell-command tokenizer for syntax highlighting.
 *
 * Recognises: commands (first word per pipe segment), flags (-x, --long),
 * quoted strings, pipe/redirect operators, $variables, and plain text.
 * Not a full POSIX parser — optimised for the commands in this game.
 */
export function tokenize(input: string): Token[] {
	const tokens: Token[] = [];
	let i = 0;
	let expectCmd = true;

	while (i < input.length) {
		const ch = input[i];

		// ── Whitespace ──────────────────────────────────────────────
		if (ch === ' ' || ch === '\t') {
			let ws = '';
			while (i < input.length && (input[i] === ' ' || input[i] === '\t')) {
				ws += input[i++];
			}
			tokens.push({ type: 'ws', value: ws });
			continue;
		}

		// ── Quoted strings ──────────────────────────────────────────
		if (ch === '"' || ch === "'") {
			const quote = ch;
			let str = ch;
			i++;
			while (i < input.length && input[i] !== quote) {
				// Handle backslash escapes inside double quotes
				if (input[i] === '\\' && quote === '"') {
					str += input[i++];
					if (i < input.length) str += input[i++];
				} else {
					str += input[i++];
				}
			}
			if (i < input.length) str += input[i++]; // closing quote
			tokens.push({ type: 'string', value: str });
			expectCmd = false;
			continue;
		}

		// ── Pipe / logical operators (reset command expectation) ───
		if (ch === '|') {
			let op = ch;
			i++;
			if (i < input.length && input[i] === '|') op += input[i++]; // ||
			tokens.push({ type: 'operator', value: op });
			expectCmd = true;
			continue;
		}

		if (ch === ';') {
			tokens.push({ type: 'operator', value: ';' });
			i++;
			expectCmd = true;
			continue;
		}

		if (ch === '&') {
			let op = '&';
			i++;
			if (i < input.length && input[i] === '&') {
				op += input[i++]; // &&
				expectCmd = true;
			}
			tokens.push({ type: 'operator', value: op });
			continue;
		}

		// ── FD redirect: 2>, 2>>, 2>&1 ─────────────────────────────
		if (ch >= '0' && ch <= '9' && i + 1 < input.length && (input[i + 1] === '>' || input[i + 1] === '<')) {
			let op = ch;
			i++;
			op += input[i++]; // > or <
			if (i < input.length && input[i] === '>') op += input[i++]; // >>
			if (i < input.length && input[i] === '&') {
				op += input[i++]; // >&
				while (i < input.length && input[i] >= '0' && input[i] <= '9') op += input[i++];
			}
			tokens.push({ type: 'operator', value: op });
			continue;
		}

		// ── Process substitution: <( or >( ──────────────────────────
		if ((ch === '<' || ch === '>') && i + 1 < input.length && input[i + 1] === '(') {
			tokens.push({ type: 'operator', value: ch + '(' });
			i += 2;
			expectCmd = true;
			continue;
		}

		// ── Plain redirect: >, >>, < ────────────────────────────────
		if (ch === '>' || ch === '<') {
			let op = ch;
			i++;
			if (ch === '>' && i < input.length && input[i] === '>') op += input[i++]; // >>
			tokens.push({ type: 'operator', value: op });
			continue;
		}

		// ── Close paren (process substitution / subshell) ───────────
		if (ch === ')') {
			tokens.push({ type: 'operator', value: ')' });
			i++;
			continue;
		}

		// ── Variables: $VAR, ${VAR}, $(...) ─────────────────────────
		if (ch === '$') {
			let v = '$';
			i++;
			if (i < input.length) {
				if (input[i] === '{') {
					v += input[i++];
					while (i < input.length && input[i] !== '}') v += input[i++];
					if (i < input.length) v += input[i++]; // closing }
				} else if (input[i] === '(') {
					// Emit $( as variable; contents parse as a subcommand
					tokens.push({ type: 'variable', value: '$(' });
					i++;
					expectCmd = true;
					continue;
				} else {
					while (i < input.length && /[\w]/.test(input[i])) v += input[i++];
				}
			}
			tokens.push({ type: 'variable', value: v });
			expectCmd = false;
			continue;
		}

		// ── Word (command, flag, or plain text) ─────────────────────
		let word = '';
		while (i < input.length && !STOP.has(input[i])) {
			word += input[i++];
		}

		if (!word) {
			// Safety valve: emit unexpected character as text and advance
			tokens.push({ type: 'text', value: input[i] });
			i++;
			continue;
		}

		if (word.startsWith('-')) {
			tokens.push({ type: 'flag', value: word });
		} else if (expectCmd) {
			tokens.push({ type: 'command', value: word });
			expectCmd = false;
		} else {
			tokens.push({ type: 'text', value: word });
		}
	}

	return tokens;
}
