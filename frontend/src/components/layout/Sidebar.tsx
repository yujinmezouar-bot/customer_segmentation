import React, { useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMeta } from '../../hooks/useChartData';
import { BASE_URL } from '../../api/config';

export default function Sidebar() {
  const { filters, setFilter, isDataLoaded, setIsDataLoaded } = useAppStore();
  const { data: meta } = useMeta();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
      if (res.ok) {
        setIsDataLoaded(true);
        window.location.reload(); // Quick refresh to clear states
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📂</span> Source des Données
        </h2>
        <div className="mt-4 space-y-3">
          <label className="block bg-navy hover:bg-border cursor-pointer transition text-center text-sm font-medium py-2 rounded-lg border border-border">
            {uploading ? 'Importation...' : 'Importer un Fichier'}
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.xls" onChange={handleUpload} disabled={uploading}/>
          </label>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🔍</span> Filtres
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-textSec mb-1">Catégorie Client</label>
            <select value={filters.cat} onChange={e => setFilter('cat', e.target.value)} className="w-full bg-navy border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-accent">
              {meta?.categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-textSec mb-1">Région</label>
            <select value={filters.region} onChange={e => setFilter('region', e.target.value)} className="w-full bg-navy border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-accent">
              {meta?.regions.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-textSec mb-1">Wilaya</label>
            <select value={filters.wilaya} onChange={e => setFilter('wilaya', e.target.value)} className="w-full bg-navy border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-accent">
              {meta?.wilayas.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-textSec mb-1">Segment (ABC)</label>
            <select value={filters.segment} onChange={e => setFilter('segment', e.target.value)} className="w-full bg-navy border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-accent">
              {['Tous', 'A', 'B', 'C'].map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
