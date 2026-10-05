import { Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { ValidationError } from '../utils/errors';

export const UserController = {
  // PATCH /api/users/me/profile
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profile_type } = req.body;

      // Validate profile_type
      const validTypes = ['fresher', 'experienced', 'tech', 'non_tech'];
      if (!profile_type || !validTypes.includes(profile_type)) {
        throw new ValidationError('Invalid profile type. Must be one of: fresher, experienced, tech, non_tech');
      }

      const updatedUser = await UserModel.updateProfileType(req.user.id, profile_type);

      // Remove password hash
      const { password_hash, ...userWithoutPassword } = updatedUser;

      sendSuccess(res, { user: userWithoutPassword }, 200, 'Profile updated');
    } catch (error) {
      next(error);
    }
  },
};
