import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { A: '#2e7d32', B: '#f57c00', C: '#7b1fa2' };

export default function SegmentPie({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="Nombre" nameKey="Segment" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.Segment as keyof typeof COLORS] || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#16213e', borderColor: '#2d3748' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
