/**
 * Calculator Logic & UI Handling
 */

document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let savedTheme = localStorage.getItem('theme');
    
    if (!savedTheme) {
        savedTheme = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Mode Toggle
    const modeToggle = document.getElementById('modeToggle');
    const keypad = document.getElementById('keypad');
    let isAdvanced = false;

    modeToggle.addEventListener('click', () => {
        isAdvanced = !isAdvanced;
        if (isAdvanced) {
            keypad.classList.add('advanced-visible');
            modeToggle.textContent = '基本電卓表示';
        } else {
            keypad.classList.remove('advanced-visible');
            modeToggle.textContent = '関数電卓表示';
        }
    });

    // Angle Mode Toggle
    const angleToggle = document.getElementById('angleToggle');
    let isDegree = false; // default is RAD

    angleToggle.addEventListener('click', () => {
        isDegree = !isDegree;
        angleToggle.textContent = isDegree ? 'DEG' : 'RAD';
    });

    // Calculator State
    let currentInput = '';
    let isResultDisplayed = false;
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

    const displayInput = document.getElementById('displayInput');
    const displayHistory = document.getElementById('displayHistory');
    const historyList = document.getElementById('historyList');

    // Init history
    renderHistory();

    // Map Buttons
    const buttons = document.querySelectorAll('#keypad button[data-val]');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            handleInput(val);
        });
    });

    document.getElementById('btnAC').addEventListener('click', () => {
        currentInput = '';
        displayHistory.textContent = '';
        updateDisplay('0');
    });

    document.getElementById('btnDel').addEventListener('click', () => {
        if (isResultDisplayed) {
            currentInput = '';
            isResultDisplayed = false;
        } else {
            currentInput = currentInput.slice(0, -1);
        }
        updateDisplay(currentInput || '0');
    });

    document.getElementById('btnEq').addEventListener('click', () => {
        calculateResult();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const keyMap = {
            'Enter': '=',
            '=': '=',
            'Backspace': 'DEL',
            'Escape': 'AC',
            '*': '×',
            '/': '÷',
            '+': '+',
            '-': '-',
            '%': '%',
            '^': '^',
            '(': '(',
            ')': ')',
            '.': '.'
        };

        if (e.key >= '0' && e.key <= '9') {
            handleInput(e.key);
        } else if (keyMap[e.key]) {
            e.preventDefault();
            if (keyMap[e.key] === '=') calculateResult();
            else if (keyMap[e.key] === 'DEL') document.getElementById('btnDel').click();
            else if (keyMap[e.key] === 'AC') document.getElementById('btnAC').click();
            else handleInput(keyMap[e.key]);
        }
    });

    function handleInput(val) {
        if (isResultDisplayed && !['+', '-', '×', '÷', '%', '^'].includes(val)) {
            currentInput = '';
        }
        isResultDisplayed = false;
        currentInput += val;
        updateDisplay(currentInput);
    }

    function updateDisplay(val) {
        displayInput.textContent = formatDisplay(val);
        // Scroll to right
        displayInput.scrollLeft = displayInput.scrollWidth;
    }

    function formatDisplay(val) {
        // Basic aesthetic formatting, preserving expression
        return val; 
    }

    function parseExpression(expr) {
        // Sanitize and replace
        let parsed = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/\^/g, '**');

        // Handle Factorial (!)
        parsed = parsed.replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)');
        
        // Handle trig functions considering RAD/DEG
        const trigFuncs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
        trigFuncs.forEach(func => {
            const regex = new RegExp(func + '\\(', 'g');
            if (isDegree) {
                if (func.startsWith('a')) {
                    // arc functions result needs conversion to degree
                    parsed = parsed.replace(regex, `(180/Math.PI)*Math.${func}(`);
                } else {
                    // standard trig funcs input needs conversion to radian
                    parsed = parsed.replace(regex, `Math.${func}((Math.PI/180)*`);
                }
            } else {
                parsed = parsed.replace(regex, `Math.${func}(`);
            }
        });

        // Add implicit closing parentheses
        const openP = (parsed.match(/\(/g) || []).length;
        const closeP = (parsed.match(/\)/g) || []).length;
        for (let i = 0; i < openP - closeP; i++) {
            parsed += ')';
        }

        return parsed;
    }

    function factorial(n) {
        n = parseFloat(n);
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    function calculateResult() {
        if (!currentInput) return;
        
        try {
            const parsedExpr = parseExpression(currentInput);
            
            // Check for unsafe characters
            if (/[^0-9+\-*/().,% \w|]/.test(parsedExpr)) {
                throw new Error("Invalid characters");
            }

            // Safe Evaluation using Function with restricted scope
            const evaluate = new Function('Math', 'factorial', `
                "use strict";
                try {
                    return (${parsedExpr});
                } catch(e) {
                    throw e;
                }
            `);

            let res = evaluate(Math, factorial);

            // Fix floating point issues
            if (typeof res === 'number') {
                res = Math.round(res * 1e12) / 1e12;
            }

            if (!isFinite(res) || isNaN(res)) {
                res = "エラー (Error)";
            }

            displayHistory.textContent = currentInput + ' =';
            
            // Add to history
            const historyItem = {
                expr: currentInput,
                result: res.toString()
            };
            addToHistory(historyItem);

            currentInput = res.toString();
            isResultDisplayed = true;
            updateDisplay(currentInput);

        } catch (e) {
            displayHistory.textContent = currentInput;
            currentInput = "エラー";
            updateDisplay(currentInput);
            isResultDisplayed = true;
        }
    }

    // History Functions
    function addToHistory(item) {
        history.unshift(item);
        if (history.length > 50) history.pop(); // keep last 50
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-item-expr">${item.expr} =</div>
                <div class="history-item-result">${item.result}</div>
            `;
            li.addEventListener('click', () => {
                currentInput = item.result;
                displayHistory.textContent = "履歴読込";
                updateDisplay(currentInput);
                isResultDisplayed = true;
                if (window.innerWidth < 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            historyList.appendChild(li);
        });
    }

    document.getElementById('clearHistory').addEventListener('click', () => {
        history = [];
        localStorage.removeItem('calcHistory');
        renderHistory();
    });

    document.getElementById('exportCsv').addEventListener('click', () => {
        if (history.length === 0) {
            showToast("履歴がありません");
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
        csvContent += "計算式,結果\r\n";
        history.forEach(row => {
            csvContent += `"${row.expr}","${row.result}"\r\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "calculator_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("エクスポートしました");
    });

    // Copy to clipboard
    displayInput.addEventListener('click', () => {
        if (!currentInput || currentInput === 'エラー') return;
        navigator.clipboard.writeText(currentInput).then(() => {
            showToast("コピーしました！");
        }).catch(() => {
            showToast("コピーに失敗しました");
        });
    });

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
