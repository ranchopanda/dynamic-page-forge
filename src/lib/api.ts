const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const authToken = token || this.token;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async login(data: { email: string; password: string }) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    return this.request<any>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Designs
  async getMyDesigns() {
    return this.request<any[]>('/designs/my');
  }

  async getDesignGallery(params?: { page?: number; limit?: number; style?: string; sort?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ designs: any[]; pagination: any }>(`/designs/gallery?${query}`);
  }

  async getDesign(id: string) {
    return this.request<any>(`/designs/${id}`);
  }

  async createDesign(data: {
    styleId?: string;
    handImageUrl: string;
    generatedImageUrl: string;
    outfitContext?: string;
    handAnalysis?: any;
    isPublic?: boolean;
  }) {
    return this.request<any>('/designs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDesign(id: string, data: { isPublic?: boolean; outfitContext?: string }) {
    return this.request<any>(`/designs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async likeDesign(id: string) {
    return this.request<{ likes: number }>(`/designs/${id}/like`, { method: 'POST' });
  }

  async deleteDesign(id: string) {
    return this.request<{ message: string }>(`/designs/${id}`, { method: 'DELETE' });
  }

  // Styles
  async getStyles() {
    return this.request<any[]>('/styles');
  }

  async getStyle(id: string) {
    return this.request<any>(`/styles/${id}`);
  }

  // Bookings
  async getMyBookings() {
    return this.request<any[]>('/bookings/my');
  }

  async getBooking(id: string) {
    return this.request<any>(`/bookings/${id}`);
  }

  async createBooking(data: {
    designId?: string;
    consultationType: 'VIRTUAL' | 'IN_PERSON' | 'ON_SITE';
    scheduledDate: string;
    scheduledTime: string;
    eventDate?: string;
    message?: string;
  }) {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelBooking(id: string) {
    return this.request<any>(`/bookings/${id}/cancel`, { method: 'POST' });
  }

  // Artists
  async getArtists(available?: boolean) {
    const query = available !== undefined ? `?available=${available}` : '';
    return this.request<any[]>(`/artists${query}`);
  }

  async getArtist(id: string) {
    return this.request<any>(`/artists/${id}`);
  }

  async submitReview(artistId: string, data: { rating: number; comment?: string; images?: string[] }) {
    return this.request<any>(`/artists/${artistId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Newsletter
  async subscribeNewsletter(email: string) {
    return this.request<{ message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // File upload
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/designs/upload-hand`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request<{
      totalUsers: number;
      totalDesigns: number;
      totalBookings: number;
      pendingBookings: number;
      totalArtists: number;
      recentBookings: any[];
      bookingsByStatus: Record<string, number>;
      designsByStyle: any[];
    }>('/admin/stats');
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ users: any[]; pagination: any }>(`/admin/users?${query}`);
  }

  async updateUserRole(userId: string, role: 'USER' | 'ARTIST' | 'ADMIN') {
    return this.request<any>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Admin Style Management
  async getAdminStyles() {
    return this.request<any[]>('/admin/styles');
  }

  async createStyle(data: {
    name: string;
    description: string;
    imageUrl: string;
    promptModifier: string;
    category: string;
    complexity: string;
    coverage: string;
  }) {
    return this.request<any>('/admin/styles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStyle(styleId: string, data: Partial<{
    name: string;
    description: string;
    imageUrl: string;
    promptModifier: string;
    category: string;
    complexity: string;
    coverage: string;
    isActive: boolean;
  }>) {
    return this.request<any>(`/admin/styles/${styleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStyle(styleId: string) {
    return this.request<{ message: string }>(`/admin/styles/${styleId}`, {
      method: 'DELETE',
    });
  }

  // Admin Design Review
  async getAdminDesigns(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ designs: any[]; pagination: any }>(`/admin/designs?${query}`);
  }

  async getDesignReviewStats() {
    return this.request<{
      pending: number;
      approved: number;
      rejected: number;
      totalWithFeedback: number;
      avgRating: number;
      ratingDistribution: Record<number, number>;
    }>('/admin/designs/stats');
  }

  async reviewDesign(designId: string, data: { status: 'APPROVED' | 'REJECTED'; notes?: string; canBeTemplate?: boolean }) {
    return this.request<any>(`/admin/designs/${designId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getDesignsWithFeedback(params?: { page?: number; limit?: number; minRating?: number; maxRating?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ designs: any[]; pagination: any }>(`/admin/designs/feedback?${query}`);
  }

  async getApprovedTemplates() {
    return this.request<any[]>('/admin/designs/templates');
  }

  // User Feedback
  async submitDesignFeedback(designId: string, data: { rating: number; feedback?: string }) {
    return this.request<any>(`/designs/${designId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPublicTemplates() {
    return this.request<any[]>('/designs/templates/approved');
  }

  async uploadStyleImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/admin/styles/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }
}

export const api = new ApiClient(API_URL);
export default api;
