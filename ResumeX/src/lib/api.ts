// API client for backend communication

import type { ResumeTemplate } from './templates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async signup(email: string, password: string) {
    const response = await this.request<ApiResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.request<ApiResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  }

  async getMe() {
    const response = await this.request<ApiResponse>('/auth/me');
    return response.data?.user;
  }

  logout() {
    localStorage.removeItem('token');
  }

  // Store a token received from an OAuth redirect
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Backend URL that starts the OAuth flow (navigated to, not fetched)
  oauthUrl(provider: 'github' | 'google') {
    return `${API_URL}/auth/${provider}`;
  }

  // Profile
  async updateProfile(profileType: string) {
    const response = await this.request<ApiResponse>('/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify({ profile_type: profileType }),
    });
    return response.data?.user;
  }

  // Templates (all = include Pro templates, for browsing)
  async getTemplates(all = false): Promise<ResumeTemplate[]> {
    const response = await this.request<ApiResponse>(`/templates${all ? '?all=true' : ''}`);
    return response.data?.templates || [];
  }

  // AI interviewer
  async getAIStatus(): Promise<boolean> {
    const response = await this.request<ApiResponse>('/ai/status');
    return Boolean(response.data?.available);
  }

  async polish(data: {
    template_id: string;
    form_data: any;
    messages: { role: 'user' | 'assistant'; content: string }[];
    job_description: string;
  }): Promise<{ form_data: any; suggestions: string[] }> {
    const response = await this.request<ApiResponse>('/ai/polish', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async interview(data: {
    template_id: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
    form_data: any;
  }): Promise<{ reply: string; form_data: any; done: boolean }> {
    const response = await this.request<ApiResponse>('/ai/interview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Resumes
  async getResumes() {
    const response = await this.request<ApiResponse>('/resumes');
    return response.data?.resumes || [];
  }

  async getResume(id: string) {
    const response = await this.request<ApiResponse>(`/resumes/${id}`);
    return response.data?.resume;
  }

  async createResume(data: { title: string; template_id: string; form_data: any; interview?: any }) {
    const response = await this.request<ApiResponse>('/resumes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data?.resume;
  }

  async updateResume(id: string, data: any) {
    const response = await this.request<ApiResponse>(`/resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data?.resume;
  }

  async deleteResume(id: string) {
    await this.request<ApiResponse>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  async compileResume(id: string, latexSource?: string) {
    const response = await fetch(`${API_URL}/resumes/${id}/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify({ latex_source: latexSource }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.compiler_log || error.error || 'Compilation failed');
    }

    return response.blob();
  }
}

export const api = new ApiClient();
