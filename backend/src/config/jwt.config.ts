import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super_secret_key_change_me',
  expiresIn: process.env.JWT_EXPIRATION || '1d',
}));
