import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '../api/config';
import { useAppStore } from '../store/useAppStore';

export const useCustomers = (page: number, pageSize: number, search: string, sortBy: string, sortAsc: boolean) => {
  const filters = useAppStore(state => state.filters);
  const isDataLoaded = useAppStore(state => state.isDataLoaded);
  
  return useQuery({
    queryKey: ['customers', filters, page, pageSize, search, sortBy, sortAsc],
    queryFn: async () => {
      const qs = new URLSearchParams({
        ...filters,
        page: page.toString(),
        page_size: pageSize.toString(),
        search,
        sort_by: sortBy,
        sort_asc: sortAsc.toString()
      }).toString();
      const res = await fetch(`${BASE_URL}/customers?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
    enabled: isDataLoaded
  });
};

export const useCustomerDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/customers/${id}`);
      if (!res.ok) throw new Error('Failed to fetch customer detail');
      return res.json();
    },
    enabled: !!id
  });
};
