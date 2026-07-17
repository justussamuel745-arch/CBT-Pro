import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { useGameContext } from '../../../context/GameContext';
import { Entry } from './Entry';
import { Start } from './Start';

export function BombDefusal(){
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route path="/start" element={<Start />} />
    </Routes>
  )
}