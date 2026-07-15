import React, { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   BOMB DEFUSAL CHAMPIONSHIP — CBT Pro
   Design language: "Reactor Core" tactical HUD
   Palette: void navy / cyan core / danger red / success green / amber warn
   Display type: Rajdhani (condensed technical) — Body: Inter
   Signature element: segmented hex "defusal core" ring + scanline frames
   ============================================================ */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
`;

/* ---------- Data ---------- */

const QUESTION_BANK = [
  { subject: "Mathematics", q: "If 2x + 5 = 17, what is the value of x?", options: ["4", "5", "6", "7"], a: 2 },
  { subject: "Mathematics", q: "What is the value of sin 30°?", options: ["1/2", "√3/2", "1", "0"], a: 0 },
  { subject: "Mathematics", q: "Simplify: 3(2x - 4) + 5", options: ["6x - 7", "6x - 12", "6x + 5", "6x - 17"], a: 0 },
  { subject: "English", q: "Choose the correctly spelt word.", options: ["Occassion", "Occasion", "Ocasion", "Occaision"], a: 1 },
  { subject: "English", q: "Identify the synonym of 'Abundant'.", options: ["Scarce", "Plentiful", "Empty", "Rare"], a: 1 },
  { subject: "English", q: "'She ___ to school every day.' Fill the gap.", options: ["go", "goes", "going", "gone"], a: 1 },
  { subject: "Physics", q: "The SI unit of electric current is the:", options: ["Volt", "Ohm", "Ampere", "Watt"], a: 2 },
  { subject: "Physics", q: "Which law states that force equals mass times acceleration?", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravitation"], a: 1 },
  { subject: "Chemistry", q: "What is the chemical symbol for Sodium?", options: ["So", "Sd", "Na", "S"], a: 2 },
  { subject: "Chemistry", q: "The pH of a neutral solution at 25°C is:", options: ["0", "7", "14", "1"], a: 1 },
  { subject: "Biology", q: "The powerhouse of the cell is the:", options: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi body"], a: 2 },
  { subject: "Biology", q: "Photosynthesis mainly occurs in the plant's:", options: ["Roots", "Stem", "Leaves", "Flowers"], a: 2 },
  { subject: "Geography", q: "Which is the longest river in Nigeria?", options: ["Benue", "Niger", "Kaduna", "Cross River"], a: 1 },
  { subject: "Economics", q: "The law of demand states that as price rises, quantity demanded:", options: ["Rises", "Falls", "Stays constant", "Doubles"], a: 1 },
  { subject: "Government", q: "The arm of government responsible for making laws is the:", options: ["Executive", "Judiciary", "Legislature", "Civil Service"], a: 2 },
];

const LEAGUES = [
  { id: "rookie", name: "Rookie League", tier: 1 },
  { id: "professional", name: "Professional League", tier: 2 },
  { id: "elite", name: "Elite League", tier: 3 },
  { id: "national", name: "National League", tier: 4 },
  { id: "world", name: "World League", tier: 5 },
  { id: "legend", name: "Legend League", tier: 6 },
];

const BOMB_TYPES = ["Timer Device", "Cyber Device", "Chemical Rig", "Wired Charge", "Signal Jammer"];

function buildMissions(league) {
  const count = 5;
  return Array.from({ length: count }).map((_, i) => {
    const isBoss = i === count - 1;
    return {
      id: `${league.id}-m${i + 1}`,
      index: i + 1,
      name: isBoss ? "Boss Bomb" : `Mission ${i + 1}`,
      bombType: isBoss ? "Nuclear Core" : BOMB_TYPES[i % BOMB_TYPES.length],
      difficulty: Math.min(5, league.tier + i - 2 < 1 ? 1 : league.tier + Math.floor(i / 2)),
      questions: isBoss ? 10 : 6 + i,
      time: isBoss ? 120 : 60 + i * 10,
      xp: (isBoss ? 500 : 150) + league.tier * 50 + i * 20,
      coins: (isBoss ? 300 : 100) + league.tier * 30,
      boss: isBoss,
    };
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Small shared HUD pieces ---------- */

function CornerFrame({ className = "" }) {
  return (
    <>
      <span className={`hud-corner hud-corner--tl ${className}`} />
      <span className={`hud-corner hud-corner--tr ${className}`} />
      <span className={`hud-corner hud-corner--bl ${className}`} />
      <span className={`hud-corner hud-corner--br ${className}`} />
    </>
  );
}

function Stars({ count, max = 5 }) {
  return (
    <span className="hud-stars" aria-label={`${count} of ${max} difficulty`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? "hud-star hud-star--on" : "hud-star"}>★</span>
      ))}
    </span>
  );
}

/* ---------- Progress states derived from progress % ---------- */

function coreState(progress) {
  if (progress >= 80) return "success";
  if (progress >= 40) return "warn";
  return "primary";
}

/* ============================================================
   SCREEN: HOME / LEAGUE SELECT
   ============================================================ */

function LeagueScreen({ progressState, onSelectLeague }) {
  return (
    <div className="bomb-home">
      <div className="bomb-home-scanline" />
      <header className="bomb-home-header">
        <p className="bomb-home-eyebrow">CBT PRO · TACTICAL DIVISION</p>
        <h1 className="bomb-home-title">Bomb Defusal Championship</h1>
        <p className="bomb-home-sub">Every device is armed with real JAMB questions. Answer fast. Answer right. Defuse.</p>
      </header>

      <div className="bomb-home-stats">
        <div className="bomb-home-stat">
          <span className="bomb-home-stat-label">XP</span>
          <span className="bomb-home-stat-value">{progressState.totalXP}</span>
        </div>
        <div className="bomb-home-stat">
          <span className="bomb-home-stat-label">Coins</span>
          <span className="bomb-home-stat-value">{progressState.totalCoins}</span>
        </div>
        <div className="bomb-home-stat">
          <span className="bomb-home-stat-label">Bombs Defused</span>
          <span className="bomb-home-stat-value">{progressState.defused}</span>
        </div>
      </div>

      <ol className="bomb-home-ladder">
        {[...LEAGUES].reverse().map((league) => {
          const status = progressState.leagueStatus[league.id];
          return (
            <li key={league.id} className={`bomb-home-rung bomb-home-rung--${status}`}>
              <button
                className="bomb-home-rung-btn"
                disabled={status === "locked"}
                onClick={() => onSelectLeague(league)}
              >
                <span className="bomb-home-rung-icon">
                  {status === "locked" ? "🔒" : status === "complete" ? "🏆" : status === "current" ? "🟢" : "⭐"}
                </span>
                <span className="bomb-home-rung-name">{league.name}</span>
                <span className="bomb-home-rung-arrow">›</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ============================================================
   SCREEN: MISSION MAP
   ============================================================ */

function MissionMapScreen({ league, missionStatus, onBack, onSelectMission }) {
  const missions = buildMissions(league);
  return (
    <div className="bomb-map">
      <div className="bomb-map-header">
        <button className="bomb-map-back" onClick={onBack}>‹ Leagues</button>
        <h2 className="bomb-map-title">{league.name}</h2>
      </div>

      <div className="bomb-map-path">
        {missions.map((m, i) => {
          const status = missionStatus(league.id, m.index);
          return (
            <React.Fragment key={m.id}>
              <button
                className={`bomb-map-node bomb-map-node--${status} ${m.boss ? "bomb-map-node--boss" : ""}`}
                disabled={status === "locked"}
                onClick={() => onSelectMission(m)}
              >
                <CornerFrame className={m.boss ? "hud-corner--danger" : ""} />
                <span className="bomb-map-node-icon">{m.boss ? "☢" : status === "complete" ? "✓" : "💣"}</span>
                <span className="bomb-map-node-label">{m.boss ? "BOSS" : m.index}</span>
              </button>
              {i < missions.length - 1 && <span className="bomb-map-connector" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: MISSION CARD DETAIL (pre-briefing)
   ============================================================ */

function MissionCardScreen({ mission, onBack, onStart }) {
  return (
    <div className="bomb-card-screen">
      <button className="bomb-card-back" onClick={onBack}>‹ Mission Map</button>
      <div className="bomb-card">
        <CornerFrame className={mission.boss ? "hud-corner--danger" : ""} />
        <p className="bomb-card-eyebrow">{mission.boss ? "BOSS DEVICE" : `MISSION ${mission.index}`}</p>
        <h2 className="bomb-card-name">{mission.name}</h2>
        <p className="bomb-card-bombtype">{mission.bombType}</p>
        <Stars count={mission.difficulty} />

        <div className="bomb-card-grid">
          <div className="bomb-card-stat"><span>Questions</span><strong>{mission.questions}</strong></div>
          <div className="bomb-card-stat"><span>Time</span><strong>{mission.time}s</strong></div>
          <div className="bomb-card-stat"><span>Reward XP</span><strong>{mission.xp}</strong></div>
          <div className="bomb-card-stat"><span>Coins</span><strong>{mission.coins}</strong></div>
        </div>

        <button className="bomb-card-start" onClick={() => onStart(mission)}>Begin Briefing</button>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: BRIEFING
   ============================================================ */

function BriefingScreen({ mission, onStart }) {
  return (
    <div className="bomb-brief">
      <div className="bomb-brief-scanline" />
      <p className="bomb-brief-tag">{mission.boss ? "BOSS MISSION" : `MISSION ${mission.index}`}</p>
      <h2 className="bomb-brief-name">{mission.name}</h2>
      <div className="bomb-brief-rule" />
      <dl className="bomb-brief-list">
        <div className="bomb-brief-row"><dt>Bomb Type</dt><dd>{mission.bombType}</dd></div>
        <div className="bomb-brief-row"><dt>Threat Level</dt><dd className={mission.boss ? "bomb-brief-threat--critical" : "bomb-brief-threat--high"}>{mission.boss ? "CRITICAL" : "HIGH"}</dd></div>
        <div className="bomb-brief-row"><dt>Time Limit</dt><dd>{mission.time} Seconds</dd></div>
        <div className="bomb-brief-row"><dt>Questions</dt><dd>{mission.questions}</dd></div>
        <div className="bomb-brief-row"><dt>Reward</dt><dd>{mission.xp} XP · {mission.coins} Coins</dd></div>
      </dl>
      <div className="bomb-brief-rule" />
      <button className="bomb-brief-start" onClick={onStart}>Press Start</button>
    </div>
  );
}

/* ============================================================
   SCREEN: COUNTDOWN
   ============================================================ */

function CountdownScreen({ onDone }) {
  const [tick, setTick] = useState(3);
  useEffect(() => {
    if (tick === 0) {
      const t = setTimeout(onDone, 550);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTick((v) => v - 1), 750);
    return () => clearTimeout(t);
  }, [tick, onDone]);

  return (
    <div className="bomb-count">
      <div className="bomb-count-flash" key={tick} />
      <span className="bomb-count-number" key={"n" + tick}>{tick === 0 ? "DEFUSE" : tick}</span>
    </div>
  );
}

/* ============================================================
   SCREEN: GAMEPLAY
   ============================================================ */

function DefusalCore({ progress, state }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  return (
    <svg viewBox="0 0 100 100" className={`bomb-play-core bomb-play-core--${state}`}>
      <circle cx="50" cy="50" r={r} className="bomb-play-core-track" />
      <circle
        cx="50" cy="50" r={r}
        className="bomb-play-core-fill"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text x="50" y="55" textAnchor="middle" className="bomb-play-core-text">{Math.round(progress)}%</text>
    </svg>
  );
}

function GameplayScreen({ mission, onFinish }) {
  const [order] = useState(() => shuffle(QUESTION_BANK).slice(0, mission.questions));
  const [qIndex, setQIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(mission.time);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const [selected, setSelected] = useState(null);
  const [floatText, setFloatText] = useState(null);
  const finishedRef = useRef(false);

  const progress = Math.min(100, (correct / mission.questions) * 100);
  const state = coreState(progress);

  const finish = useCallback((outcome) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish({
      outcome,
      correct,
      wrong,
      timeLeft: Math.max(0, timeLeft),
      combo,
      accuracy: mission.questions ? Math.round((correct / (correct + wrong || 1)) * 100) : 0,
    });
  }, [onFinish, correct, wrong, timeLeft, combo, mission.questions]);

  // timer
  useEffect(() => {
    if (finishedRef.current) return;
    if (timeLeft <= 0) { finish("failure"); return; }
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) { clearInterval(t); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft <= 0]); // eslint-disable-line

  useEffect(() => {
    if (timeLeft === 0 && !finishedRef.current) finish("failure");
  }, [timeLeft, finish]);

  useEffect(() => {
    if (lives <= 0 && !finishedRef.current) finish("failure");
  }, [lives, finish]);

  const current = order[qIndex];

  function handleAnswer(i) {
    if (selected !== null || finishedRef.current) return;
    setSelected(i);
    const isCorrect = i === current.a;
    if (isCorrect) {
      setFlash("correct");
      setCombo((c) => c + 1);
      setCorrect((c) => c + 1);
      setTimeLeft((t) => t + 3);
      setFloatText("+3s");
    } else {
      setFlash("wrong");
      setCombo(0);
      setWrong((w) => w + 1);
      setLives((l) => l - 1);
      setTimeLeft((t) => Math.max(0, t - 5));
      setFloatText("-5s");
    }

    setTimeout(() => {
      setFlash(null);
      setFloatText(null);
      setSelected(null);
      if (isCorrect && correct + 1 >= mission.questions) {
        finish("victory");
        return;
      }
      if (qIndex + 1 >= order.length) {
        finish(correct + (isCorrect ? 1 : 0) >= mission.questions ? "victory" : "failure");
        return;
      }
      setQIndex((q) => q + 1);
    }, 620);
  }

  const timerBand =
    timeLeft <= 5 ? "critical" : timeLeft <= 10 ? "flash" : timeLeft <= 20 ? "danger" : timeLeft <= 40 ? "warn" : "normal";

  return (
    <div className={`bomb-play bomb-play--${flash || "idle"}`}>
      <div className="bomb-play-top">
        <div className="bomb-play-lives">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={i < lives ? "bomb-play-life bomb-play-life--on" : "bomb-play-life"}>♥</span>
          ))}
        </div>
        <div className={`bomb-play-timer bomb-play-timer--${timerBand}`}>{String(timeLeft).padStart(2, "0")}s</div>
        <DefusalCore progress={progress} state={state} />
      </div>

      <div className="bomb-play-meta">
        <span className="bomb-play-mission-name">{mission.name}</span>
        <span className="bomb-play-qcount">Question {qIndex + 1}/{order.length}</span>
      </div>

      {combo > 1 && <div className="bomb-play-combo" key={combo}>COMBO x{combo}</div>}
      {floatText && <div className={`bomb-play-float bomb-play-float--${flash}`}>{floatText}</div>}

      <div className="bomb-play-question-wrap">
        <p className="bomb-play-subject">{current.subject}</p>
        <h3 className="bomb-play-question">{current.q}</h3>
      </div>

      <div className="bomb-play-answers">
        {current.options.map((opt, i) => {
          let cls = "bomb-play-answer";
          if (selected !== null) {
            if (i === current.a) cls += " bomb-play-answer--correct";
            else if (i === selected) cls += " bomb-play-answer--wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selected !== null}>
              <span className="bomb-play-answer-letter">{"ABCD"[i]}</span>
              <span className="bomb-play-answer-text">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: VICTORY / FAILURE
   ============================================================ */

function ResultScreen({ mission, result, onContinue, onRetry, onExit }) {
  const isVictory = result.outcome === "victory";
  const stars = isVictory ? (result.accuracy >= 90 ? 3 : result.accuracy >= 70 ? 2 : 1) : 0;

  if (isVictory) {
    return (
      <div className="bomb-victory">
        <div className="bomb-victory-glow" />
        <p className="bomb-victory-tag">MISSION COMPLETE</p>
        <h2 className="bomb-victory-title">Bomb Defused</h2>
        <div className="bomb-victory-stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? "bomb-victory-star bomb-victory-star--on" : "bomb-victory-star"}>★</span>
          ))}
        </div>
        <div className="bomb-victory-stats">
          <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>
          <div><span>Time Left</span><strong>{result.timeLeft}s</strong></div>
          <div><span>Correct</span><strong>{result.correct}</strong></div>
          <div><span>Wrong</span><strong>{result.wrong}</strong></div>
          <div><span>Best Combo</span><strong>x{result.combo}</strong></div>
        </div>
        <div className="bomb-victory-rewards">
          <span className="bomb-victory-reward">+{mission.xp} XP</span>
          <span className="bomb-victory-reward">+{mission.coins} Coins</span>
        </div>
        <button className="bomb-victory-continue" onClick={onContinue}>Continue</button>
      </div>
    );
  }

  return (
    <div className="bomb-fail">
      <div className="bomb-fail-flash" />
      <p className="bomb-fail-tag">MISSION FAILED</p>
      <h2 className="bomb-fail-title">Bomb Exploded</h2>
      <div className="bomb-fail-stats">
        <div><span>Correct</span><strong>{result.correct}</strong></div>
        <div><span>Wrong</span><strong>{result.wrong}</strong></div>
        <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>
      </div>
      <div className="bomb-fail-actions">
        <button className="bomb-fail-retry" onClick={onRetry}>Retry</button>
        <button className="bomb-fail-exit" onClick={onExit}>Exit</button>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */

export function Start() {
  const [screen, setScreen] = useState("leagues"); // leagues | map | card | briefing | countdown | playing | result
  const [league, setLeague] = useState(null);
  const [mission, setMission] = useState(null);
  const [result, setResult] = useState(null);
  const [progressState, setProgressState] = useState({
    totalXP: 0,
    totalCoins: 0,
    defused: 0,
    completedMissions: {}, // "leagueId-index": true
    leagueStatus: {
      rookie: "current", professional: "locked", elite: "locked",
      national: "locked", world: "locked", legend: "locked",
    },
  });

  function missionStatus(leagueId, index) {
    if (progressState.completedMissions[`${leagueId}-${index}`]) return "complete";
    const prevDone = index === 1 || progressState.completedMissions[`${leagueId}-${index - 1}`];
    return prevDone ? "current" : "locked";
  }

  function handleSelectLeague(l) {
    setLeague(l);
    setScreen("map");
  }

  function handleSelectMission(m) {
    setMission(m);
    setScreen("card");
  }

  function handleBeginBriefing() {
    setScreen("briefing");
  }

  function handleStartGame() {
    setScreen("countdown");
  }

  function handleCountdownDone() {
    setScreen("playing");
  }

  function handleFinish(res) {
    setResult(res);
    if (res.outcome === "victory") {
      setProgressState((p) => {
        const key = `${league.id}-${mission.index}`;
        const nextCompleted = { ...p.completedMissions, [key]: true };
        const leagueMissions = buildMissions(league);
        const allDone = leagueMissions.every((m) => nextCompleted[`${league.id}-${m.index}`]);
        const nextStatus = { ...p.leagueStatus };
        if (allDone) {
          nextStatus[league.id] = "complete";
          const idx = LEAGUES.findIndex((l) => l.id === league.id);
          const next = LEAGUES[idx + 1];
          if (next && nextStatus[next.id] === "locked") nextStatus[next.id] = "current";
        }
        return {
          totalXP: p.totalXP + mission.xp,
          totalCoins: p.totalCoins + mission.coins,
          defused: p.defused + 1,
          completedMissions: nextCompleted,
          leagueStatus: nextStatus,
        };
      });
    }
    setScreen("result");
  }

  function handleContinue() {
    setScreen("map");
  }
  function handleRetry() {
    setScreen("briefing");
  }
  function handleExit() {
    setScreen("map");
  }

  return (
    <div className="bomb-root">
      <style>{`
        ${FONT_IMPORT}
        .bomb-root {
          --void: #060A14;
          --panel: #0E1526;
          --panel2: #121B31;
          --line: #1D2A46;
          --cyan: #22D3EE;
          --cyan-dim: #0E7490;
          --danger: #FF4757;
          --success: #2ED573;
          --amber: #FFC048;
          --text: #E7EDF7;
          --text-dim: #7C8AA8;
          font-family: 'Inter', system-ui, sans-serif;
          background: radial-gradient(circle at 50% 0%, #0C1428 0%, var(--void) 60%);
          color: var(--text);
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 20px 16px 40px;
          position: relative;
          overflow-x: hidden;
        }
        .bomb-root * { box-sizing: border-box; }
        .bomb-root button { font-family: inherit; cursor: pointer; border: none; }
        .hud-display { font-family: 'Rajdhani', sans-serif; }
        .hud-mono { font-family: 'Share Tech Mono', monospace; }

        /* corner frame signature element */
        .hud-corner { position: absolute; width: 14px; height: 14px; border: 2px solid var(--cyan); opacity: .75; }
        .hud-corner--tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .hud-corner--tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        .hud-corner--bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        .hud-corner--br { bottom: -1px; right: -1px; border-left: none; border-top: none; }
        .hud-corner--danger { border-color: var(--danger); }

        .hud-stars { display: inline-flex; gap: 2px; }
        .hud-star { color: #2A3455; font-size: 15px; }
        .hud-star--on { color: var(--amber); }

        /* ---------- HOME ---------- */
        .bomb-home { max-width: 480px; margin: 0 auto; position: relative; }
        .bomb-home-header { text-align: center; margin-bottom: 22px; }
        .bomb-home-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2.5px; color: var(--cyan); margin: 0 0 8px; }
        .bomb-home-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 30px; letter-spacing: .5px; margin: 0 0 8px; line-height: 1.1; }
        .bomb-home-sub { color: var(--text-dim); font-size: 13.5px; line-height: 1.5; margin: 0 auto; max-width: 340px; }
        .bomb-home-stats { display: flex; gap: 10px; margin-bottom: 24px; }
        .bomb-home-stat { flex: 1; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 10px 8px; text-align: center; }
        .bomb-home-stat-label { display: block; font-size: 10.5px; color: var(--text-dim); letter-spacing: 1px; margin-bottom: 4px; }
        .bomb-home-stat-value { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; color: var(--cyan); }
        .bomb-home-ladder { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .bomb-home-rung-btn {
          width: 100%; display: flex; align-items: center; gap: 12px;
          background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
          padding: 14px 16px; color: var(--text); text-align: left;
        }
        .bomb-home-rung--locked .bomb-home-rung-btn { opacity: .45; }
        .bomb-home-rung--current .bomb-home-rung-btn { border-color: var(--cyan); box-shadow: 0 0 0 1px var(--cyan), 0 0 18px rgba(34,211,238,.25); }
        .bomb-home-rung--complete .bomb-home-rung-btn { border-color: var(--amber); }
        .bomb-home-rung-icon { font-size: 18px; }
        .bomb-home-rung-name { flex: 1; font-family: 'Rajdhani', sans-serif; font-weight: 600; font-size: 17px; letter-spacing: .3px; }
        .bomb-home-rung-arrow { color: var(--text-dim); }

        /* ---------- MISSION MAP ---------- */
        .bomb-map { max-width: 480px; margin: 0 auto; }
        .bomb-map-header { display: flex; align-items: center; gap: 12px; margin-bottom: 26px; }
        .bomb-map-back { background: none; color: var(--cyan); font-size: 14px; padding: 4px 0; }
        .bomb-map-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 22px; margin: 0; }
        .bomb-map-path { display: flex; flex-direction: column; align-items: center; }
        .bomb-map-node {
          position: relative; width: 76px; height: 76px; border-radius: 18px;
          background: var(--panel); border: 1px solid var(--line);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
        }
        .bomb-map-node--locked { opacity: .35; }
        .bomb-map-node--current { border-color: var(--cyan); box-shadow: 0 0 22px rgba(34,211,238,.35); }
        .bomb-map-node--complete { border-color: var(--success); background: linear-gradient(180deg, rgba(46,213,115,.12), transparent); }
        .bomb-map-node--boss { width: 92px; height: 92px; border-radius: 22px; border-color: var(--danger); }
        .bomb-map-node-icon { font-size: 22px; }
        .bomb-map-node-label { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 12px; color: var(--text-dim); }
        .bomb-map-connector { width: 2px; height: 30px; background: linear-gradient(var(--line), var(--cyan-dim)); }

        /* ---------- MISSION CARD ---------- */
        .bomb-card-screen { max-width: 420px; margin: 0 auto; }
        .bomb-card-back { background: none; color: var(--cyan); font-size: 14px; margin-bottom: 18px; }
        .bomb-card { position: relative; background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 26px 22px; }
        .bomb-card-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: var(--cyan); margin: 0 0 6px; }
        .bomb-card-name { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; margin: 0 0 4px; }
        .bomb-card-bombtype { color: var(--text-dim); font-size: 13.5px; margin: 0 0 10px; }
        .bomb-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        .bomb-card-stat { background: var(--panel2); border-radius: 10px; padding: 10px 12px; }
        .bomb-card-stat span { display: block; font-size: 11px; color: var(--text-dim); margin-bottom: 3px; }
        .bomb-card-stat strong { font-family: 'Rajdhani', sans-serif; font-size: 18px; }
        .bomb-card-start { width: 100%; padding: 15px; border-radius: 12px; background: var(--cyan); color: #04141C; font-weight: 700; font-family: 'Rajdhani', sans-serif; font-size: 16px; letter-spacing: .5px; }

        /* ---------- BRIEFING ---------- */
        .bomb-brief { max-width: 420px; margin: 60px auto 0; text-align: center; position: relative; }
        .bomb-brief-scanline { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(34,211,238,.04) 0px, transparent 2px, transparent 4px); pointer-events: none; }
        .bomb-brief-tag { font-family: 'Share Tech Mono', monospace; color: var(--danger); letter-spacing: 3px; font-size: 12px; margin: 0 0 10px; }
        .bomb-brief-name { font-family: 'Rajdhani', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 16px; }
        .bomb-brief-rule { height: 1px; background: linear-gradient(90deg, transparent, var(--line), transparent); margin: 18px 0; }
        .bomb-brief-list { margin: 0; }
        .bomb-brief-row { display: flex; justify-content: space-between; padding: 9px 4px; border-bottom: 1px dashed var(--line); font-size: 14px; }
        .bomb-brief-row dt { color: var(--text-dim); }
        .bomb-brief-row dd { margin: 0; font-family: 'Rajdhani', sans-serif; font-weight: 700; }
        .bomb-brief-threat--high { color: var(--amber); }
        .bomb-brief-threat--critical { color: var(--danger); }
        .bomb-brief-start { margin-top: 10px; width: 100%; padding: 16px; border-radius: 12px; background: var(--danger); color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 17px; letter-spacing: 1px; }

        /* ---------- COUNTDOWN ---------- */
        .bomb-count { position: fixed; inset: 0; background: var(--void); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .bomb-count-flash { position: absolute; inset: 0; background: var(--cyan); opacity: 0; animation: bombFlash .5s ease-out; }
        @keyframes bombFlash { 0% { opacity: .35; } 100% { opacity: 0; } }
        .bomb-count-number { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 88px; color: var(--cyan); text-shadow: 0 0 40px rgba(34,211,238,.6); animation: bombPop .5s ease; }
        @keyframes bombPop { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }

        /* ---------- GAMEPLAY ---------- */
        .bomb-play { max-width: 480px; margin: 0 auto; transition: background .2s; border-radius: 20px; padding: 4px; }
        .bomb-play--correct { animation: bombPulseGood .5s ease; }
        .bomb-play--wrong { animation: bombShake .4s ease; }
        @keyframes bombPulseGood { 0% { box-shadow: 0 0 0 0 rgba(46,213,115,.5); } 100% { box-shadow: 0 0 0 20px rgba(46,213,115,0); } }
        @keyframes bombShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        .bomb-play-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
        .bomb-play-lives { display: flex; gap: 4px; font-size: 18px; }
        .bomb-play-life { color: #2A3455; }
        .bomb-play-life--on { color: var(--danger); }
        .bomb-play-timer { font-family: 'Share Tech Mono', monospace; font-size: 22px; padding: 4px 10px; border-radius: 8px; background: var(--panel); border: 1px solid var(--line); }
        .bomb-play-timer--normal { color: var(--text); }
        .bomb-play-timer--warn { color: var(--amber); }
        .bomb-play-timer--danger { color: #FF7A5C; }
        .bomb-play-timer--flash, .bomb-play-timer--critical { color: var(--danger); animation: bombTimerFlash .5s infinite; }
        @keyframes bombTimerFlash { 50% { opacity: .3; } }
        .bomb-play-core { width: 52px; height: 52px; transform: rotate(-90deg); }
        .bomb-play-core-track { fill: none; stroke: var(--line); stroke-width: 8; }
        .bomb-play-core-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset .4s ease; }
        .bomb-play-core--primary .bomb-play-core-fill { stroke: var(--cyan); }
        .bomb-play-core--warn .bomb-play-core-fill { stroke: var(--amber); }
        .bomb-play-core--success .bomb-play-core-fill { stroke: var(--success); }
        .bomb-play-core-text { transform: rotate(90deg) translate(0,0); transform-origin: 50px 50px; font-size: 20px; fill: var(--text); font-family: 'Share Tech Mono', monospace; }
        .bomb-play-meta { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-dim); margin: 10px 2px 16px; }
        .bomb-play-mission-name { font-weight: 600; color: var(--text); }
        .bomb-play-combo { position: relative; text-align: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; color: var(--cyan); letter-spacing: 1px; margin-bottom: 8px; animation: bombComboPop .5s ease; }
        @keyframes bombComboPop { 0% { transform: translateY(6px) scale(.8); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        .bomb-play-float { text-align: center; font-family: 'Share Tech Mono', monospace; font-size: 14px; margin-bottom: 8px; animation: bombFloatUp .6s ease forwards; }
        .bomb-play-float--correct { color: var(--success); }
        .bomb-play-float--wrong { color: var(--danger); }
        @keyframes bombFloatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-14px); opacity: 0; } }
        .bomb-play-question-wrap { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 22px 18px; margin-bottom: 18px; min-height: 96px; }
        .bomb-play-subject { font-size: 11px; letter-spacing: 1.5px; color: var(--cyan); margin: 0 0 8px; text-transform: uppercase; }
        .bomb-play-question { font-family: 'Rajdhani', sans-serif; font-weight: 600; font-size: 19px; line-height: 1.35; margin: 0; }
        .bomb-play-answers { display: flex; flex-direction: column; gap: 10px; }
        .bomb-play-answer { display: flex; align-items: center; gap: 12px; width: 100%; padding: 15px 16px; border-radius: 12px; background: var(--panel); border: 1px solid var(--line); color: var(--text); font-size: 15px; text-align: left; }
        .bomb-play-answer-letter { width: 26px; height: 26px; flex-shrink: 0; border-radius: 7px; background: var(--panel2); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; color: var(--cyan); font-size: 13px; }
        .bomb-play-answer--correct { border-color: var(--success); background: rgba(46,213,115,.12); }
        .bomb-play-answer--wrong { border-color: var(--danger); background: rgba(255,71,87,.12); }

        /* ---------- VICTORY ---------- */
        .bomb-victory { max-width: 420px; margin: 40px auto 0; text-align: center; position: relative; }
        .bomb-victory-glow { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 260px; height: 260px; background: radial-gradient(circle, rgba(46,213,115,.28), transparent 70%); pointer-events: none; }
        .bomb-victory-tag { font-family: 'Share Tech Mono', monospace; color: var(--success); letter-spacing: 3px; font-size: 12px; margin: 0 0 8px; position: relative; }
        .bomb-victory-title { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; margin: 0 0 14px; position: relative; }
        .bomb-victory-stars { font-size: 30px; margin-bottom: 20px; position: relative; }
        .bomb-victory-star { color: #2A3455; margin: 0 3px; }
        .bomb-victory-star--on { color: var(--amber); text-shadow: 0 0 14px rgba(255,192,72,.6); }
        .bomb-victory-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; position: relative; }
        .bomb-victory-stats div { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
        .bomb-victory-stats span { display: block; font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
        .bomb-victory-stats strong { font-family: 'Rajdhani', sans-serif; font-size: 18px; }
        .bomb-victory-rewards { display: flex; justify-content: center; gap: 12px; margin-bottom: 22px; position: relative; }
        .bomb-victory-reward { background: rgba(46,213,115,.12); border: 1px solid var(--success); color: var(--success); padding: 8px 14px; border-radius: 20px; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; }
        .bomb-victory-continue { width: 100%; padding: 16px; border-radius: 12px; background: var(--success); color: #04180C; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; position: relative; }

        /* ---------- FAILURE ---------- */
        .bomb-fail { max-width: 420px; margin: 60px auto 0; text-align: center; position: relative; }
        .bomb-fail-flash { position: absolute; inset: -40px; background: radial-gradient(circle, rgba(255,71,87,.25), transparent 65%); animation: bombFailPulse 1.2s ease infinite; pointer-events: none; }
        @keyframes bombFailPulse { 50% { opacity: .5; } }
        .bomb-fail-tag { font-family: 'Share Tech Mono', monospace; color: var(--danger); letter-spacing: 3px; font-size: 12px; margin: 0 0 8px; position: relative; }
        .bomb-fail-title { font-family: 'Rajdhani', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 20px; position: relative; }
        .bomb-fail-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 24px; position: relative; }
        .bomb-fail-stats div { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px 6px; }
        .bomb-fail-stats span { display: block; font-size: 10.5px; color: var(--text-dim); margin-bottom: 4px; }
        .bomb-fail-stats strong { font-family: 'Rajdhani', sans-serif; font-size: 17px; }
        .bomb-fail-actions { display: flex; gap: 10px; position: relative; }
        .bomb-fail-retry { flex: 1; padding: 15px; border-radius: 12px; background: var(--danger); color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15px; }
        .bomb-fail-exit { flex: 1; padding: 15px; border-radius: 12px; background: var(--panel); border: 1px solid var(--line); color: var(--text); font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15px; }
      `}</style>

      {screen === "leagues" && (
        <LeagueScreen progressState={progressState} onSelectLeague={handleSelectLeague} />
      )}
      {screen === "map" && league && (
        <MissionMapScreen
          league={league}
          missionStatus={missionStatus}
          onBack={() => setScreen("leagues")}
          onSelectMission={handleSelectMission}
        />
      )}
      {screen === "card" && mission && (
        <MissionCardScreen mission={mission} onBack={() => setScreen("map")} onStart={handleBeginBriefing} />
      )}
      {screen === "briefing" && mission && (
        <BriefingScreen mission={mission} onStart={handleStartGame} />
      )}
      {screen === "countdown" && <CountdownScreen onDone={handleCountdownDone} />}
      {screen === "playing" && mission && (
        <GameplayScreen mission={mission} onFinish={handleFinish} />
      )}
      {screen === "result" && mission && result && (
        <ResultScreen
          mission={mission}
          result={result}
          onContinue={handleContinue}
          onRetry={handleRetry}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
