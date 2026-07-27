import { GameContext } from './GameContext';

export default function GameProvider({ children }){
  
  return (
    <GameContext.Provider value={{
      
    }}>
      { children }
    </GameContext.Provider>
  )
}