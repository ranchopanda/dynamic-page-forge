import { supabase, Profile, HennaStyle, Design, Booking, BlogPost, SiteSettings, ArtistProfile, Review } from './supabase';
import type { Session } from '@supabase/supabase-js';

class SupabaseApiClient {
  // Auth
  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, phone: data.phone }
      }
    });
    if (error) throw new Error(error.message);
    return { user: authData.user, session: authData.session };
  }

  async login(data: { email: string; password: string }) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    if (error) throw new Error(error.message);
    
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    return { user: { ...authData.user, ...profile }, token: authData.session?.access_token };
  }

  async getMe(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return profile;
  }

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return profile;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) throw new Error(error.message);
    return { message: 'Password updated successfully' };
  }

  async logout() {
    await supabase.auth.signOut();
  }

  // Designs
  async getMyDesigns(): Promise<Design[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('designs')
      .select('*, style:henna_styles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getDesignGallery(params?: { page?: number; limit?: number; style?: string; sort?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('designs')
      .select('*, style:henna_styles(*), profile:profiles(name, avatar)', { count: 'exact' })
      .eq('is_public', true)
      .eq('review_status', 'APPROVED');
    
    if (params?.style) {
      query = query.eq('style_id', params.style);
    }
    
    if (params?.sort === 'popular') {
      query = query.order('likes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    if (error) throw new Error(error.message);
    return {
      designs: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
    };
  }

  async getDesign(id: string): Promise<Design | null> {
    const { data, error } = await supabase
      .from('designs')
      .select('*, style:henna_styles(*), profile:profiles(name, avatar)')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async createDesign(data: {
    styleId?: string;
    handImageUrl: string;
    generatedImageUrl: string;
    outfitContext?: string;
    handAnalysis?: any;
    isPublic?: boolean;
    reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }): Promise<Design> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: design, error } = await supabase
      .from('designs')
      .insert({
        user_id: user.id,
        style_id: data.styleId,
        hand_image_url: data.handImageUrl,
        generated_image_url: data.generatedImageUrl,
        outfit_context: data.outfitContext,
        hand_analysis: data.handAnalysis,
        is_public: data.isPublic || false,
        review_status: data.reviewStatus || 'PENDING'
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return design;
  }

  async updateDesign(id: string, data: { isPublic?: boolean; outfitContext?: string }): Promise<Design> {
    const { data: design, error } = await supabase
      .from('designs')
      .update({ is_public: data.isPublic, outfit_context: data.outfitContext })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return design;
  }

  async likeDesign(id: string) {
    const { data, error } = await supabase.rpc('increment_likes', { design_id: id });
    if (error) {
      // Fallback: direct update
      const { data: design } = await supabase.from('designs').select('likes').eq('id', id).single();
      const { error: updateError } = await supabase
        .from('designs')
        .update({ likes: (design?.likes || 0) + 1 })
        .eq('id', id);
      if (updateError) throw new Error(updateError.message);
    }
    return { likes: data };
  }

  async deleteDesign(id: string) {
    const { error } = await supabase.from('designs').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Design deleted' };
  }


  // Styles
  async getStyles(): Promise<any[]> {
    const { data, error } = await supabase
      .from('henna_styles')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw new Error(error.message);
    
    // Transform snake_case to camelCase for frontend compatibility
    return (data || []).map(style => ({
      id: style.id,
      name: style.name,
      description: style.description,
      imageUrl: style.image_url,
      promptModifier: style.prompt_modifier,
      category: style.category,
      complexity: style.complexity,
      coverage: style.coverage,
      isActive: style.is_active,
    }));
  }

  async getStyle(id: string): Promise<HennaStyle | null> {
    const { data, error } = await supabase
      .from('henna_styles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // Bookings
  async getMyBookings(): Promise<Booking[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*, design:designs(*), artist:artist_profiles(*, profile:profiles(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getBooking(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, design:designs(*), artist:artist_profiles(*, profile:profiles(*))')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async createBooking(data: {
    designId?: string;
    consultationType: 'VIRTUAL' | 'IN_PERSON' | 'ON_SITE';
    scheduledDate: string;
    scheduledTime: string;
    eventDate?: string;
    message?: string;
  }): Promise<Booking> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const confirmationCode = `BK${Date.now().toString(36).toUpperCase()}`;
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        design_id: data.designId,
        consultation_type: data.consultationType,
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime,
        event_date: data.eventDate,
        message: data.message,
        confirmation_code: confirmationCode
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return booking;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // Artists
  async getArtists(available?: boolean): Promise<ArtistProfile[]> {
    let query = supabase
      .from('artist_profiles')
      .select('*, profile:profiles(*)');
    
    if (available !== undefined) {
      query = query.eq('available', available);
    }
    
    const { data, error } = await query.order('rating', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getArtist(id: string): Promise<ArtistProfile | null> {
    const { data, error } = await supabase
      .from('artist_profiles')
      .select('*, profile:profiles(*)')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async submitReview(artistId: string, data: { rating: number; comment?: string; images?: string[] }): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: review, error } = await supabase
      .from('reviews')
      .upsert({
        user_id: user.id,
        artist_id: artistId,
        rating: data.rating,
        comment: data.comment,
        images: data.images || []
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return review;
  }

  // Newsletter
  async subscribeNewsletter(email: string) {
    const { error } = await supabase.from('newsletter').insert({ email });
    if (error) {
      if (error.code === '23505') return { message: 'Already subscribed' };
      throw new Error(error.message);
    }
    return { message: 'Subscribed successfully' };
  }


  // File upload
  async uploadImage(file: File, bucket: string = 'designs'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw new Error(error.message);
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  }

  // Blog
  async getBlogPosts(params?: { page?: number; limit?: number; category?: string; featured?: boolean }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true);
    
    if (params?.category) query = query.eq('category', params.category);
    if (params?.featured) query = query.eq('is_featured', true);
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(error.message);
    return {
      posts: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
    };
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    if (error) throw new Error(error.message);
    
    // Increment views
    await supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
    
    return data;
  }

  // Settings
  async getSettings(): Promise<SiteSettings | null> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'settings')
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  // Admin endpoints
  async getAdminStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') throw new Error('Not authorized');
    
    const [users, designs, bookings, artists] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('designs').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('artist_profiles').select('*', { count: 'exact', head: true })
    ]);
    
    const { data: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');
    
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('*, profile:profiles(name, email)')
      .order('created_at', { ascending: false })
      .limit(5);
    
    return {
      totalUsers: users.count || 0,
      totalDesigns: designs.count || 0,
      totalBookings: bookings.count || 0,
      pendingBookings: pendingBookings?.length || 0,
      totalArtists: artists.count || 0,
      recentBookings: recentBookings || []
    };
  }

  async getAdminUsers(params?: { page?: number; limit?: number; role?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;
    
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    if (params?.role) query = query.eq('role', params.role);
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(error.message);
    return {
      users: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
    };
  }

  async updateUserRole(userId: string, role: 'USER' | 'ARTIST' | 'ADMIN') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }


  // Admin Style Management
  async getAdminStyles(): Promise<any[]> {
    const { data, error } = await supabase
      .from('henna_styles')
      .select('*')
      .order('name');
    
    if (error) throw new Error(error.message);
    
    // Map snake_case to camelCase for frontend
    return (data || []).map(style => ({
      id: style.id,
      name: style.name,
      description: style.description,
      imageUrl: style.image_url,
      promptModifier: style.prompt_modifier,
      category: style.category,
      complexity: style.complexity,
      coverage: style.coverage,
      isActive: style.is_active,
      createdAt: style.created_at,
      updatedAt: style.updated_at
    }));
  }

  async createStyle(data: {
    name: string;
    description: string;
    imageUrl: string;
    promptModifier: string;
    category: string;
    complexity: string;
    coverage: string;
  }): Promise<any> {
    const { data: style, error } = await supabase
      .from('henna_styles')
      .insert({
        name: data.name,
        description: data.description,
        image_url: data.imageUrl,
        prompt_modifier: data.promptModifier,
        category: data.category,
        complexity: data.complexity,
        coverage: data.coverage
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Map snake_case to camelCase
    return {
      id: style.id,
      name: style.name,
      description: style.description,
      imageUrl: style.image_url,
      promptModifier: style.prompt_modifier,
      category: style.category,
      complexity: style.complexity,
      coverage: style.coverage,
      isActive: style.is_active,
      createdAt: style.created_at,
      updatedAt: style.updated_at
    };
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
  }>): Promise<any> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.promptModifier !== undefined) updateData.prompt_modifier = data.promptModifier;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.complexity !== undefined) updateData.complexity = data.complexity;
    if (data.coverage !== undefined) updateData.coverage = data.coverage;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    
    const { data: style, error } = await supabase
      .from('henna_styles')
      .update(updateData)
      .eq('id', styleId)
      .select()
      .single();
    
    if (error) {
      console.error('Style update error:', error);
      throw new Error(error.message);
    }
    
    // Map snake_case to camelCase
    return {
      id: style.id,
      name: style.name,
      description: style.description,
      imageUrl: style.image_url,
      promptModifier: style.prompt_modifier,
      category: style.category,
      complexity: style.complexity,
      coverage: style.coverage,
      isActive: style.is_active,
      createdAt: style.created_at,
      updatedAt: style.updated_at
    };
  }

  async deleteStyle(styleId: string) {
    const { error } = await supabase.from('henna_styles').delete().eq('id', styleId);
    if (error) throw new Error(error.message);
    return { message: 'Style deleted' };
  }

  async uploadStyleImage(file: File): Promise<string> {
    return this.uploadImage(file, 'styles');
  }

  // Admin Design Review
  async getAdminDesigns(params?: { page?: number; limit?: number; status?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('designs')
      .select('*, style:henna_styles(*), profile:profiles(name, email)', { count: 'exact' });
    
    if (params?.status) query = query.eq('review_status', params.status);
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw new Error(error.message);
    return {
      designs: data || [],
      pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
    };
  }

  async getDesignReviewStats() {
    const [pending, approved, rejected] = await Promise.all([
      supabase.from('designs').select('*', { count: 'exact', head: true }).eq('review_status', 'PENDING'),
      supabase.from('designs').select('*', { count: 'exact', head: true }).eq('review_status', 'APPROVED'),
      supabase.from('designs').select('*', { count: 'exact', head: true }).eq('review_status', 'REJECTED')
    ]);
    
    const { data: withFeedback } = await supabase
      .from('designs')
      .select('user_rating')
      .not('user_rating', 'is', null);
    
    const ratings = withFeedback?.map(d => d.user_rating) || [];
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    return {
      pending: pending.count || 0,
      approved: approved.count || 0,
      rejected: rejected.count || 0,
      totalWithFeedback: withFeedback?.length || 0,
      avgRating
    };
  }

  async reviewDesign(designId: string, data: { status: 'APPROVED' | 'REJECTED'; notes?: string; canBeTemplate?: boolean }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: design, error } = await supabase
      .from('designs')
      .update({
        review_status: data.status,
        review_notes: data.notes,
        can_be_template: data.canBeTemplate,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id
      })
      .eq('id', designId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return design;
  }

  async submitDesignFeedback(designId: string, data: { rating: number; feedback?: string }) {
    const { data: design, error } = await supabase
      .from('designs')
      .update({
        user_rating: data.rating,
        user_feedback: data.feedback,
        feedback_at: new Date().toISOString()
      })
      .eq('id', designId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return design;
  }

  async getPublicTemplates(): Promise<any[]> {
    const { data, error } = await supabase
      .from('designs')
      .select('*, style:henna_styles(*), profile:profiles(name, avatar)')
      .eq('can_be_template', true)
      .eq('review_status', 'APPROVED')
      .order('likes', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    // Transform to ApprovedTemplate format for frontend
    return (data || []).map(design => ({
      id: design.id,
      generatedImageUrl: design.generated_image_url,
      userRating: design.user_rating || 0,
      style: design.style ? {
        id: design.style.id,
        name: design.style.name,
        category: design.style.category,
      } : null,
      user: design.profile ? { name: design.profile.name } : null,
      createdAt: design.created_at,
    }));
  }

  // Auth state listener
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Admin Blog Management
  async getAdminBlogPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return { data: data || [] };
  }

  async createBlogPost(postData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    scheduledAt?: string | null;
  }) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        category: postData.category,
        tags: postData.tags,
        cover_image: postData.coverImage,
        is_published: postData.isPublished || false,
        is_featured: postData.isFeatured || false,
        scheduled_at: postData.scheduledAt,
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async updateBlogPost(id: string, postData: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    coverImage: string;
    isPublished: boolean;
    isFeatured: boolean;
    scheduledAt: string | null;
  }>) {
    const updateData: any = {};
    if (postData.title) updateData.title = postData.title;
    if (postData.slug) updateData.slug = postData.slug;
    if (postData.excerpt) updateData.excerpt = postData.excerpt;
    if (postData.content) updateData.content = postData.content;
    if (postData.category) updateData.category = postData.category;
    if (postData.tags) updateData.tags = postData.tags;
    if (postData.coverImage) updateData.cover_image = postData.coverImage;
    if (postData.isPublished !== undefined) updateData.is_published = postData.isPublished;
    if (postData.isFeatured !== undefined) updateData.is_featured = postData.isFeatured;
    if (postData.scheduledAt !== undefined) updateData.scheduled_at = postData.scheduledAt;
    
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteBlogPost(id: string) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Post deleted' };
  }

  // Admin Settings
  async updateSettings(settings: Partial<SiteSettings>) {
    const { data, error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', 'settings')
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }
}

export const supabaseApi = new SupabaseApiClient();
export default supabaseApi;
