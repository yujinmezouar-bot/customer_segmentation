import React from 'react';
import { useCustomerDetail } from '../../hooks/useCustomers';
import { useAppStore } from '../../store/useAppStore';
import Plot from 'react-plotly.js';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CustomerDetail() {
  const id = useAppStore(state => state.selectedCustomerId);
  const setSelectedCustomerId = useAppStore(state => state.setSelectedCustomerId);
  const { data, isLoading } = useCustomerDetail(id);

  if (isLoading) return <div className="text-center p-8 text-textSec">Chargement de la fiche...</div>;
  if (!data) return null;

  const { customer, segment_data } = data;
  const segColor = { A: '#4caf50', B: '#ff9800', C: '#ab47bc' }[customer.SegmentABC as string] || '#64b5f6';
  const badgeCls = customer.SegmentABC === 'A' ? 'badge-a' : customer.SegmentABC === 'B' ? 'badge-b' : 'badge-c';

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-6 border border-border mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-[14px] mb-[4px]">
            <div className="text-2xl font-bold text-textPrim">{customer.CustomerName}</div>
            <span className={`client-badge ${badgeCls}`}>Seg {customer.SegmentABC}</span>
          </div>
          <div className="text-[0.82rem] text-textSec">
            {customer.CustomerCatégorie} · {customer.Region} – {customer.Wilaya} · Code : <strong className="text-slate-400">{customer.CustomerCode}</strong>
          </div>
        </div>
        <button onClick={() => setSelectedCustomerId(null)} className="text-sm bg-border hover:bg-slate-600 px-3 py-1 rounded">
          ✕ Fermer
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          ['CA Net', `DZD ${fmt(customer.CANet)}`],
          ['CA / Mois Actif', `DZD ${fmt(customer.CAParMoisActif)}`],
          ['Score Global', `${customer.ScoreGlobal.toFixed(2)} / 5`],
          ['Taux de Retour', `${(customer.TauxRetour * 100).toFixed(2)}%`],
          ['Part Haute Marge', `${(customer.PartCAHauteMarge * 100).toFixed(1)}%`]
        ].map(([l, v]) => (
          <div key={l} className="bg-navy rounded-lg p-3">
            <div className="text-[0.72rem] text-textSec uppercase tracking-wide">{l}</div>
            <div className="text-[1.1rem] font-semibold text-textPrim mt-1">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[0.7rem] font-semibold text-accent uppercase tracking-widest mb-2 border-b border-border pb-1">Profil Détaillé</div>
          <div className="bg-navy rounded-lg p-3 space-y-2">
            {[
              ['Fréquence d\'achat', customer.Fréquence],
              ['Fréquence / Mois Actif', customer.FreqParMoisActif.toFixed(2)],
              ['Quantité Nette', customer.QteNette],
              ['Quantité / Mois Actif', customer.QteParMoisActif.toFixed(2)],
              ['Mois Actifs', `${customer.MoisActifs} / ${customer.MoisDepuisDebut}`],
              ['Ratio Mois Actifs', `${(customer.RatioMoisActifs * 100).toFixed(1)}%`],
              ['Remise Moyenne', `${customer.RemiseMoyenne.toFixed(2)}%`]
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-1 last:border-0">
                <span className="text-[0.85rem] text-slate-400">{k}</span>
                <span className="text-[0.85rem] font-medium text-textPrim">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[0.7rem] font-semibold text-accent uppercase tracking-widest mb-2 border-b border-border pb-1">Scores Détaillés</div>
          <div className="bg-navy rounded-lg p-3 space-y-2">
            {[
              ['Score CA', customer.ScoreCA], ['Score Fréquence', customer.ScoreFréquence],
              ['Score Quantité', customer.ScoreQuantité], ['Score Mois Actifs', customer.ScoreMoisActifs],
              ['Score Retour', customer.ScoreRetour], ['Score Remise', customer.ScoreRemise],
              ['Score CA / Mois', customer.ScoreCAMois], ['Score Haute Marge', customer.ScoreHauteMarge]
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-1 last:border-0">
                <span className="text-[0.85rem] text-slate-400">{k}</span>
                <span>
                  <span className="text-yellow-400 text-base leading-none">{stars(v as number).slice(0, v as number)}</span>
                  <span className="text-slate-600 text-base leading-none">{stars(v as number).slice(v as number)}</span>
                  <span className="text-[0.8rem] text-textSec ml-2">({v}/5)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div>
          <div className="text-[0.7rem] font-semibold text-accent uppercase tracking-widest mb-2 border-b border-border pb-1">Radar de Performance</div>
          <Plot
            data={[{
              type: 'scatterpolar',
              r: [customer.ScoreCA, customer.ScoreFréquence, customer.ScoreQuantité, customer.ScoreMoisActifs, customer.ScoreRetour, customer.ScoreRemise, customer.ScoreCAMois, customer.ScoreHauteMarge, customer.ScoreCA],
              theta: ["CA", "Fréquence", "Quantité", "Mois Actifs", "Retour", "Remise", "CA/Mois", "Haute Marge", "CA"],
              fill: 'toself',
              fillcolor: `${segColor}40`,
              line: { color: segColor, width: 2 },
              marker: { size: 6 }
            }]}
            layout={{
              polar: {
                radialaxis: { visible: true, range: [0, 5], gridcolor: '#2d3748', tickfont: { size: 9, color: '#e2e8f0'} },
                angularaxis: { gridcolor: '#2d3748', tickfont: { size: 10, color: '#e2e8f0'} },
                bgcolor: 'rgba(0,0,0,0)'
              },
              margin: { l: 40, r: 40, t: 20, b: 20 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              showlegend: false
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '300px' }}
          />
        </div>
        <div>
          <div className="text-[0.7rem] font-semibold text-accent uppercase tracking-widest mb-2 border-b border-border pb-1">Position dans le Segment</div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="CANet" name="CA Net" tickFormatter={v => `${(v/1000).toFixed(0)}k`} stroke="#718096" />
                <YAxis dataKey="ScoreGlobal" name="Score" stroke="#718096" domain={[0, 5]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#16213e', borderColor: '#2d3748' }} />
                <Scatter data={segment_data} fill="#2d3748" shape="circle" />
                <Scatter data={[customer]} fill={segColor} shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
