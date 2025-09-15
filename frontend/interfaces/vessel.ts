export interface Vessel {
  id: number;
  name: string;
  size: "small" | "medium" | "large";
  mass: number;
  volume: number;
  cannonSize: "small" | "medium" | "large";
  maxPirates: number;
  maxSwabbies: number;
  movesPerTurn: number;
  shotsPerMove: number;
  secondsPerLPAtMaxSpeed: number;
  maxPillageDamage: DamageProfile;
  maxSinkDamage: DamageProfile;
  rockDamage: DamageProfile;
  ramDamage: DamageProfile;
  createdAt?: string;
  updatedAt?: string;
}

interface DamageProfile {
  small: number;
  medium: number;
  large: number;
}
