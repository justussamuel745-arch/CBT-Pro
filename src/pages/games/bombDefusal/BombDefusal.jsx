import { useState } from 'react';
import { useGameContext } from '../../../context/GameContext';
import { Entry } from './Entry';
import { Start } from './Start';

export function BombDefusal(){
  const { page } = useGameContext()
  
  const pages = {
    entry: <Entry />,
    start: <Start />
  }
  
  return (
    <>
      { pages[page] }
    </>
  )
}