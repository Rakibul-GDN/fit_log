import { create } from 'zustand';

type UnitSystem = 'METRIC' | 'IMPERIAL';

interface SettingsState {
  preferredUnits: UnitSystem;
  setPreferredUnits: (units: UnitSystem) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  preferredUnits: 'METRIC',
  setPreferredUnits: (units): void => set({ preferredUnits: units }),
}));
