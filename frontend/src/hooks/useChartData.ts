import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '../api/config';
import { useAppStore } from '../store/useAppStore';

const fetchEndpoint = async (endpoint: string, filters: any, extraParams: any = {}) => {
  const qs = new URLSearchParams({ ...filters, ...extraParams }).toString();
  const res = await fetch(`${BASE_URL}/${endpoint}?${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
};

export const useKpis = () => {
  const { filters, isDataLoaded } = useAppStore();
  return useQuery({
    queryKey: ['kpis', filters],
    queryFn: () => fetchEndpoint('charts/kpis', filters),
    enabled: isDataLoaded
  });
};

export const useChartData = (category: 'segmentation' | 'revenue' | 'scores' | 'advanced', extraParams = {}) => {
  const { filters, isDataLoaded } = useAppStore();
  return useQuery({
    queryKey: ['charts', category, filters, extraParams],
    queryFn: () => fetchEndpoint(`charts/${category}`, filters, extraParams),
    enabled: isDataLoaded
  });
};

export const useMeta = () => {
  const { isDataLoaded } = useAppStore();
  return useQuery({
    queryKey: ['meta'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/meta`);
      return res.json();
    },
    enabled: isDataLoaded
  });
};
