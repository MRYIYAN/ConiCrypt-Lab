export interface ECCParams {
  p: number;
  a: number;
  b: number;
  Px: number;
  Py: number;
  k: number;
  listPoints: boolean;
}

export interface ECPoint {
  x: number;
  y: number;
  infinity?: boolean;
}

export interface ECCResult {
  valid: boolean;
  Q: ECPoint;
  points?: ECPoint[];
  error?: string;
}
