import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router';
import { useGameContext } from '../../context/GameContext';
import { hasGameQuestions } from '../../hooks/services/indexedDB/games';
import './Category.css';


/* ---------- Reusable HUD corner frame (same as bomb game) ---------- */

function CornerFrame() {
  return (
    <>
      <span className="hud-corner hud-corner--tl" />
      <span className="hud-corner hud-corner--tr" />
      <span className="hud-corner hud-corner--bl" />
      <span className="hud-corner hud-corner--br" />
    </>
  );
}

/* ---------- Game Card (simulated download) ---------- */

function GameCard({ game, onPlay }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'downloading' | 'done'
  
  useEffect(() => {
    const checkDownload = async () => {
      const downloaded = await hasGameQuestions()
      setStatus(downloaded ? 'done' : 'idle')
    }
    
    checkDownload()
  },[])
  
  const handleClick = () => {
    if (status === 'done') {
      onPlay(game);
      return;
    }
    if (status === 'idle') {
      setStatus('downloading');
      // download Questions here
      setTimeout(() => setStatus('done'), 1500); // simulate 1.5s download
    }
  };

  return (
    <div className="cat-card">
      <CornerFrame />
      <div className="cat-card-icon">
        <i className="fa-solid fa-bomb" />
      </div>
      <h2 className="cat-card-title hud-display">{game.title}</h2>
      <p className="cat-card-desc">{game.description}</p>
      <span className="cat-card-size hud-mono">
        <i className="fa-solid fa-hard-drive" /> {game.size}
      </span>

      <button
        className={`cat-card-btn ${status === 'done' ? 'cat-card-btn--play' : ''}`}
        onClick={handleClick}
        disabled={status === 'downloading'}
      >
        {status === 'idle' && (
          <>
            <i className="fa-solid fa-download" /> Download
          </>
        )}
        {status === 'downloading' && (
          <>
            <i className="fa-solid fa-spinner fa-spin" /> Downloading…
          </>
        )}
        {status === 'done' && (
          <>
            <i className="fa-solid fa-play" /> Play
          </>
        )}
      </button>
    </div>
  );
}

/* ---------- Category Page (list of games) ---------- */

export function Category() {
  const { setSelectedGame } = useGameContext();
  
  const navigate = useNavigate()
  
  const games = [
    {
      id: 'bomb-defusal',
      title: 'Bomb Defusal Championship',
      description: 'Answer JAMB questions to defuse bombs and climb the leagues.',
      size: '45 MB',
      icon: 'fa-bomb',
    },
  ];

  const handlePlay = (game) => {
    // Navigate to subject selection (Entry page)
    navigate(`/game/${game.id}`)
  };

  return (
    <div className="cat-root">
      <div className="cat-page">
        <div className="cat-scanline" />
        <header className="cat-header">
          <p className="cat-eyebrow">CBT PRO · GAME LIBRARY</p>
          <h1 className="cat-title">Available Games</h1>
          <p className="cat-sub">Download a game to start your tactical training.</p>
        </header>

        <div className="cat-grid">
          {games.map(game => (
            <GameCard key={game.id} game={game} onPlay={handlePlay} />
          ))}
        </div>
      </div>
    </div>
  );
}