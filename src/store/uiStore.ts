import { create } from 'zustand';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  activeModal: string | null;
  setActiveModal: (name: string | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: (): void => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toasts: [],
  addToast: (toast): void =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id): void =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  activeModal: null,
  setActiveModal: (name): void => set({ activeModal: name }),
}));
