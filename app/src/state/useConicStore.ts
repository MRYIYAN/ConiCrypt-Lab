import { create } from 'zustand';
import { ConicParams, ConicResult } from '../types/conic';

interface ConicState {
  params: ConicParams;
  result: ConicResult | null;
  loading: boolean;
  error: string | null;
  setParams: (params: Partial<ConicParams>) => void;
  setResult: (result: ConicResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConicStore = create<ConicState>((set) => ({
  params: {
    A: 1,
    B: 0,
    C: 1,
    D: 0,
    E: 0,
    F: -25,
    samples: 600,
  },
  result: null,
  loading: false,
  error: null,
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  setResult: (result) => set({ result, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, result: null }),
}));
