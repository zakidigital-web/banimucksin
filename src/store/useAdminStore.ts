import { create } from 'zustand';

export type AdminTabType = 'dashboard' | 'family' | 'members' | 'gallery' | 'events' | 'database' | 'settings' | 'about';

interface AdminState {
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab, editingId: null, isEditMode: false }),
  isEditMode: false,
  setEditMode: (mode) => set({ isEditMode: mode }),
  editingId: null,
  setEditingId: (id) => set({ editingId: id, isEditMode: !!id }),
}));
