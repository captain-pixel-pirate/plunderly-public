import { CraftingDiscipline, SHOPPE_GRADE } from "./labor";

export interface Employer {
  id: string;
  island: string;
  name: string;
  notes: string;
  shoppeType: CraftingDiscipline;
  shoppeGrade: SHOPPE_GRADE;
  pay: {
    basic: number;
    skilled: number;
    expert: number;
  };
  workers: Worker[];
}
