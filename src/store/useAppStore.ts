'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GeneratedKey = {
  id: string;
  name: string;
  key: string;
  prefix: string;
  lastFour: string;
  createdAt: string;
  expiresAt?: string | null;
};

type AppState = {
  url: string;
  apiKey: string;
  email: string;
  mode: 'video' | 'audio';
  generatedKeys: GeneratedKey[];
  setUrl: (url: string) => void;
  setApiKey: (apiKey: string) => void;
  setEmail: (email: string) => void;
  setMode: (mode: 'video' | 'audio') => void;
  addGeneratedKey: (key: GeneratedKey) => void;
  removeGeneratedKey: (id: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      url: '',
      apiKey: '',
      email: '',
      mode: 'video',
      generatedKeys: [],
      setUrl: (url) => set({ url }),
      setApiKey: (apiKey) => set({ apiKey }),
      setEmail: (email) => set({ email }),
      setMode: (mode) => set({ mode }),
      addGeneratedKey: (key) =>
        set((state) => ({
          generatedKeys: [key, ...state.generatedKeys.filter((item) => item.id !== key.id)],
          apiKey: key.key
        })),
      removeGeneratedKey: (id) => set((state) => ({ generatedKeys: state.generatedKeys.filter((item) => item.id !== id) }))
    }),
    { name: 'video-downloader-saas-state', version: 1 }
  )
);
