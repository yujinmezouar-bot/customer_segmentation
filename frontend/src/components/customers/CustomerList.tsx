import React, { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import CustomerRow from './CustomerRow';
import CustomerDetail from './CustomerDetail';
import { useAppStore } from '../../store/useAppStore';

export default function CustomerList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('CANet');
  const [sortAsc, setSortAsc] = useState(false);
  const pageSize = 25;
  const { data, isLoading } = useCustomers(page, pageSize, search, sortBy, sortAsc);
  const { selectedCustomerId } = useAppStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  if (isLoading && !data) return <div className="text-center p-10 text-textSec">Chargement des clients...</div>;

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex gap-4 mb-4 items-center">
        <input 
          type="text" placeholder="Recherche nom ou code client…" 
          value={search} onChange={handleSearch}
          className="flex-[3] bg-card border border-border rounded-lg p-2 text-sm focus:border-accent outline-none"
        />
        <select value={sortBy} onChange={handleSort} className="flex-[2] bg-card border border-border rounded-lg p-2 text-sm focus:border-accent outline-none">
          <option value="CANet">CA Net</option>
          <option value="ScoreGlobal">Score Global</option>
          <option value="Fréquence">Fréquence</option>
          <option value="RatioMoisActifs">Ratio Mois Actifs</option>
          <option value="PartCAHauteMarge">Part CA Haute Marge</option>
          <option value="RemiseMoyenne">Remise Moyenne</option>
        </select>
        <label className="flex-[2] flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sortAsc} onChange={e => { setSortAsc(e.target.checked); setPage(0); }} className="accent-accent" />
          ↑ Croissant
        </label>
      </div>
      
      <div className="text-[0.8rem] text-textSec mb-3"><strong>{total.toLocaleString()}</strong> client(s) affiché(s)</div>

      <div className="flex items-center justify-between bg-card p-2 rounded-lg border border-border mb-4">
        <button onClick={() => setPage(0)} disabled={page === 0} className="px-3 py-1 text-sm disabled:opacity-50">⏮ Début</button>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="px-3 py-1 text-sm disabled:opacity-50">◀ Préc.</button>
        <div className="text-sm text-textSec text-center">
          Page <strong>{page + 1}</strong> / {totalPages} ({(page * pageSize) + 1}–{Math.min((page + 1) * pageSize, total)} sur {total})
        </div>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="px-3 py-1 text-sm disabled:opacity-50">Suiv. ▶</button>
        <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="px-3 py-1 text-sm disabled:opacity-50">Fin ⏭</button>
      </div>

      {selectedCustomerId && <CustomerDetail />}

      <div className="space-y-2">
        {data?.data.map((c: any, i: number) => (
          <CustomerRow key={c.CustomerID} customer={c} rank={page * pageSize + i + 1} />
        ))}
      </div>
    </div>
  );
}
