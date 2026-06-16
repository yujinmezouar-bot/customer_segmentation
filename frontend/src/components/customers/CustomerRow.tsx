import React from 'react';
import { Customer } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));

export default function CustomerRow({ customer, rank }: { customer: Customer, rank: number }) {
  const { selectedCustomerId, setSelectedCustomerId } = useAppStore();
  const isSelected = selectedCustomerId === customer.CustomerID;
  const seg = customer.SegmentABC;
  
  const borderColors: any = { A: '#4caf50', B: '#ff9800', C: '#ab47bc' };
  const borderC = borderColors[seg] || '#64b5f6';
  const badgeCls = seg === 'A' ? 'badge-a' : seg === 'B' ? 'badge-b' : 'badge-c';

  return (
    <div className="flex gap-2">
      <div 
        className={`flex-1 rounded-xl p-[14px_18px] mb-[2px] border-l-[5px] flex items-center justify-between
          ${isSelected ? 'bg-cardHover' : 'bg-card'}`}
        style={{ borderColor: borderC }}
      >
        <div className="flex items-center gap-[10px]">
          <div className="bg-[#0d1b2a] rounded-full w-[32px] h-[32px] inline-flex items-center justify-center text-[0.78rem] font-bold text-accent shrink-0">
            #{rank}
          </div>
          <div>
            <div className="font-semibold text-[0.93rem] text-textPrim">{customer.CustomerName}</div>
            <div className="text-[0.77rem] text-textSec mt-[2px]">
              {customer.CustomerCatégorie} · {customer.Region} – {customer.Wilaya} · Code : {customer.CustomerCode}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[18px]">
          <div className="text-right">
            <div className="text-[0.72rem] text-textSec">CA Net</div>
            <div className="font-semibold text-accent">DZD {fmt(customer.CANet)}</div>
          </div>
          <div className="text-right">
            <div className="text-[0.72rem] text-textSec">Score</div>
            <div className="font-semibold text-textPrim">{customer.ScoreGlobal.toFixed(2)}/5</div>
          </div>
          <div className="text-right">
            <div className="text-[0.72rem] text-textSec">Retour</div>
            <div className="font-semibold text-textPrim">{(customer.TauxRetour * 100).toFixed(1)}%</div>
          </div>
          <span className={`client-badge ${badgeCls}`}>Seg {seg}</span>
        </div>
      </div>
      <button 
        onClick={() => setSelectedCustomerId(isSelected ? null : customer.CustomerID)}
        className="w-12 bg-card rounded-xl hover:bg-cardHover transition flex items-center justify-center font-bold text-textSec"
      >
        {isSelected ? '✕' : '👁'}
      </button>
    </div>
  );
}
