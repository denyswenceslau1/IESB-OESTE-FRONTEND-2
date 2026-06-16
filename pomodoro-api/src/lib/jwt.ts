import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'pomodoro_secret_change_in_production';
const JWT_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

export interface JwtPayload {
  userId: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(input: string): string {
  const padded = input + '=='.slice(0, (4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function sign(header: object, payload: object): string {
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${h}.${p}`)
    .digest('base64url');
  return `${h}.${p}.${sig}`;
}

export function signToken(data: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const now = Date.now();
  const payload: JwtPayload = {
    ...data,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + JWT_EXPIRES_IN_MS) / 1000),
  };
  return sign({ alg: 'HS256', typ: 'JWT' }, payload);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const [h, p, sig] = token.split('.');
    if (!h || !p || !sig) return null;

    const expected = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${h}.${p}`)
      .digest('base64url');

    if (sig !== expected) return null;

    const payload: JwtPayload = JSON.parse(base64UrlDecode(p));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
