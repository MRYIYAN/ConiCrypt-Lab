import { ConicParams } from '../types/conic';

export function calculateDelta(A: number, B: number, C: number): number {
  return B * B - 4 * A * C;
}

export function classifyConic(delta: number, A: number, B: number, C: number): string {
  const epsilon = 1e-9;
  
  if (Math.abs(A) < epsilon && Math.abs(B) < epsilon && Math.abs(C) < epsilon) {
    return 'degenerate';
  }
  
  if (Math.abs(A - C) < epsilon && Math.abs(B) < epsilon && A > epsilon) {
    return 'circle';
  }
  
  if (Math.abs(delta) < epsilon) {
    return 'parabola';
  }
  
  if (delta < -epsilon) {
    return 'ellipse';
  }
  
  if (delta > epsilon) {
    return 'hyperbola';
  }
  
  return 'degenerate';
}

export function validateConicParams(params: ConicParams): string | null {
  if (!Number.isFinite(params.A) || !Number.isFinite(params.B) || !Number.isFinite(params.C)) {
    return 'Invalid coefficients: A, B, C must be finite numbers';
  }
  
  if (!Number.isFinite(params.D) || !Number.isFinite(params.E) || !Number.isFinite(params.F)) {
    return 'Invalid coefficients: D, E, F must be finite numbers';
  }
  
  if (params.samples < 10 || params.samples > 10000) {
    return 'Samples must be between 10 and 10000';
  }
  
  return null;
}
