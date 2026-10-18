import * as SecureStore from 'expo-secure-store';

export type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string; error?: { code?: string; message?: string; details?: unknown } };
export type ApiUser = { id: string; name: string; email?: string | null; phone: string; role: 'CUSTOMER' | 'DEALER' | 'ADMIN'; status?: string; dealerProfile?: { id: string; businessName: string; city: string; verificationStatus: string } };
export type Session = { user: ApiUser; accessToken: string; refreshToken: string; tokenType?: string; expiresIn?: number };

const configuredApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '');
const normalizeApiBaseUrl = (value: string) => {
  const clean = value.trim().replace(/\/+$/, '');
  if (/\/api\/v1$/i.test(clean)) return clean;
  if (/\/api$/i.test(clean)) return `${clean}/v1`;
  return `${clean}/api/v1`;
};
export const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl || 'https://sm-associate-dealer-backend-sand.vercel.app/api/v1');
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
    const response: any = await this.request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier: identifier.includes('@') ? identifier.trim().toLowerCase() : identifier.trim().replace(/[^0-9+]/g, ''), password, role }) }, false);
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

  async loginWithGoogle(_idToken: string, _role: 'CUSTOMER' | 'DEALER', _dealer?: { businessName?: string; city?: string }): Promise<Session> {
    throw new Error('Google sign-in is not supported by the current backend yet. Please sign in with your phone/email and password.');
  },
  async loginWithFacebook(_accessToken: string, _role: 'CUSTOMER' | 'DEALER', _dealer?: { businessName?: string; city?: string }): Promise<Session> {
    throw new Error('Facebook sign-in is not supported by the current backend yet. Please sign in with your phone/email and password.');
  },
  async currentUser(): Promise<ApiUser> {
    const response: any = await this.request('/auth/me');
    return response.data?.user || response.data;
  },
  async updateCustomerProfile(input: { name?: string; phone?: string; email?: string | null }): Promise<ApiUser> {
    const response: any = await this.request('/users/me', { method: 'PATCH', body: JSON.stringify(input) });
    const user = response.data?.user || response.data;
    if (!user?.id || !user?.name) throw new Error('The server did not confirm the profile update.');
    return user as ApiUser;
  },
  async logout(): Promise<void> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    try { if (refreshToken) await this.request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } catch { /* Always clear local session. */ }
    await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]);
  },
  async clearSession(): Promise<void> { await Promise.all([SecureStore.deleteItemAsync(ACCESS_KEY), SecureStore.deleteItemAsync(REFRESH_KEY)]); },
  async hasSession(): Promise<boolean> { return !!(await SecureStore.getItemAsync(REFRESH_KEY)); },
  async favorites(): Promise<any[]> {
    const response: any = await this.request('/favorites');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  },
  async addFavorite(carId: string): Promise<void> {
    await this.request('/favorites', { method: 'POST', body: JSON.stringify({ carId }) });
  },
  async removeFavorite(carId: string): Promise<void> {
    await this.request(`/favorites/${encodeURIComponent(carId)}`, { method: 'DELETE' });
  },
  async submitSellCarRequest(input: { contactName: string; contactPhone: string; city: string; brand: string; model: string; year?: number; kms?: number }): Promise<any> {
    // This route is customer-authenticated; include the stored Bearer token.
    return this.request('/sell-car-requests', { method: 'POST', body: JSON.stringify(input) });
  },
  async sendEnquiry(carId: string, message: string): Promise<any> {
    return this.request('/enquiries', { method: 'POST', body: JSON.stringify({ carId, message }) });
  },
  async myEnquiries(): Promise<any[]> {
    const response: any = await this.request('/enquiries/me');
    return Array.isArray(response.data) ? response.data : response.data?.items || [];
  },
  async createDealerCar(input: { brand: string; model: string; variant?: string; title?: string; description?: string; priceInr: number; manufacturingYear: number; mileageKm: number; fuelType: 'PETROL'|'DIESEL'|'CNG'|'ELECTRIC'|'HYBRID'; transmission: 'MANUAL'|'AUTOMATIC'; ownershipCount?: number; city?: string; state?: string }): Promise<any> {
    return this.request('/dealer/cars', { method: 'POST', body: JSON.stringify(input) });
  },
  async dealerCars(status?: string): Promise<any[]> {
    const response: any = await this.request(`/dealer/cars${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  },
  async uploadDealerCarImage(carId: string, uri: string, index: number, isCover: boolean): Promise<any> {
    const cleanUri = uri.split('?')[0];
    const extension = cleanUri.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileName = `vehicle-${index + 1}.${extension === 'png' || extension === 'webp' ? extension : 'jpg'}`;
    const form = new FormData();
    form.append('file', { uri, name: fileName, type: mimeType } as any);
    form.append('isCover', isCover ? 'true' : 'false');
    form.append('sortOrder', String(index));
    return this.request(`/dealer/cars/${encodeURIComponent(carId)}/images`, { method: 'POST', body: form });
  },
  async changeDealerCarStatus(carId: string, status: 'DRAFT'|'PENDING_APPROVAL'|'RESERVED'|'SOLD'|'ARCHIVED'): Promise<any> {
    return this.request(`/dealer/cars/${encodeURIComponent(carId)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  // The shared backend does not yet expose a dealer expense ledger. Do not call
  // known-missing routes: their 404 response previously caused Promise.all()
  // to discard otherwise valid dealer enquiries and test-drive data.
  async dealerExpenses(): Promise<any[]> { return []; },
  async createDealerExpense(_input: { carId: string; category: string; amount: number; note?: string }): Promise<any> {
    throw new Error('Vehicle expense tracking is not available yet because the backend expense API has not been implemented.');
  },
  // Sales/acquisition accounting is also not implemented by the shared backend.
  // Keep the UI explicit rather than presenting locally persisted figures as real records.
  async dealerSales(): Promise<any[]> { return []; },
  async recordDealerSale(_input: { carId: string; salePrice: number; acquisitionCost: number }): Promise<any> {
    throw new Error('Sales and profit tracking are not available yet because the backend sales API has not been implemented.');
  },
  async dealerEnquiries(type?: 'CAR_ENQUIRY' | 'SELL_CAR'): Promise<any[]> {
    const response: any = await this.request(`/dealer/enquiries${type ? `?type=${encodeURIComponent(type)}` : ''}`);
    return Array.isArray(response.data) ? response.data : response.data?.items || [];
  },
  async updateDealerEnquiry(id: string, status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED'): Promise<any> {
    return this.request(`/dealer/enquiries/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async dealerTestDrives(status?: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<any[]> {
    const response: any = await this.request(`/dealer/test-drives${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    return Array.isArray(response.data) ? response.data : response.data?.items || [];
  },
  async updateDealerTestDrive(id: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<any> {
    return this.request(`/dealer/test-drives/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async reportCar(input: { carId: string; reason: string; details?: string }): Promise<any> {
    return this.request('/reports', { method: 'POST', body: JSON.stringify(input) });
  },
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
