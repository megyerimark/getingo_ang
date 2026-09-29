export type CompanionActionKey = 'water' | 'feed' | 'play';

export interface Companion {
  id: number;
  name: string;
  care_points: number;
  water: number;
  hunger: number;
  happiness: number;
  selected_skin: string;
  last_interaction_at: string | null;
}

export interface CompanionGrowth {
  key: 'seed' | 'sprout' | 'plant' | 'tree' | 'legendary';
  level: number;
  name: string;
  progress_percentage: number;
  next_stage_xp: number | null;
  xp_to_next_stage: number;
}

export interface CompanionAction {
  key: CompanionActionKey;
  label: string;
  cost: number;
  boost: number;
}

export interface CompanionState {
  companion: Companion;
  growth: CompanionGrowth;
  xp_points: number;
  actions: CompanionAction[];
}

export interface CompanionActionResponse {
  message: string;
  state: CompanionState;
}
