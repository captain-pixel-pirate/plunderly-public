export interface Shoppe {
  id: string;
  imagePath: string;
  grade: string;
  mass: number;
  volume: number;
  maxLaborThroughput: number;
  basicLaborCap: number;
  skilledLaborCap: number;
  expertLaborCap: number;
  construction: {
    upgrade: boolean;
    iron: number;
    stone: number;
    tanCloth: number;
    wood: number;
    basicLabor: number;
    skilledLabor: number;
    expertLabor: number;
    doubloonCost: number;
  } | null;
}
