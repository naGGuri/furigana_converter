import { create } from 'zustand';

interface LayoutState {
  isHeaderVisible: boolean;
  isBottomNavVisible: boolean;
  showHeader: () => void;
  hideHeader: () => void;
  showBottomNav: () => void;
  hideBottomNav: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isHeaderVisible: true,
  isBottomNavVisible: true,
  showHeader: () => set({ isHeaderVisible: true }),
  hideHeader: () => set({ isHeaderVisible: false }),
  showBottomNav: () => set({ isBottomNavVisible: true }),
  hideBottomNav: () => set({ isBottomNavVisible: false }),
}));
