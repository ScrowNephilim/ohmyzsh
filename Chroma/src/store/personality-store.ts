import { create } from 'zustand';
import { table } from '@devvai/devv-code-backend';

const PERSONALITIES_TABLE_ID = 'f3zvrlgcblz4';

export interface Personality {
  _id: string;
  name: string;
  description: string;
  system_prompt: string;
  tone: string;
  expertise: string;
  creativity: number;
  verbosity: number;
  emoji_usage: string;
  language_style: string;
  created_at: string;
  updated_at: string;
}

interface PersonalityStore {
  personalities: Personality[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPersonalities: () => Promise<void>;
  createPersonality: (personality: Omit<Personality, '_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePersonality: (id: string, updates: Partial<Personality>) => Promise<void>;
  deletePersonality: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePersonalityStore = create<PersonalityStore>((set, get) => ({
  personalities: [],
  isLoading: false,
  error: null,

  loadPersonalities: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await table.getItems(PERSONALITIES_TABLE_ID, {
        limit: 100,
        sort: 'created_at',
        order: 'desc'
      });

      const personalities = result.items as Personality[];
      set({ personalities, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load personalities',
        isLoading: false 
      });
    }
  },

  createPersonality: async (personality) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      await table.addItem(PERSONALITIES_TABLE_ID, {
        ...personality,
        created_at: now,
        updated_at: now,
      });

      await get().loadPersonalities();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create personality',
        isLoading: false 
      });
    }
  },

  updatePersonality: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await table.updateItem(PERSONALITIES_TABLE_ID, {
        _id: id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

      await get().loadPersonalities();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update personality',
        isLoading: false 
      });
    }
  },

  deletePersonality: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await table.deleteItem(PERSONALITIES_TABLE_ID, {
        _id: id
      });

      set(state => ({
        personalities: state.personalities.filter(p => p._id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete personality',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
