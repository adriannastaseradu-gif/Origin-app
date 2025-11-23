import React, { useState } from 'react';
// S-a corectat importul: 'Equals' nu exista, s-a inlocuit cu 'Equal'
import { Delete, Divide, X, Minus, Plus, Equal } from 'lucide-react';

/**
 * Functie pentru a evalua expresia matematica in siguranta.
 * Foloseste 'new Function' pentru a evita 'eval()' si a gestiona erorile de sintaxa.
 * @param {string} expression Expresia de evaluat (ex: "10+5*2")
 * @returns {string} Rezultatul calculului sau 'Error'
 */
const safeEvaluate = (expression) => {
    // Înlocuiește simbolurile de pe display cu cele acceptate de JavaScript
    const sanitizedExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

    try {
        // Foloseste constructorul Function pentru evaluare sigura (alternativa la eval)
        // Daca nu se specifica o cheie API, se lasa cheia goala
        const result = new Function('return ' + sanitizedExpression)();

        // Verifica daca rezultatul este finit (nu NaN, Infinity etc.)
        if (!isFinite(result)) {
            return 'Error';
        }

        // Returneaza rezultatul cu o precizie maxima de 10 zecimale
        return parseFloat(result.toFixed(10)).toString();

    } catch (e) {
        return 'Error';
    }
};

const CalculatorButton = ({ value, onClick, className = '', isOperator = false, isEquals = false }) => {
    const baseStyle = "p-4 rounded-full text-2xl font-semibold transition-all duration-150 shadow-md";

    let colorStyle = isOperator 
        ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
        : "bg-gray-100 hover:bg-gray-200 text-gray-800";
        
    if (isEquals) {
        // S-a adaugat 'col-span-2' stilului pentru butonul '0' din layout-ul original.
        colorStyle = "bg-green-500 hover:bg-green-600 text-white"; 
    } else if (value === 'C') {
        colorStyle = "bg-red-500 hover:bg-red-600 text-white";
    } else if (value === '+/-' || value === '%') {
        colorStyle = "bg-gray-300 hover:bg-gray-400 text-gray-800";
    }

    return (
        <button
            onClick={() => onClick(value)}
            className={`${baseStyle} ${colorStyle} ${className} active:scale-95`}
        >
            {/* Afiseaza pictograme pentru operatori */}
            {value === '÷' && <Divide size={24} className="mx-auto" />}
            {value === '×' && <X size={24} className="mx-auto" />}
            {value === '-' && <Minus size={24} className="mx-auto" />}
            {value === '+' && <Plus size={24} className="mx-auto" />}
            {/* S-a inlocuit <Equals> cu <Equal> */}
            {value === '=' && <Equal size={28} className="mx-auto" />} 
            {value === 'C' && "C"}
            {value === '+/-' && <Minus size={20} className="mx-auto" />}
            {value === '%' && "%"}
            {value === '⌫' && <Delete size={24} className="mx-auto" />}
            {/* Afiseaza valoarea pentru numere/puncte */}
            {typeof value === 'number' && value}
            {value === '.' && value}
        </button>
    );
};


export default function App() {
    const [display, setDisplay] = useState('0');
    const [history, setHistory] = useState('');
    const [justCalculated, setJustCalculated] = useState(false);

    /**
     * Gestioneaza apasarea butoanelor (numere, operatori, actiuni)
     * @param {string} value Valoarea butonului apasat
     */
    const handleButtonClick = (value) => {
        // Resetare (Clear All)
        if (value === 'C') {
            setDisplay('0');
            setHistory('');
            setJustCalculated(false);
            return;
        }

        // Sterge ultima intrare (Backspace)
        if (value === '⌫') {
            if (display === 'Error') {
                setDisplay('0');
                setHistory('');
            } else {
                setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
            }
            setJustCalculated(false);
            return;
        }

        // Calculeaza rezultatul
        if (value === '=') {
            if (display === 'Error') return;

            const result = safeEvaluate(display);
            setHistory(display + ' =');
            setDisplay(result);
            setJustCalculated(true);
            return;
        }

        // Gestionare punct zecimal
        if (value === '.') {
            // Previne adaugarea de mai multe puncte in numarul curent
            // Extrage ultimul numar sau operator pentru a verifica daca contine deja un punct
            const parts = display.split(/[\+\-×÷%]/);
            const lastPart = parts[parts.length - 1];

            if (!lastPart.includes('.')) {
                // Daca display-ul este '0' sau o valoare proaspat calculata, adauga '0.'
                if (display === '0' || justCalculated) {
                    setDisplay('0.');
                } else {
                    // Daca ultimul caracter este un operator, adauga '0.'
                    const lastChar = display.slice(-1);
                    if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
                        setDisplay(prev => prev + '0.');
                    } else {
                        setDisplay(prev => prev + '.');
                    }
                }
            }
            setJustCalculated(false);
            return;
        }

        // Gestionare operatori (+, -, ×, ÷, %)
        const isOperator = ['+', '-', '×', '÷', '%'].includes(value);

        if (isOperator) {
            if (display === 'Error') return;

            const lastChar = display.slice(-1);
            const isLastCharOperator = ['+', '-', '×', '÷', '%'].includes(lastChar);
            
            // Daca ultimul caracter este tot un operator, il inlocuieste pe cel vechi cu cel nou
            if (isLastCharOperator) {
                setDisplay(prev => prev.slice(0, -1) + value);
            } else if (justCalculated) {
                // Daca tocmai am calculat, incepem o noua operatie cu rezultatul precedent
                setHistory(display + ' ' + value);
                setDisplay(display + value);
            } else {
                // Adauga operatorul
                setDisplay(prev => prev + value);
            }
            setJustCalculated(false);
            return;
        }

        // Gestionare numere (0-9)
        if (display === '0' || justCalculated || display === 'Error') {
            // Inlocuieste '0' initial sau rezultatul calculat cu noul numar
            setDisplay(value.toString());
            setJustCalculated(false);
        } else {
            // Adauga numarul la expresia existenta
            setDisplay(prev => prev + value);
        }
    };

    // Definitia butoanelor si layout-ul
    const buttons = [
        // Rândul 1
        { value: 'C', isOperator: false },
        { value: '⌫', isOperator: false },
        { value: '%', isOperator: true },
        { value: '÷', isOperator: true },
        // Rândul 2
        { value: 7 }, { value: 8 }, { value: 9 },
        { value: '×', isOperator: true },
        // Rândul 3
        { value: 4 }, { value: 5 }, { value: 6 },
        { value: '-', isOperator: true },
        // Rândul 4
        { value: 1 }, { value: 2 }, { value: 3 },
        { value: '+', isOperator: true },
        // Rândul 5
        // Butonul '0' ocupă două coloane (col-span-2)
        { value: '0', className: 'col-span-2' }, 
        { value: '.' },
        { value: '=', isEquals: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-6 flex items-center justify-center">
                    Calculator Adrian 
                </h1>
                
                {/* Afisaj */}
                <div className="bg-gray-800 p-5 rounded-2xl mb-6 shadow-inner">
                    <div className="text-gray-400 text-sm h-5 overflow-hidden text-right whitespace-nowrap">
                        {history}
                    </div>
                    <div className="text-white text-5xl font-light h-14 overflow-x-auto text-right whitespace-nowrap scrollbar-hide"
                         // Fortam derularea de la dreapta la stanga pentru a vedea numerele mari
                         style={{ direction: 'rtl' }} 
                    >
                        {display}
                    </div>
                </div>

                {/* Butoane */}
                <div className="grid grid-cols-4 gap-3">
                    {buttons.map((btn, index) => (
                        <CalculatorButton
                            key={index}
                            value={btn.value}
                            onClick={handleButtonClick}
                            className={btn.className || ''}
                            isOperator={btn.isOperator}
                            isEquals={btn.isEquals}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
