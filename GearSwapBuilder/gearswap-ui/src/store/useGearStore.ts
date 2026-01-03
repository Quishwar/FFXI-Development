import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---

export type EquippedItem = {
  name: string;
  augments?: string[];
  rank?: number;
  path?: string;
};

export type GearSet = Record<string, string | EquippedItem>;

interface GearStore {
  allSets: Record<string, GearSet>;
  baseSets: Record<string, string>; // Tracks inheritance: { "sets.midcast.WS": "sets.precast.WS" }
  activeTab: string;
  theme: 'dark' | 'ffxi';
  searchableItems: Record<string, string[]>;
  searchTerm: string;
  luaCode: string;
  selectedModes: Record<string, string>;
  characterName: string;
  jobName: string;

  // Actions
  setCharacterInfo: (name: string, job: string) => void;
  setTheme: (theme: 'dark' | 'ffxi') => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setLuaCode: (code: string) => void;
  setMode: (mode: string, option: string) => void;
  addSet: (name: string, baseSet?: string) => void;
  removeSet: (name: string) => void;
  updateSlot: (setName: string, slot: string, item: string | EquippedItem) => void;
  clearSet: (setName: string) => void;
  clearSets: () => void;
  initializeItems: (data: Record<string, string[]>) => void;
  importSets: (incomingSets: Record<string, GearSet>, bases?: Record<string, string>) => void;
  updateAugments: (setName: string, slot: string, augs: Partial<EquippedItem>) => void;
  setBaseSets: (bases: Record<string, string>) => void;
}

// --- Store Implementation ---

export const useGearStore = create<GearStore>()(
  persist(
    (set) => ({
      allSets: { "sets.idle": {}, "sets.engaged": {} },
      baseSets: {},
      activeTab: "sets.idle",
      theme: 'dark',
      searchableItems: {},
      searchTerm: "",
      luaCode: "",
      selectedModes: {},
      characterName: "",
      jobName: "",

      setCharacterInfo: (name, job) => set({ characterName: name, jobName: job }),
      
      initializeItems: (data) => set({ searchableItems: data }),
      
      setTheme: (theme) => set({ theme }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setSearchTerm: (term) => set({ searchTerm: term }),

      setBaseSets: (bases) => set({ baseSets: bases }),

      setLuaCode: (code) => set((state) => {
        const stateRegex = /state\.(\w+):options\((.*?)\)/g;
        const initialModes: Record<string, string> = {};
        let match;
        while ((match = stateRegex.exec(code)) !== null) {
          const [_, modeName, optionsRaw] = match;
          const firstOption = optionsRaw.split(',')[0].replace(/['"\s]/g, '');
          initialModes[modeName.replace('Mode', '')] = firstOption;
        }
        return { luaCode: code, selectedModes: initialModes };
      }),

      setMode: (mode, option) => set((state) => ({
        selectedModes: { ...state.selectedModes, [mode]: option }
      })),

      clearSets: () => set({
        allSets: { "sets.idle": {}, "sets.engaged": {} },
        baseSets: {},
        activeTab: "sets.idle",
        searchTerm: "",
        luaCode: "",
        selectedModes: {},
        characterName: "",
        jobName: ""
      }),

      addSet: (name, baseSet) => set((state) => {
        const cleanName = name.startsWith('sets.') ? name : `sets.${name}`;
        const newBases = { ...state.baseSets };
        if (baseSet) {
          newBases[cleanName] = baseSet;
        }
        return {
          allSets: { ...state.allSets, [cleanName]: {} },
          baseSets: newBases,
          activeTab: cleanName
        };
      }),

      clearSet: (setName) => set((state) => ({
        allSets: { ...state.allSets, [setName]: {} }
      })),

      importSets: (incomingSets, bases = {}) => set((state) => {
        const keys = Object.keys(incomingSets);
        return {
          ...state,
          allSets: incomingSets,
          baseSets: bases,
          activeTab: keys.find(k => k === 'sets.idle') || keys[0] || "sets.idle"
        };
      }),

      updateAugments: (setName, slot, augs) => set((state) => {
        const current = state.allSets[setName][slot];
        const itemObj: EquippedItem = typeof current === 'string'
          ? { name: current }
          : { ...current };

        return {
          allSets: {
            ...state.allSets,
            [setName]: {
              ...state.allSets[setName],
              [slot]: { ...itemObj, ...augs }
            }
          }
        };
      }),

      removeSet: (setKey) => set((state) => {
        const newSets = { ...state.allSets };
        const newBases = { ...state.baseSets };
        delete newSets[setKey];
        delete newBases[setKey];

        if (Object.keys(newSets).length === 0) {
          return {
            allSets: { "sets.idle": {}, "sets.engaged": {} },
            baseSets: {},
            activeTab: "sets.idle"
          };
        }
        let nextActiveTab = state.activeTab;
        if (state.activeTab === setKey) {
          nextActiveTab = Object.keys(newSets)[0];
        }
        return { allSets: newSets, baseSets: newBases, activeTab: nextActiveTab };
      }),

      updateSlot: (setName, slot, item) => set((state) => ({
        allSets: {
          ...state.allSets,
          [setName]: {
            ...state.allSets[setName],
            [slot]: item,
          }
        }
      })),
    }),
    {
      name: 'gearswap-studio-storage',
      partialize: (state) => {
        // We don't persist searchableItems or searchTerm to keep localstorage light
        const { searchableItems, searchTerm, ...rest } = state;
        return rest as GearStore;
      },
    }
  )
);