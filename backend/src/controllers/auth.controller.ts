import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { OAuthService } from '../services/oauth.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, OAuthProvider } from '../types';
import { AppError, UnauthorizedError } from '../utils/errors';
import { config } from '../config';

const OAUTH_PROVIDER_LABELS: Record<OAuthProvider, string> = { github: 'GitHub', google: 'Google' };

const OAUTH_STATE_COOKIE = 'oauth_state';
const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.nodeEnv === 'production',
  path: '/api/auth',
};

const readCookie = (req: Request, name: string): string | undefined => {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
};

const redirectToLoginWithError = (res: Response, message: string): void => {
  res.redirect(`${config.oauth.frontendUrl}/login?error=${encodeURIComponent(message)}`);
};

export const AuthController = {
  // POST /api/auth/signup
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await AuthService.signup(email, password);

      sendSuccess(res, result, 201, 'User created successfully');
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await AuthService.login(email, password);

      sendSuccess(res, result, 200, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me (requires authentication)
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getMe(req.user.id);

      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/:provider — redirects the browser to the provider's consent screen
  oauthRedirect(provider: OAuthProvider) {
    return (_req: Request, res: Response): void => {
      const label = OAUTH_PROVIDER_LABELS[provider];
      if (!OAuthService.isConfigured(provider)) {
        redirectToLoginWithError(res, `${label} sign-in is not configured`);
        return;
      }

      const state = OAuthService.createState();
      res.cookie(OAUTH_STATE_COOKIE, state, { ...OAUTH_STATE_COOKIE_OPTIONS, maxAge: 10 * 60 * 1000 });
      res.redirect(OAuthService.authorizeUrl(provider, state));
    };
  },

  // GET /api/auth/:provider/callback — the provider redirects here after consent
  oauthCallback(provider: OAuthProvider) {
    return async (req: Request, res: Response): Promise<void> => {
      const label = OAUTH_PROVIDER_LABELS[provider];
      const { code, state, error } = req.query;
      const expectedState = readCookie(req, OAUTH_STATE_COOKIE);
      res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_OPTIONS);

      try {
        if (error) {
          throw new UnauthorizedError(`${label} sign-in was cancelled`);
        }
        if (typeof code !== 'string' || typeof state !== 'string' || !expectedState || state !== expectedState) {
          throw new UnauthorizedError('Sign-in session expired, please try again');
        }

        const profile = await OAuthService.getProfile(provider, code);
        const { token } = await OAuthService.signIn(provider, profile);

        // Token goes in the URL fragment so it never reaches server logs
        res.redirect(`${config.oauth.frontendUrl}/auth/callback#token=${encodeURIComponent(token)}`);
      } catch (err) {
        if (!(err instanceof AppError)) {
          console.error(`${label} sign-in failed:`, err);
        }
        redirectToLoginWithError(res, err instanceof AppError ? err.message : `${label} sign-in failed`);
      }
    };
  },
};
