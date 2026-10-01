import './SettingsSkeleton.css';

export function SettingsSkeleton() {
  return (
    <div className="settings-skeleton-page">
      <div className="settings-skeleton-block">
        <div className="settings-skeleton-line" style={{ width: '40%', height: '20px' }} />
        <div className="settings-skeleton-line" style={{ width: '60%' }} />
        <div className="settings-skeleton-line" style={{ width: '100%', marginTop: '1.5rem' }} />
        <div className="settings-skeleton-line" style={{ width: '100%' }} />
        <div className="settings-skeleton-line" style={{ width: '70%' }} />
      </div>
    </div>
  );
}