import { useState, useEffect, useRef, memo } from 'react';
import { Ic } from '../../scripts/utilis/Ic';
import { useToast } from '../NotificationSystem';

/*
  ADD THIS IN THE NAV
  <div className={`settings-nav-item ${activeTab === 'readaloud' ? 'active' : ''}`} onClick={() => setActiveTab('readaloud')}>
    <span className="settings-nav-icon"><Ic.Volume /></span> Read Aloud
  </div>
*/

export const Audio = memo(function Audio({ activeTab }) {
  const toast = useToast();
  const [voices, setVoices] = useState([]);
  const [readAloud, setReadAloud] = useState({
    enabled: true,
    voiceURI: '',
    rate: 1,
    pitch: 1,
    volume: 1,
  });
  const [testSpeaking, setTestSpeaking] = useState(false);
  const pendingUtterRef = useRef(null);

  // ── Load + dedupe voices ──
  useEffect(() => {
    function loadVoices() {
      const raw = window.speechSynthesis?.getVoices().filter(v => v.localService) || [];
      // De-dupe: Android/Chrome often list the same voice twice (local + network)
      const seen = new Set();
      const deduped = raw.filter(v => {
        const key = `${v.name}-${v.lang}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setVoices(deduped);
      setReadAloud(p => (p.voiceURI ? p : { ...p, voiceURI: deduped[0]?.voiceURI || '' }));
    }
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  function updateReadAloud(key, value) {
    setReadAloud(p => ({ ...p, [key]: value }));
  }

  function speakNow() {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance('This is a test of your read aloud voice settings.');
    const chosen = voices.find(v => v.voiceURI === readAloud.voiceURI);

    if (chosen) {
      utter.voice = chosen;
      utter.lang = chosen.lang;
    }
    utter.rate = readAloud.rate;
    utter.pitch = readAloud.pitch;
    utter.volume = readAloud.volume;

    utter.onstart = () => setTestSpeaking(true);
    utter.onend = () => setTestSpeaking(false);
    utter.onerror = (e) => {
      setTestSpeaking(false);
      // 'interrupted'/'canceled' fire from our own cancel() calls — not real errors
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        toast.push({
          type: 'error',
          title: 'Playback failed',
          message: chosen
            ? `Could not play "${chosen.name}". Try a different voice.`
            : 'Could not play the selected voice.',
        });
      }
    };

    pendingUtterRef.current = utter;
    synth.speak(utter);
  }

  function testVoice() {
    const synth = window.speechSynthesis;
    if (!synth) {
      toast.push({ type: 'error', title: 'Not supported', message: 'Your browser does not support speech synthesis.' });
      return;
    }

    synth.resume(); // clears any stuck "paused" state

    if (synth.speaking || synth.pending) {
      // Something's already playing (e.g. rapid re-click) — cancel is async under the hood,
      // so give the engine one tick before queuing the new utterance to avoid it being dropped.
      synth.cancel();
      setTimeout(speakNow, 30);
    } else {
      // Nothing playing — speak instantly, no delay.
      speakNow();
    }
  }

  return (
    <>
      {/* ════════════ READ ALOUD TAB ════════════ */}
      <div className={`settings-content ${activeTab === 'readaloud' ? 'active' : ''}`}>
        <div className="settings-card">
          <h3 className="settings-card-title">
            <span className="settings-card-title-icon"><Ic.Volume /></span>
            Read Aloud
          </h3>
          <p className="settings-card-desc">Customize how content is read aloud to you</p>

          {/* Enable toggle */}
          <div className="settings-toggle-row">
            <div className="settings-toggle-info">
              <div className="settings-toggle-title">Read Options</div>
              <div className="settings-toggle-desc">Turn read-aloud on or off across the app</div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={readAloud.enabled}
                onChange={() => updateReadAloud('enabled', !readAloud.enabled)}
              />
              <span className="settings-switch-track" />
            </label>
          </div>

          <div className="settings-section-divider">
            <span className="settings-section-divider-label">Voice</span>
          </div>

          {/* Voice select */}
          <div className="settings-form-group">
            <label className="settings-form-label">Voice</label>
            <select
              className="settings-form-select"
              value={readAloud.voiceURI}
              onChange={e => updateReadAloud('voiceURI', e.target.value)}
              disabled={!readAloud.enabled}
            >
              {voices.length === 0 && <option value="">No voices available</option>}
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}){!v.localService ? ' — online' : ''}
                </option>
              ))}
            </select>
            {voices.length === 0 && (
              <p className="settings-form-hint">
                No voices detected yet. Some browsers load voices asynchronously — try reopening this tab.
              </p>
            )}
          </div>

          <div className="settings-section-divider">
            <span className="settings-section-divider-label">Playback</span>
          </div>

          {/* Speed */}
          <div className="settings-slider-row">
            <div className="settings-slider-label-row">
              <label className="settings-form-label" style={{ marginBottom: 0 }}>Speech Speed</label>
              <span className="settings-slider-value">{readAloud.rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              className="settings-slider"
              min="0.5" max="2" step="0.1"
              value={readAloud.rate}
              onChange={e => updateReadAloud('rate', parseFloat(e.target.value))}
              disabled={!readAloud.enabled}
            />
          </div>

          {/* Pitch */}
          <div className="settings-slider-row">
            <div className="settings-slider-label-row">
              <label className="settings-form-label" style={{ marginBottom: 0 }}>Pitch</label>
              <span className="settings-slider-value">{readAloud.pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              className="settings-slider"
              min="0" max="2" step="0.1"
              value={readAloud.pitch}
              onChange={e => updateReadAloud('pitch', parseFloat(e.target.value))}
              disabled={!readAloud.enabled}
            />
          </div>

          {/* Volume */}
          <div className="settings-slider-row">
            <div className="settings-slider-label-row">
              <label className="settings-form-label" style={{ marginBottom: 0 }}>Volume</label>
              <span className="settings-slider-value">{Math.round(readAloud.volume * 100)}%</span>
            </div>
            <input
              type="range"
              className="settings-slider"
              min="0" max="1" step="0.05"
              value={readAloud.volume}
              onChange={e => updateReadAloud('volume', parseFloat(e.target.value))}
              disabled={!readAloud.enabled}
            />
          </div>

          <div className="settings-button-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={testVoice}
              disabled={!readAloud.enabled}
              style={{ pointerEvents: 'auto', opacity: !readAloud.enabled ? '0.5' : '1' }}
            >
              {testSpeaking
                ? <span className="settings-btn-loading"><span className="settings-spinner" />Speaking…</span>
                : <><Ic.Volume /> Test Voice</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

/*
  CSS
  
   ── Read Aloud sliders ── 
.settings-slider-row {
  margin-bottom: 1.5rem;
}

.settings-slider-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.settings-slider-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  min-width: 42px;
  text-align: center;
}

.settings-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 99px;
  background: var(--border);
  outline: none;
  cursor: pointer;
}

.settings-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  cursor: pointer;
  transition: transform 0.15s;
}

.settings-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.settings-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  cursor: pointer;
}
*/