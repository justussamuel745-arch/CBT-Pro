import { useState } from 'react';
import { GameContext } from './GameContext';

export default function GameProvider({ children }){
  const [page, setPage] = useState('entry')
  
  return (
    <GameContext.Provider value={{
      page,
      setPage
    }}>
      { children }
    </GameContext.Provider>
  )
}