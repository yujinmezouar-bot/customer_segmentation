import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import KpiCard from '../components/kpis/KpiCard';
import CustomerList from '../components/customers/CustomerList';
import SegmentPie from '../components/charts/SegmentPie';
import RevenueBar from '../components/charts/RevenueBar';
import BoxPlotSeg from '../components/charts/ScoreRadar';
import BubbleChart from '../components/charts/BubbleChart';
import HeatmapRegion from '../components/charts/HeatmapRegion';
import { useKpis, useChartData } from '../hooks/useChartData';
import { BASE_URL } from '../api/config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import Plot from 'react-plotly.js';

const TABS = [
  "👥 Liste des Clients", "🎯 Segmentation", "💰 Chiffre d'Affaires",
  "🏆 Scores", "🔬 Analyse Avancée", "📋 Classement & Export"
];

function fmt(n: number) { return new Intl.NumberFormat('en-US').format(Math.round(n)); }

function ExportTab() {
  const filters = useAppStore(state => state.filters);
  const handleExport = (format: string) => {
    const qs = new URLSearchParams({ format, ...filters }).toString();
    window.location.href = `${BASE_URL}/export?${qs}`;
  };
  return (
    <div className="p-8 text-center space-y-6">
      <h2 className="text-2xl font-bold text-textPrim">📥 Téléchargement des Données</h2>
      <p className="text-textSec">Téléchargez la sélection actuelle selon vos filtres actifs.</p>
      <div className="flex justify-center gap-4">
        <button onClick={() => handleExport('csv')} className="bg-card border border-border hover:bg-cardHover px-6 py-3 rounded-xl font-bold transition">
          ⬇ CSV — Données Filtrées
        </button>
        <button onClick={() => handleExport('xlsx')} className="bg-card border border-border hover:bg-cardHover px-6 py-3 rounded-xl font-bold transition">
          ⬇ Excel — Données Filtrées
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { activeTab, setActiveTab, isDataLoaded, setIsDataLoaded } = useAppStore();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const { data: kpis } = useKpis();
  const { data: segData } = useChartData('segmentation');
  const { data: revData } = useChartData('revenue');
  const { data: scoreData } = useChartData('scores');
  const { data: advData } = useChartData('advanced');

  const loadDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch(`${BASE_URL}/data/demo`);
      if (res.ok) setIsDataLoaded(true);
    } finally { setLoadingDemo(false); }
  };

  if (!isDataLoaded) {
    return (
      <div className="h-screen bg-navy flex items-center justify-center text-textPrim">
        <div className="bg-card p-10 rounded-2xl border border-border shadow-2xl text-center max-w-lg w-full">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-bold mb-4">Bienvenue</h1>
          <p className="text-textSec mb-8">Veuillez charger les données pour commencer l'analyse B2B.</p>
          <button onClick={loadDemo} disabled={loadingDemo} className="w-full bg-accent text-navy font-bold py-3 px-4 rounded-xl hover:bg-blue-400 transition text-lg">
            {loadingDemo ? 'Génération...' : 'Charger le Jeu de Données Démo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-navy text-textPrim overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="px-6 pt-4 border-b border-border flex gap-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'text-accent border-b-2 border-accent' : 'text-textSec hover:text-textPrim'}`}>
              {t}
            </button>
          ))}
        </div>
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* KPI ROW */}
          {kpis && (
            <div className="grid grid-cols-8 gap-3 mb-6">
              <KpiCard label="Total Clients" value={fmt(kpis.total_clients)} />
              <KpiCard label="CA Total" value={`DZD ${fmt(kpis.ca_total)}`} />
              <KpiCard label="CA Moyen / Mois" value={`DZD ${fmt(kpis.ca_moyen_mois)}`} />
              <KpiCard label="Score Global Moyen" value={`${kpis.score_global_moyen.toFixed(2)} / 5`} />
              <KpiCard label="Part Haute Marge Moy." value={`${kpis.part_haute_marge_moy.toFixed(1)}%`} />
              <KpiCard label="Segment A" value={fmt(kpis.segment_a)} cssClass="kpi-seg-a" />
              <KpiCard label="Segment B" value={fmt(kpis.segment_b)} cssClass="kpi-seg-b" />
              <KpiCard label="Segment C" value={fmt(kpis.segment_c)} cssClass="kpi-seg-c" />
            </div>
          )}

          <div className="bg-card rounded-2xl p-6 border border-border min-h-[500px]">
            {activeTab === '👥 Liste des Clients' && <CustomerList />}
            
            {activeTab === '🎯 Segmentation' && segData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Répartition par Segment</h3><SegmentPie data={segData.pie} /></div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">CA Net Total par Segment</h3><RevenueBar data={segData.bar_ca} xKey="Segment" yKey="CANet" colorsMap={{A:'#2e7d32', B:'#f57c00', C:'#7b1fa2'}} /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Part Haute Marge Moy. par Segment</h3><RevenueBar data={segData.bar_hm} xKey="Segment" yKey="PartCAHauteMarge" colorsMap={{A:'#2e7d32', B:'#f57c00', C:'#7b1fa2'}} /></div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Distribution du CA Net par Segment</h3><BoxPlotSeg data={segData.box_data} /></div>
                </div>
              </div>
            )}

            {activeTab === "💰 Chiffre d'Affaires" && revData && (
              <div className="space-y-6">
                <div className="bg-navy p-4 rounded-xl border border-border">
                  <h3 className="text-center font-bold mb-4">Top 20 Clients</h3>
                  <Plot data={[{ type: 'bar', x: revData.top20.map((d:any)=>d[revData.mcol]), y: revData.top20.map((d:any)=>d.CustomerName), orientation: 'h', marker: {color: '#64b5f6'} }]} layout={{yaxis: {autorange: 'reversed'}, margin:{l: 150, r: 20, t: 10, b: 40}, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: {color: '#e2e8f0'} }} useResizeHandler className="w-full h-[400px]" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Par Région</h3><RevenueBar data={revData.by_region} xKey="Region" yKey={revData.mcol} /></div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Top 15 Wilayas</h3>
                    <Plot data={[{ type: 'bar', x: revData.by_wilaya.map((d:any)=>d[revData.mcol]), y: revData.by_wilaya.map((d:any)=>d.Wilaya), orientation: 'h', marker: {color: '#f57c00'} }]} layout={{yaxis: {autorange: 'reversed'}, margin:{l: 100, r: 20, t: 10, b: 40}, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: {color: '#e2e8f0'} }} useResizeHandler className="w-full h-[300px]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === '🏆 Scores' && scoreData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Distribution Score Global</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={scoreData.hist_global} barCategoryGap={0} barGap={0}><XAxis dataKey="bin" stroke="#718096" /><YAxis stroke="#718096" /><Tooltip cursor={{fill: '#2d3748'}} contentStyle={{backgroundColor: '#16213e', borderColor: '#2d3748'}} /><Bar dataKey="count" fill="#64b5f6" /></BarChart></ResponsiveContainer>
                  </div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Score Moyen par Segment</h3><RevenueBar data={scoreData.seg_sc} xKey="SegmentABC" yKey="ScoreGlobal" colorsMap={{A:'#2e7d32', B:'#f57c00', C:'#7b1fa2'}} /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Score Moyen par Région</h3><RevenueBar data={scoreData.reg_sc} xKey="Region" yKey="ScoreGlobal" /></div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Composantes Moyennes</h3><RevenueBar data={scoreData.avg_sc} xKey="Score" yKey="Moyenne" /></div>
                </div>
              </div>
            )}

            {activeTab === '🔬 Analyse Avancée' && advData && (
              <div className="space-y-6">
                <div className="bg-navy p-4 rounded-xl border border-border">
                  <h3 className="text-center font-bold mb-4">Fréquence vs CA Net (Taille = Qté Nette)</h3>
                  <BubbleChart data={advData.scatter1} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Ratio Mois Actifs vs CA/Mois</h3>
                    <ResponsiveContainer width="100%" height={300}><ScatterChart margin={{top:10, right:10, bottom:10, left:20}}><XAxis dataKey="RatioMoisActifs" stroke="#718096" /><YAxis dataKey="CAParMoisActif" stroke="#718096" /><Tooltip cursor={{strokeDasharray:'3 3'}} contentStyle={{backgroundColor: '#16213e', borderColor: '#2d3748'}} /><Scatter data={advData.scatter2} fill="#64b5f6" /></ScatterChart></ResponsiveContainer>
                  </div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Distribution Part CA Haute Marge</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={advData.hist_hm} barCategoryGap={0} barGap={0}><XAxis dataKey="bin" stroke="#718096" /><YAxis stroke="#718096" /><Tooltip cursor={{fill: '#2d3748'}} contentStyle={{backgroundColor: '#16213e', borderColor: '#2d3748'}} /><Bar dataKey="A" fill="#4caf50" stackId="a"/><Bar dataKey="B" fill="#ff9800" stackId="a"/><Bar dataKey="C" fill="#ab47bc" stackId="a"/></BarChart></ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Répartition Région × Segment</h3><HeatmapRegion data={advData.heatmap} /></div>
                  <div className="bg-navy p-4 rounded-xl border border-border"><h3 className="text-center font-bold mb-4">Distribution du Taux de Retour</h3>
                    <ResponsiveContainer width="100%" height={300}><BarChart data={advData.hist_ret} barCategoryGap={0} barGap={0}><XAxis dataKey="bin" stroke="#718096" /><YAxis stroke="#718096" /><Tooltip cursor={{fill: '#2d3748'}} contentStyle={{backgroundColor: '#16213e', borderColor: '#2d3748'}} /><Bar dataKey="count" fill="#ef5350" /></BarChart></ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === '📋 Classement & Export' && <ExportTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
