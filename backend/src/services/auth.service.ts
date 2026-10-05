import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { OAuthAccountModel } from '../models/oauth-account.model';
import { config } from '../config';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';
import { User, UserProfile } from '../types';

const SALT_ROUNDS = 10;

export const AuthService = {
  // Generate JWT token
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      profile_type: user.profile_type,
      plan: user.plan,
    };

    const token = jwt.sign(payload, config.jwt.secret);
    return token;
  },

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  // Sign up new user
  async signup(email: string, password: string): Promise<{ user: User; token: string }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password and create user
    const passwordHash = await this.hashPassword(password);
    const user = await UserModel.create(email, passwordHash);

    // Generate token
    const token = this.generateToken(user);

    // Remove password hash before returning
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  },

  // Login user
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Social-sign-in-only accounts have no password
    if (!user.password_hash) {
      throw new UnauthorizedError('This account uses social sign-in. Continue with GitHub or Google instead.');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    // Remove password hash before returning
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  },

  // Get user by ID (for /auth/me endpoint)
  async getMe(userId: string): Promise<UserProfile> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const providers = await OAuthAccountModel.findProvidersByUserId(userId);

    // Remove password hash
    const { password_hash, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, has_password: Boolean(password_hash), providers };
  },
};
