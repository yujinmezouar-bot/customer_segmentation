import React from 'react';

export default function HeatmapRegion({ data }: { data: any[] }) {
  const regions = Array.from(new Set(data.map(d => d.Region)));
  const segments = ['A', 'B', 'C'];
  const maxVal = Math.max(...data.map(d => d.Nombre), 1);

  return (
    <div className="overflow-x-auto w-full h-[300px] flex items-center justify-center bg-card rounded-xl border border-border">
      <table className="w-full h-full text-center border-collapse">
        <thead>
          <tr>
            <th className="p-2 border border-border text-textSec font-medium">Région \ Segment</th>
            {segments.map(s => <th key={s} className="p-2 border border-border font-medium text-textSec">{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {regions.map(r => (
            <tr key={r}>
              <td className="p-2 border border-border font-medium text-textSec">{r}</td>
              {segments.map(s => {
                const cell = data.find(d => d.Region === r && d.SegmentABC === s);
                const val = cell ? cell.Nombre : 0;
                const opacity = 0.2 + (val / maxVal) * 0.8;
                return (
                  <td key={s} className="p-2 border border-border text-white font-bold" style={{ backgroundColor: `rgba(100, 181, 246, ${opacity})` }}>
                    {val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
