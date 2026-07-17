import { Routes, Route } from 'react-router';
import GameProvider from '../../context/GameProvider';
import { BombDefusal } from './bombDefusal/BombDefusal';
import { Category } from './Category';
import './Games.css';

export default function Games(){
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<Category />} />
        <Route path="/bomb-defusal/*" element={<BombDefusal />} />
      </Routes>
    </GameProvider>
  )
}