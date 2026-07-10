import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = async (password: string): Promise<string> => {
  const pepperedPassword = password + env.AUTH_PEPPER;
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(pepperedPassword, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const pepperedPassword = password + env.AUTH_PEPPER;
  return bcrypt.compare(pepperedPassword, hash);
};
