import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  updated_at: string;
}

interface UserState {
  profile: Profile | null;
  session: Session | null;
  isLoadingProfile: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  updateNickname: (nickname: string) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  session: null,
  isLoadingProfile: false,

  fetchProfile: async (userId: string) => {
    try {
      set({ isLoadingProfile: true });
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile in store:', error);
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  setProfile: (profile) => set({ profile }),

  setSession: (session) => {
    set({ session });
  },

  updateNickname: (nickname) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      set({ profile: { ...currentProfile, nickname } });
    }
  },

  clearProfile: () => set({ profile: null, session: null }),
}));
