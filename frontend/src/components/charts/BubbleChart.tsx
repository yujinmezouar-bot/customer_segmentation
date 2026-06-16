import React from 'react';
import Plot from 'react-plotly.js';

export default function BubbleChart({ data }: { data: any[] }) {
  const segments = ['A', 'B', 'C'];
  const colors = { A: '#4caf50', B: '#ff9800', C: '#ab47bc' };
  
  const plotData = segments.map(seg => {
    const filtered = data.filter(d => d.SegmentABC === seg);
    return {
      x: filtered.map(d => d.Fréquence),
      y: filtered.map(d => d.CANet),
      text: filtered.map(d => d.CustomerName),
      mode: 'markers',
      name: `Segment ${seg}`,
      marker: {
        size: filtered.map(d => Math.max(1, d.QteNette)),
        sizemode: 'area',
        sizeref: 2,
        color: colors[seg as keyof typeof colors],
        opacity: 0.75
      }
    };
  });

  return (
    <Plot
      data={plotData as any}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e2e8f0' },
        xaxis: { title: "Fréquence d'achat", gridcolor: '#2d3748' },
        yaxis: { title: "CA Net (DZD)", gridcolor: '#2d3748' },
        margin: { t: 30, r: 10, l: 50, b: 40 },
        showlegend: true
      }}
      useResizeHandler
      className="w-full h-[460px]"
    />
  );
}
