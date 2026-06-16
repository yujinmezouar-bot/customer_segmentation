import { create } from 'zustand';

interface AppState {
  filters: {
    cat: string;
    region: string;
    wilaya: string;
    segment: string;
  };
  setFilter: (key: keyof AppState['filters'], value: string) => void;
  selectedCustomerId: number | null;
  setSelectedCustomerId: (id: number | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDataLoaded: boolean;
  setIsDataLoaded: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  filters: {
    cat: 'Tous',
    region: 'Tous',
    wilaya: 'Tous',
    segment: 'Tous',
  },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  activeTab: '👥 Liste des Clients',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isDataLoaded: false,
  setIsDataLoaded: (val) => set({ isDataLoaded: val })
}));
