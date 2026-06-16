import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  cssClass?: string;
}

export default function KpiCard({ label, value, cssClass = '' }: KpiCardProps) {
  return (
    <div className={`kpi-card ${cssClass}`}>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
