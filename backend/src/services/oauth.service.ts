import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';
import { OAuthAccountModel } from '../models/oauth-account.model';
import { UserModel } from '../models/user.model';
import { AuthService } from './auth.service';
import { UnauthorizedError } from '../utils/errors';
import { OAuthProfile, OAuthProvider, User } from '../types';

const REQUEST_TIMEOUT = 10000;

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

export const OAuthService = {
  // Random value tying the callback to the browser that started the sign-in (CSRF protection)
  createState(): string {
    return crypto.randomBytes(16).toString('hex');
  },

  callbackUrl(provider: OAuthProvider): string {
    return `${config.oauth.apiPublicUrl}/api/auth/${provider}/callback`;
  },

  isConfigured(provider: OAuthProvider): boolean {
    const { clientId, clientSecret } = config.oauth[provider];
    return Boolean(clientId && clientSecret);
  },

  authorizeUrl(provider: OAuthProvider, state: string): string {
    return provider === 'github' ? this.githubAuthorizeUrl(state) : this.googleAuthorizeUrl(state);
  },

  getProfile(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
    return provider === 'github' ? this.getGithubProfile(code) : this.getGoogleProfile(code);
  },

  // URL of GitHub's consent screen
  githubAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.oauth.github.clientId,
      redirect_uri: this.callbackUrl('github'),
      scope: 'read:user user:email',
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  },

  // Exchange the authorization code for the user's GitHub id and verified email
  async getGithubProfile(code: string): Promise<OAuthProfile> {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.oauth.github.clientId,
        client_secret: config.oauth.github.clientSecret,
        code,
        redirect_uri: this.callbackUrl('github'),
      },
      { headers: { Accept: 'application/json' }, timeout: REQUEST_TIMEOUT }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      throw new UnauthorizedError(
        tokenResponse.data.error_description || 'GitHub authorization failed'
      );
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ResumeX',
    };
    const [userResponse, emailsResponse] = await Promise.all([
      axios.get('https://api.github.com/user', { headers, timeout: REQUEST_TIMEOUT }),
      axios.get<GithubEmail[]>('https://api.github.com/user/emails', {
        headers,
        timeout: REQUEST_TIMEOUT,
      }),
    ]);

    const emails = emailsResponse.data;
    const verifiedEmail =
      emails.find((email) => email.primary && email.verified) ||
      emails.find((email) => email.verified);
    if (!verifiedEmail) {
      throw new UnauthorizedError('Your GitHub account has no verified email address');
    }

    return {
      providerUserId: String(userResponse.data.id),
      email: verifiedEmail.email.toLowerCase(),
    };
  },

  // URL of Google's consent screen
  googleAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId,
      redirect_uri: this.callbackUrl('google'),
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  },

  // Exchange the authorization code for the user's Google id and verified email
  async getGoogleProfile(code: string): Promise<OAuthProfile> {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: config.oauth.google.clientId,
        client_secret: config.oauth.google.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.callbackUrl('google'),
      }),
      { timeout: REQUEST_TIMEOUT, validateStatus: () => true }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      throw new UnauthorizedError(
        tokenResponse.data.error_description || 'Google authorization failed'
      );
    }

    const userResponse = await axios.get<GoogleUserInfo>(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` }, timeout: REQUEST_TIMEOUT }
    );

    const { sub, email, email_verified: emailVerified } = userResponse.data;
    if (!email || !emailVerified) {
      throw new UnauthorizedError('Your Google account has no verified email address');
    }

    return {
      providerUserId: sub,
      email: email.toLowerCase(),
    };
  },

  // Sign in the user linked to this identity, linking or creating an account on first use
  async signIn(
    provider: OAuthProvider,
    profile: OAuthProfile
  ): Promise<{ user: User; token: string }> {
    let user = await OAuthAccountModel.findUser(provider, profile.providerUserId);

    if (!user) {
      // The provider verified this email, so it is safe to link to an existing account
      user =
        (await UserModel.findByEmailInsensitive(profile.email)) ||
        (await UserModel.create(profile.email, null));
      await OAuthAccountModel.create(user.id, provider, profile.providerUserId, profile.email);
    }

    const token = AuthService.generateToken(user);

    // Remove password hash before returning
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  },
};
