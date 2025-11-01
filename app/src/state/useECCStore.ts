import { create } from 'zustand';
import { ECCParams, ECCResult } from '../types/ecc';

interface ECCState {
  params: ECCParams;
  result: ECCResult | null;
  loading: boolean;
  error: string | null;
  setParams: (params: Partial<ECCParams>) => void;
  setResult: (result: ECCResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useECCStore = create<ECCState>((set) => ({
  params: {
    p: 17,
    a: 2,
    b: 3,
    Px: 5,
    Py: 6,
    k: 7,
    listPoints: true,
  },
  result: null,
  loading: false,
  error: null,
  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),
  setResult: (result) => set({ result, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, result: null }),
}));
