import { Gender, FitnessLevel } from '../../generated/prisma';

export class CreatePhysicalProfileDto {
  birthDate!: Date | string;
  gender?: Gender;
  heightCm!: number;
  weightKg!: number;
  wristCm?: number;
  neckCm?: number;
  waistCm?: number;
  hipCm?: number;
  restingHr?: number;
  maxHr?: number;
  fitnessLevel?: FitnessLevel;
  healthNotes?: string;
}

export class UpdatePhysicalProfileDto extends CreatePhysicalProfileDto {}
