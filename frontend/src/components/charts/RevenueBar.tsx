import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RevenueBar({ data, xKey, yKey, colorsMap }: { data: any[], xKey: string, yKey: string, colorsMap?: any }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey={xKey} stroke="#718096" />
        <YAxis stroke="#718096" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip cursor={{ fill: '#2d3748' }} contentStyle={{ backgroundColor: '#16213e', borderColor: '#2d3748' }} />
        <Bar dataKey={yKey} fill="#64b5f6">
          {colorsMap && data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorsMap[entry[xKey]] || '#64b5f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
