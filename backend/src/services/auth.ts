
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthUser } from '../middleware/auth';
import { env } from '../config/env';

// Anahtar ve süre doğrulaması config/env içinde yapılıyor: üretimde eksik ya da
// zayıf bir JWT_SECRET sunucuyu açılışta durdurur, sessizce varsayılana düşmez.
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: string; email: string; username: string; role: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
}
