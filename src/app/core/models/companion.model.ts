export type CompanionActionKey = 'water' | 'feed' | 'play';
export type CompanionStageKey = 'seed' | 'sprout' | 'budding' | 'bloom' | 'legendary';
export type CompanionMoodKey = 'wilted' | 'calm' | 'happy' | 'radiant';

export interface Companion {
  id: number;
  name: string;
  care_points: number;
  growth_points: number;
  water: number;
  hunger: number;
  happiness: number;
  selected_skin: string;
  last_interaction_at: string | null;
}

export interface CompanionGrowth {
  key: CompanionStageKey;
  level: number;
  name: string;
  progress_percentage: number;
  next_stage_points: number | null;
  points_to_next_stage: number;
  knowledge_growth_points: number;
  care_growth_points: number;
  total_growth_points: number;
}

export interface CompanionMood {
  key: CompanionMoodKey;
  name: string;
  score: number;
}

export interface CompanionAction {
  key: CompanionActionKey;
  label: string;
  cost: number;
  boost: number;
  growth: number;
}

export interface CompanionState {
  companion: Companion;
  growth: CompanionGrowth;
  mood: CompanionMood;
  xp_points: number;
  actions: CompanionAction[];
}

export interface CompanionActionResponse {
  message: string;
  state: CompanionState;
}
