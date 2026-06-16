import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const SALT_BYTES = 16;
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LEN) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedKey] = hash.split(':');
  if (!salt || !storedKey) return false;
  const derivedKey = await scrypt(password, salt, KEY_LEN) as Buffer;
  const storedBuffer = Buffer.from(storedKey, 'hex');
  return crypto.timingSafeEqual(derivedKey, storedBuffer);
}
