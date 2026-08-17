import { Link } from "react-router";
import "./LoadError.css";

/**
 * Generic "failed to load" state — drop this in anywhere a fetch can fail
 * (dashboard, history, settings, subjects grid, etc). Fully driven by
 * props, nothing planner-specific baked in.
 *
 * Usage:
 *   <LoadError onRetry={refetch} />
 *   <LoadError
 *     title="Couldn't load your subjects"
 *     message="Check your connection and try again."
 *     onRetry={refetch}
 *     homeTo="/"
 *   />
 */
export function LoadError({
  title = "Something went wrong",
  message = "We couldn't load this page. This is usually temporary.",
  onRetry = null,
  homeTo = "/",
  homeLabel = "Back to Home",
}) {
  return (
    <div className="loaderror-page no-select">
      <div className="loaderror-card">
        <div className="loaderror-icon">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        </div>

        <h1 className="loaderror-title">{title}</h1>
        <p className="loaderror-text">{message}</p>

        <div className="loaderror-actions">
          {onRetry && (
            <button className="loaderror-btn loaderror-btn--primary" onClick={onRetry}>
              <i className="fa-solid fa-arrow-rotate-right" aria-hidden="true"></i>
              Try Again
            </button>
          )}

          <Link className="loaderror-btn loaderror-btn--ghost" to={homeTo}>
            <i className="fa-solid fa-house" aria-hidden="true"></i>
            {homeLabel}
          </Link>
        </div>

        <div className="loaderror-hint">
          <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
          Check your connection — if this keeps happening, let us know from the Feedback page.
        </div>
      </div>
    </div>
  );
}
