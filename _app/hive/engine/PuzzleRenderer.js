/**
 * PuzzleRenderer.js — The Hive Puzzle Type Renderer & Validator
 *
 * Renders puzzle UI based on type, validates answers, shows feedback.
 *
 * Public API:
 *   PuzzleRenderer.render(puzzle, container, onSubmit)
 *     — renders puzzle into container, calls onSubmit(isCorrect, codeDigit) on answer
 *   PuzzleRenderer.renderCodeEntry(digits, container, onSubmit)
 *     — renders final code entry boxes, calls onSubmit(isCorrect)
 */

const PuzzleRenderer = (() => {

    // -------------------------------------------------------------------------
    // CSS (injected once)
    // -------------------------------------------------------------------------

    let _stylesInjected = false;

    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = `
            .hv-puzzle { max-width: 640px; margin: 0 auto; padding: 20px; }
            .hv-puzzle-title {
                font-family: 'Courier New', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.12em;
                color: #cc0000;
                text-transform: uppercase;
                margin-bottom: 8px;
            }
            .hv-puzzle-prompt {
                font-family: 'Courier New', monospace;
                font-size: 0.95rem;
                line-height: 1.6;
                color: #222;
                margin-bottom: 24px;
                white-space: pre-line;
                border-left: 3px solid #cc0000;
                padding-left: 16px;
            }
            .hv-puzzle-input {
                width: 100%;
                max-width: 200px;
                padding: 12px 16px;
                font-family: 'Courier New', monospace;
                font-size: 1.1rem;
                border: 2px solid #ccc;
                border-radius: 4px;
                outline: none;
                transition: border-color 0.2s;
            }
            .hv-puzzle-input:focus { border-color: #cc0000; }
            .hv-puzzle-input.text-wide { max-width: 400px; }
            .hv-puzzle-choices {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            .hv-puzzle-choice {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 14px 18px;
                background: #fff;
                border: 2px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                line-height: 1.4;
                transition: all 0.2s;
            }
            .hv-puzzle-choice:hover { border-color: #cc0000; background: #fef5f5; }
            .hv-puzzle-choice.selected { border-color: #cc0000; background: #fef0f0; }
            .hv-puzzle-choice-radio {
                width: 18px;
                height: 18px;
                min-width: 18px;
                border: 2px solid #ccc;
                border-radius: 50%;
                margin-top: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .hv-puzzle-choice.selected .hv-puzzle-choice-radio {
                border-color: #cc0000;
            }
            .hv-puzzle-choice.selected .hv-puzzle-choice-radio::after {
                content: '';
                width: 10px;
                height: 10px;
                background: #cc0000;
                border-radius: 50%;
            }
            .hv-puzzle-choice-check {
                width: 18px;
                height: 18px;
                min-width: 18px;
                border: 2px solid #ccc;
                border-radius: 3px;
                margin-top: 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .hv-puzzle-choice.selected .hv-puzzle-choice-check {
                border-color: #cc0000;
                background: #cc0000;
            }
            .hv-puzzle-choice.selected .hv-puzzle-choice-check::after {
                content: '✓';
                color: #fff;
                font-size: 0.75rem;
            }
            .hv-puzzle-actions {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            .hv-puzzle-submit {
                padding: 12px 32px;
                background: #cc0000;
                color: #fff;
                border: none;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                font-weight: bold;
                letter-spacing: 0.08em;
                cursor: pointer;
                transition: all 0.2s;
            }
            .hv-puzzle-submit:hover { background: #aa0000; }
            .hv-puzzle-submit:disabled { background: #999; cursor: not-allowed; }
            .hv-puzzle-hint-btn {
                padding: 10px 20px;
                background: transparent;
                color: #888;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .hv-puzzle-hint-btn:hover { color: #cc0000; border-color: #cc0000; }
            .hv-puzzle-hint-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .hv-puzzle-hint {
                margin-top: 12px;
                padding: 12px 16px;
                background: #fff8e1;
                border-left: 3px solid #f0ad4e;
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                color: #666;
                line-height: 1.5;
            }
            .hv-puzzle-feedback {
                margin-top: 20px;
                padding: 16px 20px;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                line-height: 1.5;
                animation: hvFeedbackIn 0.3s ease;
            }
            .hv-puzzle-feedback.correct {
                background: #e8f5e9;
                border-left: 4px solid #4caf50;
                color: #2e7d32;
            }
            .hv-puzzle-feedback.incorrect {
                background: #ffebee;
                border-left: 4px solid #cc0000;
                color: #b71c1c;
            }
            .hv-puzzle-teaching {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid rgba(0,0,0,0.1);
                font-size: 0.8rem;
                color: #555;
                font-style: italic;
            }
            .hv-variant-badge {
                display: inline-block;
                font-size: 0.6rem;
                letter-spacing: 0.1em;
                color: #e67e22;
                border: 1px solid #e67e22;
                border-radius: 3px;
                padding: 2px 8px;
                margin-left: 10px;
                vertical-align: middle;
            }
            .hv-debug-answer {
                margin-top: 8px;
                padding: 6px 12px;
                background: #fff3cd;
                border: 1px dashed #e67e22;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 0.75rem;
                color: #856404;
            }
            @keyframes hvFeedbackIn {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Code entry */
            .hv-code-entry { text-align: center; margin: 40px auto; max-width: 600px; }
            .hv-code-title {
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                letter-spacing: 0.15em;
                color: #cc0000;
                text-transform: uppercase;
                margin-bottom: 24px;
            }
            .hv-code-boxes {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-bottom: 24px;
                flex-wrap: wrap;
            }
            .hv-code-box {
                width: 60px;
                height: 60px;
                font-family: 'Courier New', monospace;
                font-size: 1.4rem;
                font-weight: bold;
                text-align: center;
                border: 2px solid #ccc;
                border-radius: 6px;
                outline: none;
                transition: border-color 0.2s;
            }
            .hv-code-box:focus { border-color: #cc0000; }
            .hv-code-box.filled { border-color: #888; background: #f5f5f5; }
            .hv-code-submit {
                padding: 14px 48px;
                background: #cc0000;
                color: #fff;
                border: none;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 1rem;
                font-weight: bold;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: all 0.2s;
            }
            .hv-code-submit:hover { background: #aa0000; }
        `;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------------
    // Validation helpers
    // -------------------------------------------------------------------------

    function _validateNumber(input, answer) {
        const parsed = parseInt(input, 10);
        return !isNaN(parsed) && parsed === answer;
    }

    function _validateText(input, answer) {
        return input.trim().toLowerCase() === String(answer).trim().toLowerCase();
    }

    function _validateChoice(selectedIndex, correctIndex) {
        return selectedIndex === correctIndex;
    }

    function _validateMultiSelect(selectedSet, correctSet) {
        if (selectedSet.length !== correctSet.length) return false;
        const a = [...selectedSet].sort();
        const b = [...correctSet].sort();
        return a.every((v, i) => v === b[i]);
    }

    // -------------------------------------------------------------------------
    // Type renderers
    // -------------------------------------------------------------------------

    function _renderNumberInput(puzzle, container, onSubmit) {
        const inputArea = document.createElement('div');
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'hv-puzzle-input';
        input.placeholder = 'Enter number...';
        inputArea.appendChild(input);
        container.appendChild(inputArea);

        const actions = _buildActions(puzzle, () => {
            const val = input.value.trim();
            if (!val) return;
            const correct = _validateNumber(val, puzzle.answer);
            _showFeedback(container, correct, puzzle);
            _disableAll(container);
            onSubmit(correct, puzzle.codeDigit);
        });
        container.appendChild(actions.el);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') actions.submitBtn.click();
        });

        setTimeout(() => input.focus(), 100);
    }

    function _renderTextInput(puzzle, container, onSubmit) {
        const inputArea = document.createElement('div');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'hv-puzzle-input text-wide';
        input.placeholder = 'Enter answer...';
        inputArea.appendChild(input);
        container.appendChild(inputArea);

        const actions = _buildActions(puzzle, () => {
            const val = input.value.trim();
            if (!val) return;
            const correct = _validateText(val, puzzle.answer);
            _showFeedback(container, correct, puzzle);
            _disableAll(container);
            onSubmit(correct, puzzle.codeDigit);
        });
        container.appendChild(actions.el);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') actions.submitBtn.click();
        });

        setTimeout(() => input.focus(), 100);
    }

    function _renderMultipleChoice(puzzle, container, onSubmit) {
        const choicesEl = document.createElement('div');
        choicesEl.className = 'hv-puzzle-choices';
        let selectedIndex = -1;

        puzzle.choices.forEach((choice, i) => {
            const row = document.createElement('div');
            row.className = 'hv-puzzle-choice';
            row.innerHTML = `<div class="hv-puzzle-choice-radio"></div><div>${choice}</div>`;
            row.onclick = () => {
                choicesEl.querySelectorAll('.hv-puzzle-choice').forEach(c => c.classList.remove('selected'));
                row.classList.add('selected');
                selectedIndex = i;
            };
            choicesEl.appendChild(row);
        });

        container.appendChild(choicesEl);

        const actions = _buildActions(puzzle, () => {
            if (selectedIndex < 0) return;
            const correct = _validateChoice(selectedIndex, puzzle.answer);
            _showFeedback(container, correct, puzzle);
            _disableAll(container);
            onSubmit(correct, puzzle.codeDigit);
        });
        container.appendChild(actions.el);
    }

    function _renderMultiSelect(puzzle, container, onSubmit) {
        const choicesEl = document.createElement('div');
        choicesEl.className = 'hv-puzzle-choices';
        const selected = new Set();

        puzzle.choices.forEach((choice, i) => {
            const row = document.createElement('div');
            row.className = 'hv-puzzle-choice';
            row.innerHTML = `<div class="hv-puzzle-choice-check"></div><div>${choice}</div>`;
            row.onclick = () => {
                if (selected.has(i)) {
                    selected.delete(i);
                    row.classList.remove('selected');
                } else {
                    selected.add(i);
                    row.classList.add('selected');
                }
            };
            choicesEl.appendChild(row);
        });

        container.appendChild(choicesEl);

        const actions = _buildActions(puzzle, () => {
            if (selected.size === 0) return;
            const correct = _validateMultiSelect([...selected], puzzle.answer);
            _showFeedback(container, correct, puzzle);
            _disableAll(container);
            onSubmit(correct, puzzle.codeDigit);
        });
        container.appendChild(actions.el);
    }

    // -------------------------------------------------------------------------
    // Shared UI builders
    // -------------------------------------------------------------------------

    function _buildActions(puzzle, onClickSubmit) {
        const el = document.createElement('div');
        el.className = 'hv-puzzle-actions';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'hv-puzzle-submit';
        submitBtn.textContent = '> SUBMIT';
        submitBtn.onclick = onClickSubmit;
        el.appendChild(submitBtn);

        if (puzzle.hint) {
            const hintBtn = document.createElement('button');
            hintBtn.className = 'hv-puzzle-hint-btn';
            hintBtn.textContent = `Hint (-${puzzle.hint.cost} pts)`;
            hintBtn.onclick = () => {
                hintBtn.disabled = true;
                const hintEl = document.createElement('div');
                hintEl.className = 'hv-puzzle-hint';
                hintEl.textContent = puzzle.hint.text;
                el.parentElement.insertBefore(hintEl, el.nextSibling);

                // Notify engine of hint usage
                if (window.HiveEngine && window.HiveEngine._onHintUsed) {
                    window.HiveEngine._onHintUsed(puzzle.hint.cost);
                }
            };
            el.appendChild(hintBtn);
        }

        return { el, submitBtn };
    }

    function _showFeedback(container, correct, puzzle) {
        // Remove old feedback
        const old = container.querySelector('.hv-puzzle-feedback');
        if (old) old.remove();

        const fb = document.createElement('div');
        fb.className = 'hv-puzzle-feedback ' + (correct ? 'correct' : 'incorrect');

        if (correct) {
            fb.innerHTML = `<strong>✓ Correct.</strong> Code digit: <strong>${puzzle.codeDigit}</strong>`;
            if (puzzle.teachingPoint) {
                fb.innerHTML += `<div class="hv-puzzle-teaching">${puzzle.teachingPoint}</div>`;
            }
        } else {
            fb.innerHTML = '<strong>✗ Incorrect.</strong>';
            if (typeof RedQueen !== 'undefined') {
                RedQueen.taunt();
            }
        }

        container.appendChild(fb);
    }

    function _disableAll(container) {
        container.querySelectorAll('input').forEach(el => el.disabled = true);
        container.querySelectorAll('button').forEach(el => el.disabled = true);
        container.querySelectorAll('.hv-puzzle-choice').forEach(el => {
            el.style.pointerEvents = 'none';
        });
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    function render(puzzle, container, onSubmit) {
        _injectStyles();
        container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'hv-puzzle';

        // Title + variant badge
        const title = document.createElement('div');
        title.className = 'hv-puzzle-title';
        title.innerHTML = `[ Puzzle: ${puzzle.title} ]`;
        if (puzzle.isVariant) {
            title.innerHTML += '<span class="hv-variant-badge">VARIANT</span>';
        }
        wrapper.appendChild(title);

        // Debug mode — show expected answer when ?debug=1
        const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';
        if (debugMode) {
            const debugEl = document.createElement('div');
            debugEl.className = 'hv-debug-answer';
            const answerDisplay = Array.isArray(puzzle.answer)
                ? puzzle.answer.join(', ')
                : puzzle.answer;
            debugEl.textContent = `DEBUG — Expected: ${answerDisplay} | Code digit: ${puzzle.codeDigit}`;
            wrapper.appendChild(debugEl);
        }

        // Prompt
        const prompt = document.createElement('div');
        prompt.className = 'hv-puzzle-prompt';
        prompt.textContent = puzzle.prompt;
        wrapper.appendChild(prompt);

        // Type-specific renderer
        const renderers = {
            'number-input': _renderNumberInput,
            'text-input': _renderTextInput,
            'multiple-choice': _renderMultipleChoice,
            'multi-select': _renderMultiSelect
        };

        const renderer = renderers[puzzle.type];
        if (renderer) {
            renderer(puzzle, wrapper, onSubmit);
        }

        container.appendChild(wrapper);
    }

    function renderCodeEntry(digits, container, onSubmit) {
        _injectStyles();
        container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'hv-code-entry';

        const title = document.createElement('div');
        title.className = 'hv-code-title';
        title.textContent = '[ Enter Exit Code ]';
        wrapper.appendChild(title);

        const desc = document.createElement('div');
        desc.style.cssText = 'font-family: "Courier New", monospace; font-size: 0.85rem; color: #666; margin-bottom: 20px;';
        desc.textContent = 'Enter the digits you collected from each puzzle to unlock the exit.';
        wrapper.appendChild(desc);

        const boxesRow = document.createElement('div');
        boxesRow.className = 'hv-code-boxes';

        const inputs = [];
        digits.forEach((_, i) => {
            const box = document.createElement('input');
            box.type = 'text';
            box.className = 'hv-code-box';
            box.maxLength = 4;
            box.dataset.index = i;
            box.addEventListener('input', () => {
                if (box.value.trim()) {
                    box.classList.add('filled');
                    // Auto-advance to next empty box
                    if (i < digits.length - 1) {
                        inputs[i + 1].focus();
                    }
                } else {
                    box.classList.remove('filled');
                }
            });
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !box.value && i > 0) {
                    inputs[i - 1].focus();
                }
            });
            inputs.push(box);
            boxesRow.appendChild(box);
        });

        wrapper.appendChild(boxesRow);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'hv-code-submit';
        submitBtn.textContent = '> UNLOCK';
        submitBtn.onclick = () => {
            const entered = inputs.map(inp => inp.value.trim());
            const allFilled = entered.every(v => v !== '');
            if (!allFilled) return;

            const correct = entered.every((v, i) => v === digits[i]);
            onSubmit(correct);
        };
        wrapper.appendChild(submitBtn);

        container.appendChild(wrapper);

        setTimeout(() => inputs[0].focus(), 100);
    }

    return {
        render,
        renderCodeEntry
    };

})();
