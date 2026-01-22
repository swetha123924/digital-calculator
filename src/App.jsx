/* eslint-disable no-undef */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const SCIENTIFIC_KEYS = [
  'sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', '^', '1/x', '|x|', 'n!', '%'
];

const MEMORY_KEYS = ['MC', 'MR', 'M+', 'M-'];

const CORE_KEYS = [
  'AC', 'DEL', '(', ')', '7', '8', '9', '÷',
  '4', '5', '6', '×', '1', '2', '3', '-',
  '0', '.', 'π', '+', 'ANS', '='
];

function App() {
  const [expression, setExpression] = useState('0');
  const [result, setResult] = useState(null);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));
  const [showHistory, setShowHistory] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Calculator');
  const [justEvaluated, setJustEvaluated] = useState(false);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const preview = useMemo(() => {
    if (justEvaluated) return null;
    try {
      if (!expression || expression === '0') return null;
      const value = evaluateExpression(expression, result ?? 0);
      return Number.isFinite(value) ? formatResult(value) : null;
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return null;
    }
  }, [expression, result, justEvaluated]);

  const updateExpression = (next) => {
    setExpression((prev) => {
      setJustEvaluated(false);
      if (prev === 'Error') return next;
      if (prev === '0') return next;
      return prev + next;
    });
  };

  const clearAll = () => {
    setExpression('0');
    setResult(null);
    setJustEvaluated(false);
  };

  const backspace = () => {
    setExpression((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleMemory = (action) => {
    try {
      const current = evaluateExpression(expression, result ?? 0);
      if (action === 'MC') setMemory(0);
      if (action === 'MR') setExpression(String(memory));
      if (action === 'M+') setMemory((m) => m + current);
      if (action === 'M-') setMemory((m) => m - current);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setResult(null);
    }
  };

  const appendFunction = (fn) => {
    if (fn === '√') {
      updateExpression('√(');
    } else if (fn === 'x²') {
      setExpression((prev) => `${prev}^2`);
    } else if (fn === '^') {
      updateExpression('^');
    } else if (fn === '1/x') {
      setExpression((prev) => `1/(${prev})`);
    } else if (fn === '|x|') {
      setExpression((prev) => `abs(${prev})`);
    } else if (fn === 'n!') {
      setExpression((prev) => `${prev}!`);
    } else if (fn === '%') {
      updateExpression('%');
    } else {
      updateExpression(`${fn}(`);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCore = useCallback((key) => {
    switch (key) {
      case 'AC':
        clearAll();
        return;
      case 'DEL':
        backspace();
        return;
      case '=':
        try {
          const value = evaluateExpression(expression, result ?? 0);
          const formatted = formatResult(value);
          setResult(value);
          setExpression(String(formatted));
          const entry = `${expression} = ${formatted}`;
          setHistory((prev) => [...prev.slice(-29), entry]);
          setJustEvaluated(true);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          setResult(null);
          setExpression('Error');
          setJustEvaluated(false);
        }
        return;
      case 'ANS':
        updateExpression(String(result ?? 0));
        setJustEvaluated(false);
        return;
      case 'π':
        updateExpression('π');
        setJustEvaluated(false);
        return;
      default:
        updateExpression(key);
        setJustEvaluated(false);
    }
  });

  const handleNameSubmit = () => {
    const name = prompt("What's your name?");
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const { key } = event;
      const allowed = '0123456789+-*/().';
      if (allowed.includes(key)) {
        event.preventDefault();
        updateExpression(key === '*' ? '×' : key === '/' ? '÷' : key);
      } else if (key === 'Enter') {
        event.preventDefault();
        handleCore('=');
      } else if (key === 'Backspace') {
        event.preventDefault();
        backspace();
      } else if (key === 'Escape') {
        event.preventDefault();
        clearAll();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearAll, backspace, handleCore]);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">Advanced Digital Calculator</p>
          <h1 className="title">{userName}</h1>
        </div>
        <div className="header__actions">
          {!userName && <button className="ghost" onClick={handleNameSubmit}>Set Name</button>}
          <button className="ghost" onClick={() => setShowHistory(true)}>History</button>
        </div>
      </header>

      <main className="calculator">
        <section className="display">
          <div className="expression">{expression}</div>
          <div className="preview">{preview !== null ? preview : '\u00a0'}</div>
        </section>

        <section className="panels">
          <article className="panel panel--scientific">
            <p className="panel__title">Scientific</p>
            <div className="grid grid--6">
              {SCIENTIFIC_KEYS.map((key) => (
                <Button key={key} label={key} variant="ghost" onPress={() => appendFunction(key)} />
              ))}
            </div>
          </article>

          <article className="panel panel--memory">
            <p className="panel__title">Memory</p>
            <div className="grid grid--4">
              {MEMORY_KEYS.map((key) => (
                <Button key={key} label={key} variant="ghost" onPress={() => handleMemory(key)} />
              ))}
            </div>
            <p className="memory__value">MEM: {memory}</p>
          </article>
        </section>

        <article className="panel panel--core">
          <div className="grid grid--4">
            {CORE_KEYS.map((key) => (
              <Button
                key={key}
                label={key}
                variant={key === '=' ? 'primary' : key === 'AC' ? 'danger' : key === 'DEL' ? 'warn' : 'default'}
                onPress={() => handleCore(key)}
              />
            ))}
          </div>
        </article>
      </main>

      {showHistory && (
        <aside className="history">
          <div className="history__header">
            <h2>History</h2>
            <div className="header__actions">
              <button className="ghost" onClick={() => setHistory([])}>Clear</button>
              <button className="ghost" onClick={() => setShowHistory(false)}>Close</button>
            </div>
          </div>
          <ul>
            {history.length === 0 && <li className="muted">No history yet.</li>}
            {history.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}

const Button = ({ label, onPress, variant = 'default' }) => (
  <button className={`btn btn--${variant}`} onClick={onPress}>
    {label}
  </button>
);

const formatResult = (value) => {
  if (!Number.isFinite(value)) return value;
  const abs = Math.abs(value);
  if ((abs >= 1e12 || (abs > 0 && abs < 1e-6))) {
    return Number(value).toExponential(10).replace(/\.0+e/, 'e');
  }
  return Number(value.toPrecision(12)).toString();
};

const evaluateExpression = (rawExpression, ans = 0) => {
  const cleaned = rawExpression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/%/g, '*0.01')
    .replace(/\^/g, '**')
    .replace(/abs\(/g, 'Math.abs(')
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/ANS/g, ans)
    .replace(/!/g, 'FACT');

  const factorialWrapped = cleaned.replace(/(\([^()]+\)|\d+(?:\.\d+)?)FACT/g, (_, operand) => `factorial(${operand})`);

  if (/[^0-9+\-*/().\s^%A-Za-z]/.test(factorialWrapped)) {
    throw new Error('Invalid characters in expression');
  }

  const evaluator = new Function('factorial', `"use strict"; return (${factorialWrapped});`);
  return evaluator(factorial);
};

const factorial = (n) => {
  if (n < 0) throw new Error('Negative factorial');
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i += 1) res *= i;
  return res;
};

export default App;