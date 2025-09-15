export interface GreedyStrikes {
  [key: string]: number;
}

export interface PillageBattle {
  won: boolean;
  incomplete: boolean;
  players: number;
  enemies: number;
  poe: number;
  goods: number;
  greedyStrikes: GreedyStrikes;
}

export interface GreedyCounter {
  battles: PillageBattle[];
  wins: number;
  losses: number;
  sinks: number;
  greedyPursesOpened: number;
  greedyPursesEarnings: number;
  globalGreedyStrikes: GreedyStrikes;
}
