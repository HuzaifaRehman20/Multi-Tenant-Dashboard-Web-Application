import React from 'react';

export default function StatCard({ type, icon, value, label }) {
  const formatValue = (v) => {
    if (v === null || v === undefined) return '—';
    if (type === 'revenue') return '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 });
    return Number(v).toLocaleString();
  };

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{formatValue(value)}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
