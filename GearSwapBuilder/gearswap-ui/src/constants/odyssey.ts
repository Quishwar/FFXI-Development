// constants/odyssey.ts

export const ODYSSEY_REWARDS = {
  ATONEMENT_1: ["hesperiidae", "epitaph", "neo animator", "coiste bodhar"],
  ATONEMENT_2: ["acrontica", "beithir ring", "tsuru", "schere earring", "tellen belt", "obstinate sash"],
  ATONEMENT_3: ["ikenga", "kunimitsu", "gleti", "gekkei", "sakpata", "agwu", "bunzi", "mpaca"],
  ATONEMENT_4: ["nyame"]
} as const;

// Flattened for easy lookup
export const PATH_ENABLED_ITEMS = Object.values(ODYSSEY_REWARDS).flat();