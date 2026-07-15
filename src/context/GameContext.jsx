import { createContext, useContext } from 'react';

export const GameContext = createContext()

export const useGameContext = () => useContext(GameContext)