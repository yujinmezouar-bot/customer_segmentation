import React from 'react';

export default function TopBar() {
  return (
    <div className="px-6 py-4 border-b border-border bg-navy">
      <h1 className="text-3xl font-bold">📊 Segmentation et Évaluation des Clients</h1>
      <p className="text-textSec mt-1 text-sm">
        Segmentation basée sur le <strong>CA Net</strong> · 
        Top 20 % → <span className="text-segA font-medium">Segment A</span> · 
        20–50 % → <span className="text-segB font-medium">Segment B</span> · 
        Reste → <span className="text-segC font-medium">Segment C</span>
      </p>
    </div>
  );
}
