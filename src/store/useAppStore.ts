import { create } from 'zustand';

export type TabType = 'home' | 'tree' | 'members' | 'gallery' | 'profile' | 'about';

interface AppState {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedMember: string | null;
  setSelectedMember: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedMember: null,
  setSelectedMember: (id) => set({ selectedMember: id }),
}));
