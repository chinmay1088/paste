import { createClient } from '@/utils/supabase/client';
import { createClient as createServerClient } from '@/utils/supabase/server';

export interface Paste {
  id: string;
  title?: string;
  content: string;
  format: string;
  user_id?: string;
  is_public: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePasteData {
  title?: string;
  content: string;
  format: string;
  is_public?: boolean;
  expires_at?: string;
}

export interface UpdatePasteData {
  title?: string;
  content?: string;
  format?: string;
  is_public?: boolean;
  expires_at?: string;
}

// Client-side paste operations
export class PasteService {
  private supabase = createClient();

  async createPaste(data: CreatePasteData): Promise<{ data: Paste | null; error: any }> {
    const { data: user } = await this.supabase.auth.getUser();
    
    const pasteData = {
      ...data,
      user_id: user.user?.id || null,
      is_public: data.is_public ?? true,
    };

    return await this.supabase
      .from('pastes')
      .insert(pasteData)
      .select()
      .single();
  }

  async getPaste(id: string): Promise<{ data: Paste | null; error: any }> {
    return await this.supabase
      .from('pastes')
      .select('*')
      .eq('id', id)
      .single();
  }

  async getUserPastes(): Promise<{ data: Paste[] | null; error: any }> {
    const { data: user } = await this.supabase.auth.getUser();
    
    if (!user.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    return await this.supabase
      .from('pastes')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });
  }

  async getPublicPastes(limit = 20): Promise<{ data: Paste[] | null; error: any }> {
    return await this.supabase
      .from('pastes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  async updatePaste(id: string, data: UpdatePasteData): Promise<{ data: Paste | null; error: any }> {
    return await this.supabase
      .from('pastes')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }

  async deletePaste(id: string): Promise<{ error: any }> {
    return await this.supabase
      .from('pastes')
      .delete()
      .eq('id', id);
  }

  async searchPastes(query: string): Promise<{ data: Paste[] | null; error: any }> {
    return await this.supabase
      .from('pastes')
      .select('*')
      .eq('is_public', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);
  }
}

// Server-side paste operations
export class ServerPasteService {
  private async getSupabase() {
    return await createServerClient();
  }

  async getPaste(id: string): Promise<{ data: Paste | null; error: any }> {
    const supabase = await this.getSupabase();
    return await supabase
      .from('pastes')
      .select('*')
      .eq('id', id)
      .single();
  }

  async getUserPastes(userId: string): Promise<{ data: Paste[] | null; error: any }> {
    const supabase = await this.getSupabase();
    return await supabase
      .from('pastes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async getPublicPastes(limit = 20): Promise<{ data: Paste[] | null; error: any }> {
    const supabase = await this.getSupabase();
    return await supabase
      .from('pastes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
  }
}

// Export singleton instances
export const pasteService = new PasteService();
export const serverPasteService = new ServerPasteService();
