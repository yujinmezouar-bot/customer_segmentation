import React from 'react';
import Plot from 'react-plotly.js';

export default function BoxPlotSeg({ data }: { data: any[] }) {
  const colors = { A: '#4caf50', B: '#ff9800', C: '#ab47bc' };
  const plotData = ['A', 'B', 'C'].map(seg => ({
    type: 'box',
    y: data.filter(d => d.SegmentABC === seg).map(d => d.CANet),
    name: `Segment ${seg}`,
    marker: { color: colors[seg as keyof typeof colors] }
  }));

  return (
    <Plot
      data={plotData as any}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e2e8f0' },
        yaxis: { gridcolor: '#2d3748' },
        margin: { t: 10, r: 10, l: 50, b: 30 },
        showlegend: false
      }}
      useResizeHandler
      className="w-full h-[300px]"
    />
  );
}
