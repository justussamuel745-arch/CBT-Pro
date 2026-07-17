import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from 'react-router';
import { useGameContext } from '../../../context/GameContext';
import './Start.css';

/* ============================================================
   BOMB DEFUSAL CHAMPIONSHIP — CBT Pro (Per-League Timing)
   Same light "Reactor Core" HUD structure as before.

   UPDATE (this revision):
   - Each question's time limit is fixed by LEAGUE, not by
     answer streaks: Rookie 60s, Professional 90s, Elite 120s,
     National 150s, World 180s, Legend 210s (+30s per league).
   - Correct/wrong answers no longer add or remove time.
     A wrong answer (or a question timing out) only costs
     25% Bomb Stability, same as before. 0% stability = explosion.
   - League screen now has a link back to Subject Selection.
   ============================================================ */

/* ---------- Data ---------- */

const QUESTION_BANK = [
  { subject: "Mathematics", topic: "Linear Equations", note: "Isolate the unknown by applying inverse operations to both sides.", q: "If 2x + 5 = 17, what is the value of x?", options: ["4", "5", "6", "7"], a: 2 },
  { subject: "Mathematics", topic: "Trigonometry", note: "Recall the standard sine values for common angles (0°, 30°, 45°, 60°, 90°).", q: "What is the value of sin 30°?", options: ["1/2", "√3/2", "1", "0"], a: 0 },
  { subject: "Mathematics", topic: "Algebraic Simplification", note: "Expand the bracket first, then collect like terms.", q: "Simplify: 3(2x - 4) + 5", options: ["6x - 7", "6x - 12", "6x + 5", "6x - 17"], a: 0 },
  { subject: "English", topic: "Spelling", note: "Watch for commonly misspelt double-consonant words.", q: "Choose the correctly spelt word.", options: ["Occassion", "Occasion", "Ocasion", "Occaision"], a: 1 },
  { subject: "English", topic: "Synonyms & Antonyms", note: "Look for the word closest in meaning to 'plentiful'.", q: "Identify the synonym of 'Abundant'.", options: ["Scarce", "Plentiful", "Empty", "Rare"], a: 1 },
  { subject: "English", topic: "Lexis & Structure", note: "Subject-verb agreement: 'She' takes the singular verb form.", q: "'She ___ to school every day.' Fill the gap.", options: ["go", "goes", "going", "gone"], a: 1 },
  { subject: "Physics", topic: "Electricity", note: "The base SI unit for current is named after André-Marie Ampère.", q: "The SI unit of electric current is the:", options: ["Volt", "Ohm", "Ampere", "Watt"], a: 2 },
  { subject: "Physics", topic: "Newton's Laws", note: "Force equals mass multiplied by acceleration — F = ma.", q: "Which law states that force equals mass times acceleration?", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravitation"], a: 1 },
  { subject: "Chemistry", topic: "Periodic Table", note: "Sodium's symbol comes from its Latin name, Natrium.", q: "What is the chemical symbol for Sodium?", options: ["So", "Sd", "Na", "S"], a: 2 },
  { subject: "Chemistry", topic: "Acids, Bases & Salts", note: "A neutral solution sits exactly in the middle of the pH scale.", q: "The pH of a neutral solution at 25°C is:", options: ["0", "7", "14", "1"], a: 1 },
  { subject: "Biology", topic: "Cell Structure", note: "This organelle generates most of the cell's ATP through respiration.", q: "The powerhouse of the cell is the:", options: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi body"], a: 2 },
  { subject: "Biology", topic: "Nutrition in Plants", note: "Chlorophyll, needed for photosynthesis, is concentrated in leaf cells.", q: "Photosynthesis mainly occurs in the plant's:", options: ["Roots", "Stem", "Leaves", "Flowers"], a: 2 },
  { subject: "Geography", topic: "Regional Geography", note: "This river runs through Niger, Guinea, Mali and Nigeria before reaching the Atlantic.", q: "Which is the longest river in Nigeria?", options: ["Benue", "Niger", "Kaduna", "Cross River"], a: 1 },
  { subject: "Economics", topic: "Demand & Supply", note: "Demand curves slope downward: price and quantity demanded move oppositely.", q: "The law of demand states that as price rises, quantity demanded:", options: ["Rises", "Falls", "Stays constant", "Doubles"], a: 1 },
  { subject: "Government", topic: "Organs of Government", note: "Law-making is constitutionally assigned to the parliament/assembly.", q: "The arm of government responsible for making laws is the:", options: ["Executive", "Judiciary", "Legislature", "Civil Service"], a: 2 },
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

const HINTS = [
  { id: "freeze", label: "Freeze", icon: "fa-snowflake", desc: "Pause the timer for 8s" },
  { id: "review", label: "Topic", icon: "fa-book-open", desc: "Reveal the topic & a quick note" },
  { id: "fifty", label: "50:50", icon: "fa-percent", desc: "Remove two wrong options" },
  { id: "addTime", label: "+20s", icon: "fa-clock", desc: "Add 20 seconds to this question" },
];

/* ============================================================
   LEAGUE QUESTION TIME – THE KEY LINE
   60s for Rookie (tier 1), +30s per tier.
   Tier 2 = 90s, Tier 3 = 120s, ..., Tier 6 = 210s.
   ============================================================ */
function leagueQuestionTime(tier) {
  return 60 + (tier - 1) * 30;
}

function buildMissions(league) {
  const count = 5;
  const questionTime = leagueQuestionTime(league.tier);
  return Array.from({ length: count }).map((_, i) => {
    const isBoss = i === count - 1;
    return {
      id: `${league.id}-m${i + 1}`,
      index: i + 1,
      name: isBoss ? "Boss Bomb" : `Mission ${i + 1}`,
      bombType: isBoss ? "Nuclear Core" : BOMB_TYPES[i % BOMB_TYPES.length],
      difficulty: Math.min(5, league.tier + i - 2 < 1 ? 1 : league.tier + Math.floor(i / 2)),
      questions: isBoss ? 10 : 6 + i,
      questionTime,
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

function starsFromStability(stability) {
  if (stability >= 100) return 3;
  if (stability >= 50) return 2;
  if (stability > 0) return 1;
  return 0;
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

function coreState(progress) {
  if (progress >= 80) return "success";
  if (progress >= 40) return "warn";
  return "primary";
}

/* ============================================================
   SCREEN: HOME / LEAGUE SELECT
   Includes the "Subject Selection" back button
   ============================================================ */

function LeagueScreen({ progressState, onSelectLeague, onBackToSubjects }) {
  return (
    <div className="bomb-home">
      <div className="bomb-home-scanline" />

      {/* ========== BACK TO SUBJECT SELECTION ========== */}
      <button className="bomb-home-back" onClick={() => onBackToSubjects && onBackToSubjects()}>
        <i className="fa-solid fa-arrow-left" /> Subject Selection
      </button>

      <header className="bomb-home-header">
        <p className="bomb-home-eyebrow">CBT PRO · TACTICAL DIVISION</p>
        <h1 className="bomb-home-title">Bomb Defusal Championship</h1>
        <p className="bomb-home-sub">Every device is armed with real JAMB questions. Higher leagues give you more time per question — but every miss still costs stability.</p>
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
                {/* Show per‑question time right on the league row */}
                <span className="bomb-home-rung-time hud-mono">{leagueQuestionTime(league.tier)}s / Q</span>
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
          <div className="bomb-card-stat"><span>Time / Question</span><strong>{mission.questionTime}s</strong></div>
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
        <div className="bomb-brief-row"><dt>Time / Question</dt><dd>{mission.questionTime} Seconds</dd></div>
        <div className="bomb-brief-row"><dt>Questions</dt><dd>{mission.questions}</dd></div>
        <div className="bomb-brief-row"><dt>Stability</dt><dd>100% · -25% per miss</dd></div>
        <div className="bomb-brief-row"><dt>Reward</dt><dd>{mission.xp} XP · {mission.coins} Coins</dd></div>
      </dl>
      <div className="bomb-brief-rule" />
      <p className="bomb-brief-hints-label hud-mono">AVAILABLE HINTS</p>
      <div className="bomb-brief-hints">
        {HINTS.map((h) => (
          <div className="bomb-brief-hint" key={h.id}>
            <span className="bomb-brief-hint-icon"><i className={`fa-solid ${h.icon}`} /></span>
            <span className="bomb-brief-hint-label">{h.label}</span>
          </div>
        ))}
      </div>
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
   Each question has its own fixed timer (set by league). No time
   is added or removed for correct/wrong answers — only Bomb
   Stability changes (-25% per wrong answer OR per timeout).
   Fail condition: stability hits 0%. Win: finish every question.
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

function StabilityMeter({ stability, shake }) {
  const state = stability >= 75 ? "success" : stability >= 50 ? "warn" : "danger";
  return (
    <div className={`bomb-play-stability bomb-play-stability--${state} ${shake ? "bomb-play-stability--hit" : ""}`}>
      <div className="bomb-play-stability-bar">
        {[0, 1, 2, 3].map((s) => (
          <span
            key={s}
            className={`bomb-play-stability-seg ${stability > s * 25 ? "bomb-play-stability-seg--on" : ""}`}
          />
        ))}
      </div>
      <span className="bomb-play-stability-label hud-mono">
        <i className="fa-solid fa-triangle-exclamation" /> {stability}% STABILITY
      </span>
    </div>
  );
}

function HintBar({ hintsUsed, onUse, disabled }) {
  return (
    <div className="bomb-play-hints">
      {HINTS.map((h) => {
        const used = hintsUsed[h.id];
        return (
          <button
            key={h.id}
            className={`bomb-play-hint ${used ? "bomb-play-hint--used" : ""}`}
            disabled={used || disabled}
            onClick={() => onUse(h.id)}
            title={h.desc}
          >
            <span className="bomb-play-hint-icon"><i className={`fa-solid ${h.icon}`} /></span>
            <span className="bomb-play-hint-label">{h.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReviewModal({ current, onClose }) {
  return (
    <div className="bomb-play-modal-backdrop" onClick={onClose}>
      <div className="bomb-play-modal" onClick={(e) => e.stopPropagation()}>
        <button className="bomb-play-modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        <span className="bomb-play-modal-icon"><i className="fa-solid fa-book-open" /></span>
        <p className="bomb-play-modal-eyebrow hud-mono">TOPIC REVIEW</p>
        <h3 className="bomb-play-modal-topic">{current.topic}</h3>
        <p className="bomb-play-modal-note">{current.note}</p>
        <button className="bomb-play-modal-ok" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

function GameplayScreen({ mission, onFinish }) {
  const [order] = useState(() => shuffle(QUESTION_BANK).slice(0, mission.questions));
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(mission.questionTime);
  const [stability, setStability] = useState(100);
  const [stabilityHit, setStabilityHit] = useState(false);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const [selected, setSelected] = useState(null); // -1 = timed out
  const [floatText, setFloatText] = useState(null);
  const [frozenTicks, setFrozenTicks] = useState(0);
  const [eliminated, setEliminated] = useState([]);
  const [hintsUsed, setHintsUsed] = useState({ freeze: false, review: false, fifty: false, addTime: false });
  const [showReview, setShowReview] = useState(false);
  const finishedRef = useRef(false);
  const selectedRef = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const progress = Math.min(100, (answered / mission.questions) * 100);
  const state = coreState(progress);
  const current = order[qIndex];

  const finish = useCallback((outcome) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish({
      outcome,
      correct,
      wrong,
      combo,
      stability,
      accuracy: correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0,
    });
  }, [onFinish, correct, wrong, combo, stability]);

  // only fail condition now: stability hits zero
  useEffect(() => {
    if (stability <= 0 && !finishedRef.current) finish("failure");
  }, [stability, finish]);

  // reset per question
  useEffect(() => {
    setEliminated([]);
    setTimeLeft(mission.questionTime);
  }, [qIndex, mission.questionTime]);

  // per-question countdown (fresh interval each question)
  useEffect(() => {
    const t = setInterval(() => {
      if (finishedRef.current || selectedRef.current !== null) return;
      setFrozenTicks((f) => {
        if (f > 0) return f - 1;
        setTimeLeft((v) => Math.max(0, v - 1));
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [qIndex]);

  // a question timing out counts the same as a wrong answer
  useEffect(() => {
    if (timeLeft === 0 && selectedRef.current === null && !finishedRef.current) {
      handleTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function endQuestion(nextAnswered) {
    setTimeout(() => {
      if (finishedRef.current) return;
      setFlash(null);
      setFloatText(null);
      setSelected(null);
      if (nextAnswered >= order.length) {
        finish("victory");
        return;
      }
      setQIndex((q) => q + 1);
    }, 700);
  }

  function handleTimeout() {
    if (finishedRef.current || selectedRef.current !== null) return;
    setSelected(-1);
    setFlash("wrong");
    setCombo(0);
    setWrong((w) => w + 1);
    setStability((s) => Math.max(0, s - 25));
    setStabilityHit(true);
    setTimeout(() => setStabilityHit(false), 500);
    setFloatText("Time's up!");
    const nextAnswered = answered + 1;
    setAnswered(nextAnswered);
    endQuestion(nextAnswered);
  }

  function handleAnswer(i) {
    if (selected !== null || finishedRef.current) return;
    setSelected(i);
    const isCorrect = i === current.a;
    const nextAnswered = answered + 1;

    if (isCorrect) {
      setFlash("correct");
      setCombo((c) => c + 1);
      setCorrect((c) => c + 1);
    } else {
      setFlash("wrong");
      setCombo(0);
      setWrong((w) => w + 1);
      setStability((s) => Math.max(0, s - 25));
      setStabilityHit(true);
      setTimeout(() => setStabilityHit(false), 500);
    }
    setAnswered(nextAnswered);
    endQuestion(nextAnswered);
  }

  function useHint(id) {
    if (hintsUsed[id] || finishedRef.current || selected !== null) return;
    setHintsUsed((h) => ({ ...h, [id]: true }));
    if (id === "freeze") {
      setFrozenTicks((f) => f + 8);
    } else if (id === "addTime") {
      setTimeLeft((t) => t + 20);
      setFloatText("+20s");
      setTimeout(() => setFloatText(null), 900);
    } else if (id === "fifty") {
      const wrongIdx = current.options.map((_, i) => i).filter((i) => i !== current.a);
      setEliminated(shuffle(wrongIdx).slice(0, 2));
    } else if (id === "review") {
      setShowReview(true);
    }
  }

  const timerBand =
    timeLeft <= 5 ? "critical" : timeLeft <= 10 ? "flash" : timeLeft <= 20 ? "danger" : timeLeft <= 40 ? "warn" : "normal";

  return (
    <div className={`bomb-play bomb-play--${flash || "idle"}`}>
      <div className="bomb-play-top">
        <div className="bomb-play-qtotal">
          <span className="bomb-play-qtotal-label">Progress</span>
          <span className="bomb-play-qtotal-value">{answered}/{order.length}</span>
        </div>
        <div className={`bomb-play-timer bomb-play-timer--${timerBand} ${frozenTicks > 0 ? "bomb-play-timer--frozen" : ""}`}>
          {frozenTicks > 0 ? <i className="fa-solid fa-snowflake bomb-play-timer-freezeicon" /> : null}
          {String(timeLeft).padStart(2, "0")}s
        </div>
        <DefusalCore progress={progress} state={state} />
      </div>

      <StabilityMeter stability={stability} shake={stabilityHit} />

      <div className="bomb-play-meta">
        <span className="bomb-play-mission-name">{mission.name}</span>
        <span className="bomb-play-qcount">Question {qIndex + 1}/{order.length}</span>
      </div>

      {combo > 1 && <div className="bomb-play-combo" key={combo}>COMBO x{combo}</div>}
      {floatText && <div className={`bomb-play-float bomb-play-float--${flash === "wrong" ? "wrong" : "hint"}`}>{floatText}</div>}

      <div className="bomb-play-question-wrap">
        <p className="bomb-play-subject">{current.subject}</p>
        <h3 className="bomb-play-question">{current.q}</h3>
      </div>

      <HintBar hintsUsed={hintsUsed} onUse={useHint} disabled={selected !== null} />

      <div className="bomb-play-answers">
        {current.options.map((opt, i) => {
          const isEliminated = eliminated.includes(i);
          let cls = "bomb-play-answer";
          if (isEliminated) cls += " bomb-play-answer--eliminated";
          if (selected !== null) {
            if (i === current.a) cls += " bomb-play-answer--correct";
            else if (i === selected) cls += " bomb-play-answer--wrong";
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null || isEliminated}
            >
              <span className="bomb-play-answer-letter">{"ABCD"[i]}</span>
              <span className="bomb-play-answer-text">{isEliminated ? "Removed" : opt}</span>
            </button>
          );
        })}
      </div>

      {showReview && <ReviewModal current={current} onClose={() => setShowReview(false)} />}
    </div>
  );
}

/* ============================================================
   SCREEN: VICTORY / FAILURE
   ============================================================ */

function ResultScreen({ mission, result, onContinue, onRetry, onExit }) {
  const isVictory = result.outcome === "victory";
  const stars = starsFromStability(result.stability);

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
          <div><span>Stability Left</span><strong>{result.stability}%</strong></div>
          <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>
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
        <div><span>Stability</span><strong>{result.stability}%</strong></div>
        <div><span>Correct</span><strong>{result.correct}</strong></div>
        <div><span>Wrong</span><strong>{result.wrong}</strong></div>
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
   Pass onBackToSubjects to wire the league screen's back link
   to your subject-selection route/component.
   ============================================================ */

export function Start() {
  const [screen, setScreen] = useState("leagues");
  const [league, setLeague] = useState(null);
  const [mission, setMission] = useState(null);
  const [result, setResult] = useState(null);
  const [progressState, setProgressState] = useState({
    totalXP: 0,
    totalCoins: 0,
    defused: 0,
    completedMissions: {},
    leagueStatus: {
      rookie: "current", professional: "locked", elite: "locked",
      national: "locked", world: "locked", legend: "locked",
    },
  });
  
  console.log(progressState);
  
  const [searchParams] = useSearchParams()
  const subject = searchParams.get('subject')
  const navigate = useNavigate()
  
  console.log(subject);

  function missionStatus(leagueId, index) {
    if (progressState.completedMissions[`${leagueId}-${index}`]) return "complete";
    const prevDone = index === 1 || progressState.completedMissions[`${leagueId}-${index - 1}`];
    return prevDone ? "current" : "locked";
  }

  function handleSelectLeague(l) { setLeague(l); setScreen("map"); }
  function handleSelectMission(m) { setMission(m); setScreen("card"); }
  function handleBeginBriefing() { setScreen("briefing"); }
  function handleStartGame() { setScreen("countdown"); }
  function handleCountdownDone() { setScreen("playing"); }

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

  function handleContinue() { setScreen("map"); }
  function handleRetry() { setScreen("briefing"); }
  function handleExit() { setScreen("map"); }
  
  function onBackToSubjects() { navigate('/game/bomb-defusal')  }

  return (
    <div className="bomb-root">
      
      {screen === "leagues" && (
        <LeagueScreen progressState={progressState} onSelectLeague={handleSelectLeague} onBackToSubjects={onBackToSubjects} />
      )}
      {screen === "map" && league && (
        <MissionMapScreen league={league} missionStatus={missionStatus} onBack={() => setScreen("leagues")} onSelectMission={handleSelectMission} />
      )}
      {screen === "card" && mission && (
        <MissionCardScreen mission={mission} onBack={() => setScreen("map")} onStart={handleBeginBriefing} />
      )}
      {screen === "briefing" && mission && <BriefingScreen mission={mission} onStart={handleStartGame} />}
      {screen === "countdown" && <CountdownScreen onDone={handleCountdownDone} />}
      {screen === "playing" && mission && <GameplayScreen mission={mission} onFinish={handleFinish} />}
      {screen === "result" && mission && result && (
        <ResultScreen mission={mission} result={result} onContinue={handleContinue} onRetry={handleRetry} onExit={handleExit} />
      )}
    </div>
  );
}