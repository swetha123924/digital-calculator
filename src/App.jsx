import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0); // Memory storage
  const [userName, setUserName] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedHistory = JSON.parse(localStorage.getItem('history')) || [];
    if (storedName) {
      setUserName(storedName);
    } else {
      handleNameSubmit(); // Prompt for name if not already set
    }
    setHistory(storedHistory);
  }, []);

  const handleButtonClick = (label) => {
    if (label === 'AC') {
      setDisplay('0'); 
    } else if (label === 'DEL') {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); // Delete last character
    } else if (label === '=') {
      try {
        const result = evalExpression(display).toString();
        setDisplay(result);
        const newHistory = [...history, `${display} = ${result}`];
        setHistory(newHistory);
        localStorage.setItem('history', JSON.stringify(newHistory));
      } catch (error) {
        setDisplay('Error'); // Handle any errors in evaluation
      }
    } else if (label === '√') {
      try {
        setDisplay(Math.sqrt(eval(display)).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'x²') {
      try {
        setDisplay(Math.pow(eval(display), 2).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'log') {
      try {
        setDisplay(Math.log10(eval(display)).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'In') {
      try {
        setDisplay(Math.log(eval(display)).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'π') {
      setDisplay(display === '0' ? Math.PI.toString() : display + Math.PI);
    } else if (label === '(-)') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
    } else if (label === 'hyp') {
      const sides = display.split(',').map(Number);
      if (sides.length === 2) {
        const hypotenuse = Math.sqrt(Math.pow(sides[0], 2) + Math.pow(sides[1], 2));
        setDisplay(hypotenuse.toString());
      } else {
        setDisplay('Error: Enter two sides');
      }
    } else if (label === 'sin') {
      try {
        setDisplay(Math.sin(eval(display)).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'cos') {
      try {
        setDisplay(Math.cos(eval(display)).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'tan') {
      try {
        setDisplay(Math.tan(eval(display)).toString());
      } catch (error) {
        setDisplay('Error');
      }
    } else if (label === 'RCL') {
      setDisplay(memory.toString()); // Recall memory
    } else if (label === 'M+') {
      setMemory(memory + eval(display)); // Add current display to memory
      setDisplay('0'); // Reset display after storing
    } else if (label === 'M-') {
      setMemory(memory - eval(display)); // Subtract current display from memory
      setDisplay('0'); // Reset display after storing
    } else if (label === 'n!') {
      const num = eval(display);
      if (num < 0) {
        setDisplay('Error: Negative number');
      } else {
        setDisplay(factorial(num).toString());
      }
    } else if (label === 'HIS') {
      setShowHistory(true);
    } else {
      // If display is '0', replace it with the new input
      if (display === '0') {
        setDisplay(label);
      } else {
        setDisplay(display + label); // Append the new input
      }
    }
  };

  const evalExpression = (expression) => {
    // Replace 'x' with '*' for multiplication and '÷' with '/' for division
    expression = expression.replace(/x/g, '*').replace(/÷/g, '/');
    // Evaluate the expression
    return eval(expression);
  };

  const factorial = (n) => {
    if (n < 0) return 'Error: Negative number';
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const handleNameSubmit = () => {
    const name = prompt("What's your name?");
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
    }
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('history');
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <main className='bg-gray-800 rounded-lg shadow-lg p-4'>
          <h1 className='text-white text-2xl mb-4 text-center'>{userName || "Calculator"}</h1>
          <section className='bg-gray-900 text-white w-full h-16 flex items-center justify-end p-4 text-3xl border border-gray-700 rounded-lg'>
            {display}
          </section>
          <section className='flex flex-col mt-4'>
            <article className='grid grid-cols-4 gap-2'>
              {["AC", "DEL", "√", "x²", "log", "In", "(-)", "π", "hyp", "sin", "cos", "tan", "RCL", "M+", "M-", "HIS", "(", ")"].map(label => (
                <div key={label} className="flex justify-center">
                  <Button 
                    label={label} 
                    onClick={handleButtonClick} 
                    bgColor={label === 'AC' ? 'bg-green-500' : label === 'DEL' ? 'bg-red-500' : 'bg-gray-700'} 
                  />
                </div>
              ))}
            </article>
            <article className='grid grid-cols-4 gap-2 mt-2'>
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "+", "0", ".", "=", "-"].map(label => (
                <div key={label} className="flex justify-center">
                  <Button label={label} onClick={handleButtonClick} />
                </div>
              ))}
            </article>
          </section>
        </main>
      </div>
      {showHistory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Calculation History</h2>
            <ul className="max-h-60 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index} className="border-b border-gray-300 p-2">{entry}</li>
              ))}
            </ul>
            <div className="flex justify-between mt-4">
              <button onClick={clearHistory} className="bg-red-500 text-white p-2 rounded">Clear History</button>
              <button onClick={closeHistory} className="bg-gray-700 text-white p-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const Button = ({ label, onClick, bgColor }) => {
  return (
    <button
      className={`text-white text-lg rounded-lg p-4 hover:bg-gray-600 transition duration-200 w-full ${bgColor}`}
      onClick={() => onClick(label)}
    >
      {label}
    </button>
  );
}

export default App;