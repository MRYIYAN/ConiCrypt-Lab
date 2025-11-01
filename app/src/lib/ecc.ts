import { ECCParams } from '../types/ecc';

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  
  return true;
}

export function validateECCParams(params: ECCParams): string | null {
  if (!Number.isInteger(params.p) || params.p < 2) {
    return 'p must be an integer >= 2';
  }
  
  if (!isPrime(params.p)) {
    return 'p must be a prime number';
  }
  
  if (!Number.isInteger(params.a) || !Number.isInteger(params.b)) {
    return 'Curve parameters a and b must be integers';
  }
  
  if (!Number.isInteger(params.Px) || !Number.isInteger(params.Py)) {
    return 'Point coordinates Px and Py must be integers';
  }
  
  if (!Number.isInteger(params.k)) {
    return 'Scalar k must be an integer';
  }
  
  if (params.Px < 0 || params.Px >= params.p || params.Py < 0 || params.Py >= params.p) {
    return 'Point coordinates must be in range [0, p)';
  }
  
  return null;
}

export function modInverse(a: number, m: number): number {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];

  while (r !== 0) {
    const quotient = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }

  return old_s < 0 ? old_s + m : old_s;
}
