import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Note: These keys are stored for reference and future use
  // The Devv SDK currently uses internally configured keys
  elevenLabsApiKey: string;
  replicateApiKey: string;
  openrouterApiKey: string;
  xaiApiKey: string; // xAI/Grok API key for accessing conversation exports
  
  // Actions
  setElevenLabsApiKey: (key: string) => void;
  setReplicateApiKey: (key: string) => void;
  setOpenRouterApiKey: (key: string) => void;
  setXaiApiKey: (key: string) => void;
  clearApiKeys: () => void;
  hasElevenLabsKey: () => boolean;
  hasReplicateKey: () => boolean;
  hasOpenRouterKey: () => boolean;
  hasXaiKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      elevenLabsApiKey: '',
      replicateApiKey: '',
      openrouterApiKey: '',
      xaiApiKey: '',
      
      setElevenLabsApiKey: (key: string) => {
        set({ elevenLabsApiKey: key.trim() });
      },
      
      setReplicateApiKey: (key: string) => {
        set({ replicateApiKey: key.trim() });
      },
      
      setOpenRouterApiKey: (key: string) => {
        set({ openrouterApiKey: key.trim() });
      },
      
      setXaiApiKey: (key: string) => {
        set({ xaiApiKey: key.trim() });
      },
      
      clearApiKeys: () => {
        set({ 
          elevenLabsApiKey: '', 
          replicateApiKey: '',
          openrouterApiKey: '',
          xaiApiKey: ''
        });
      },
      
      hasElevenLabsKey: () => {
        const state = get();
        return state.elevenLabsApiKey.length > 0;
      },
      
      hasReplicateKey: () => {
        const state = get();
        return state.replicateApiKey.length > 0;
      },
      
      hasOpenRouterKey: () => {
        const state = get();
        return state.openrouterApiKey.length > 0;
      },
      
      hasXaiKey: () => {
        const state = get();
        return state.xaiApiKey.length > 0;
      },
    }),
    {
      name: 'chroma-settings-storage',
    }
  )
);
