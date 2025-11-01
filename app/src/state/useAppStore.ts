import { create } from 'zustand';

interface AppState {
  currentPage: 'home' | 'conics' | 'ecc';
  wsConnected: boolean;
  setCurrentPage: (page: 'home' | 'conics' | 'ecc') => void;
  setWsConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  wsConnected: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
