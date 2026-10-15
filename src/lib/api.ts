import * as SecureStore from 'expo-secure-store';

export type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string; error?: { code?: string; message?: string; details?: unknown } };
export type ApiUser = { id: string; name: string; email?: string | null; phone: string; role: 'CUSTOMER' | 'DEALER' | 'ADMIN'; status?: string; dealerProfile?: { id: string; businessName: string; city: string; verificationStatus: string } };
export type Session = { user: ApiUser; accessToken: string; refreshToken: string; tokenType?: string; expiresIn?: number };

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '') || 'https://sm-associate-dealer-backend-sand.vercel.app/api/v1');
const ACCESS_KEY = 'smcars.accessToken';
const REFRESH_KEY = 'smcars.refreshToken';
let refreshInFlight: Promise<boolean> | null = null;

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let body: any = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { message: raw || 'The server returned an invalid response.' }; }
  if (!response.ok || body?.success === false) {
    const message = body?.error?.message || body?.message || body?.error || `Request failed (${response.status}).`;
    const error = new Error(typeof message === 'string' ? message : 'The request could not be completed.') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body as T;
}

async function rawRequest<T>(path: string, init: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;
    const headers = new Headers(init.headers || {});
    headers.set('Accept', 'application/json');
    if (!isForm && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init, signal: controller.signal, headers,
    });
    return await parseResponse<T>(response);
  } catch (error: any) {
    if (error?.name === 'AbortError') throw new Error('The server took too long to respond. Please try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) refreshInFlight = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) return false;
    try {
      const response = await rawRequest<ApiEnvelope<Omit<Session, 'user'>>>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
      const data: any = response?.data || response;
      if (!data?.accessToken || !data?.refreshToken) return false;
      await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
      return true;
    } catch { return false; }
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export const api = {
  async request<T = any>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
    const accessToken = authenticated ? await SecureStore.getItemAsync(ACCESS_KEY) : null;
    const headers = new Headers(init.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    try {
      return await rawRequest<T>(path, { ...init, headers });
    } catch (error: any) {
      if (authenticated && error?.status === 401) {
        if (await refreshSession()) {
          const nextToken = await SecureStore.getItemAsync(ACCESS_KEY);
          const retryHeaders = new Headers(init.headers || {});
          if (nextToken) retryHeaders.set('Authorization', `Bearer ${nextToken}`);
          return rawRequest<T>(path, { ...init, headers: retryHeaders });
        }
        await this.clearSession();
      }
      throw error;
    }
  },
  async login(identifier: string, password: string, role: 'CUSTOMER' | 'DEALER'): Promise<Session> {
    const response: any = await this.request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password, role }) }, false);
    const session: Session = response.data || response;
    if (!session?.accessToken || !session?.refreshToken || !session?.user) throw new Error('Login response is missing user or session tokens.');
    await SecureStore.setItemAsync(ACCESS_KEY, session.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken);
    return session;
  },
  async register(input: { name: string; phone: string; email?: string; password: string; confirmPassword: string; role: 'CUSTOMER' | 'DEALER'; businessName?: string; city?: string }): Promise<Session> {
    const endpoint = input.role === 'DEALER' ? '/auth/register/dealer' : '/auth/register/customer';
    const { role, businessName, city, ...base } = input;
    const { email, ...requiredFields } = base;
    const contactFields = { ...requiredFields, ...(email ? { email } : {}) };
    const payload = role === 'DEALER' ? { ...contactFields, businessName, city: city || 'Tirunelveli' } : contactFields;
    const response: any = await this.request(endpoint, { method: 'POST', body: JSON.stringify(payload) }, false);
    const session: Session = response.data || response;
    if (!session?.accessToken || !session?.refreshToken || !session?.user) throw new Error('Registration response is missing user or session tokens.');
    await SecureStore.setItemAsync(ACCESS_KEY, session.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken);
    return session;
  },
  async currentUser(): Promise<ApiUser> {
    const response: any = await this.request('/auth/me');
    return response.data?.user || response.data;
  },
  async logout(): Promise<void> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    try { if (refreshToken) await this.request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } catch { /* Always clear local session. */ }
    await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
  },
  async clearSession(): Promise<void> { await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]); },
  async hasSession(): Promise<boolean> { return !!(await SecureStore.getItemAsync(REFRESH_KEY)); },
  async marketplace(params: Record<string, string | number | undefined> = {}): Promise<any[]> {
    const query = Object.entries(params).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&');
    const response: any = await this.request(`/cars${query ? `?${query}` : ''}`, {}, false);
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || data?.cars || [];
  },
};

export function toMobileUser(user: ApiUser) {
  return { name: user.name, email: user.email || '', phone: user.phone || '', role: user.role === 'DEALER' ? 'Dealer' as const : 'Customer' as const, dealerName: user.dealerProfile?.businessName, verified: user.dealerProfile?.verificationStatus === 'APPROVED' };
}
