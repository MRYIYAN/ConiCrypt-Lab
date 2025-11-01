export type WSMessage = 
  | { op: 'analyze_conic'; payload: ConicParams }
  | { op: 'simulate_ecc'; payload: ECCParams };

export type WSResponse = 
  | ConicResult
  | ECCResult
  | { error: string };

export interface WSConnectionStatus {
  connected: boolean;
  error?: string;
}

import { ConicParams, ConicResult } from './conic';
import { ECCParams, ECCResult } from './ecc';
