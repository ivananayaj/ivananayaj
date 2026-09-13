import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_INTENT, type IntentState, type PathId, type ResolutionId, type UseId } from "./rig-data";

const STORAGE_KEY = "rig-file-v1";

type RigStore = IntentState & {
  setField: <K extends keyof IntentState>(key: K, value: IntentState[K]) => void;
  toggleUse: (id: UseId) => void;
  setBudget: (n: number) => void;
  setPath: (p: PathId) => void;
  setResolution: (r: ResolutionId) => void;
  reset: () => void;
};

function persist(partial: IntentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
  } catch {
    /* ignore quota */
  }
}

function snapshot(s: RigStore): IntentState {
  return {
    uses: s.uses,
    resolution: s.resolution,
    budget: s.budget,
    preferredPath: s.preferredPath,
    motherboard: s.motherboard,
    biosVersion: s.biosVersion,
    psu: s.psu,
    ramConfig: s.ramConfig,
    caseName: s.caseName,
    monitor: s.monitor,
    notes: s.notes,
    specDump: s.specDump,
  };
}

export const useRig = create<RigStore>((set, get) => ({
  ...DEFAULT_INTENT,
  setField: (key, value) => {
    set({ [key]: value } as Partial<IntentState>);
    persist(snapshot(get()));
  },
  toggleUse: (id) => {
    const uses = get().uses.includes(id)
      ? get().uses.filter((u) => u !== id)
      : [...get().uses, id];
    set({ uses });
    persist(snapshot(get()));
  },
  setBudget: (budget) => {
    set({ budget });
    persist(snapshot(get()));
  },
  setPath: (preferredPath) => {
    set({ preferredPath });
    persist(snapshot(get()));
  },
  setResolution: (resolution) => {
    set({ resolution });
    persist(snapshot(get()));
  },
  reset: () => {
    set({ ...DEFAULT_INTENT });
    persist({ ...DEFAULT_INTENT });
  },
}));

export function hydrateRig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<IntentState>;
    useRig.setState({
      ...DEFAULT_INTENT,
      ...parsed,
      uses: Array.isArray(parsed.uses) ? parsed.uses : DEFAULT_INTENT.uses,
    });
  } catch {
    /* corrupt store */
  }
}

export function useIntent(): IntentState {
  return useRig(
    useShallow((s) => ({
      uses: s.uses,
      resolution: s.resolution,
      budget: s.budget,
      preferredPath: s.preferredPath,
      motherboard: s.motherboard,
      biosVersion: s.biosVersion,
      psu: s.psu,
      ramConfig: s.ramConfig,
      caseName: s.caseName,
      monitor: s.monitor,
      notes: s.notes,
      specDump: s.specDump,
    })),
  );
}
