import GameProvider from '../../context/GameProvider';
import { BombDefusal } from './bombDefusal/BombDefusal';


export function Games(){
  return (
    <GameProvider>
      <BombDefusal />
    </GameProvider>
  )
}