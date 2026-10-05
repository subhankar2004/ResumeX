import pool from '../config/database';
import { User } from '../types';

export const UserModel = {
  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Find user by email, ignoring case (provider emails may differ in case from signup)
  async findByEmailInsensitive(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) ORDER BY created_at LIMIT 1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Find user by ID
  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create new user
  async create(
    email: string,
    password_hash: string | null
  ): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, plan)
       VALUES ($1, $2, 'free')
       RETURNING *`,
      [email, password_hash]
    );
    return result.rows[0];
  },

  // Update user profile type
  async updateProfileType(id: string, profileType: string): Promise<User> {
    const result = await pool.query(
      `UPDATE users 
       SET profile_type = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [profileType, id]
    );
    return result.rows[0];
  },
};
