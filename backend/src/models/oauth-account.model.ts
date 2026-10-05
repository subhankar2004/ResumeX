import pool from '../config/database';
import { OAuthProvider, User } from '../types';

export const OAuthAccountModel = {
  // Find the user linked to a provider identity
  async findUser(provider: OAuthProvider, providerUserId: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT u.*
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = $1 AND oa.provider_user_id = $2`,
      [provider, providerUserId]
    );
    return result.rows[0] || null;
  },

  // Providers linked to a user, e.g. ['github', 'google']
  async findProvidersByUserId(userId: string): Promise<OAuthProvider[]> {
    const result = await pool.query(
      'SELECT DISTINCT provider FROM oauth_accounts WHERE user_id = $1 ORDER BY provider',
      [userId]
    );
    return result.rows.map((row) => row.provider);
  },

  // Link a provider identity to a user
  async create(
    userId: string,
    provider: OAuthProvider,
    providerUserId: string,
    email: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (provider, provider_user_id) DO NOTHING`,
      [userId, provider, providerUserId, email]
    );
  },
};
