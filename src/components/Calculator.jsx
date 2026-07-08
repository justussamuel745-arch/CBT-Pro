import { useState, memo } from 'react';

export const Calculator = memo(function Calculator({toggleCalc, setToggleCalc, calcModalRef}) {
  const [calcValue, setCalcValue] = useState('');
  
  function calcInput(event){
    const { num } = event.target.dataset;
    setCalcValue(calcValue + num);
  }

  function backspace(){
    setCalcValue(calcValue.trim().slice(0, -1));
  }

  function calcClear(){
    setCalcValue('');
  }

  function calcEquals(){
    try {
      setCalcValue(String(eval(calcValue)));
    } catch {
      setCalcValue('Error');
    }
  }
  
  return (
    <div className={`exam-overlay ${toggleCalc ? 'show' : ''}`}>
      <div className="exam-modal" ref={calcModalRef}>
        <div className="exam-modal-header">
          <div className="exam-modal-title">Calculator</div>
          <button className="exam-modal-close" onClick={() => setToggleCalc(prev => !prev)}>×</button>
        </div>
        <div className="exam-calc-display">{!calcValue ? '0' : calcValue.replaceAll('*', '×').replaceAll('/', '÷')}</div>
        <div className="exam-calc-grid">
          <button className="exam-calc-btn" onClick={calcClear}>C</button>
          <button className="exam-calc-btn" onClick={backspace}>⌫</button>
          <button className="exam-calc-btn operator" onClick={calcInput} data-num=" / ">÷</button>
          <button className="exam-calc-btn operator" onClick={calcInput} data-num=" * ">×</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="7">7</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="8">8</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="9">9</button>
          <button className="exam-calc-btn operator" onClick={calcInput} data-num=" - ">−</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="4">4</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="5">5</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="6">6</button>
          <button className="exam-calc-btn operator" onClick={calcInput} data-num=" + ">+</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="1">1</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="2">2</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="3">3</button>
          <button className="exam-calc-btn operator" onClick={calcInput} data-num=".">.</button>
          <button className="exam-calc-btn" onClick={calcInput} data-num="0">0</button>
          <button className="exam-calc-btn equals" onClick={calcEquals}>=</button>
        </div>
      </div>
    </div>
  )
})