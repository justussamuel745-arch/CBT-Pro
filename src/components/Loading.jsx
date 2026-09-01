import './Loading.css';

export function Loading() {
  return (
    <div id="loader" data-testid="loading-state">
      <div className="spinner"></div>
      <div className="label">Loading…</div>
    </div>
  );
}
