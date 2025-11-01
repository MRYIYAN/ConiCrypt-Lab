export interface ConicParams {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
  samples: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ConicResult {
  delta: number;
  type: 'ellipse' | 'parabola' | 'hyperbola' | 'circle' | 'degenerate';
  points: Point2D[];
}
