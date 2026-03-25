export class CreateMeasurementDto {
  weightKg?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  bmi?: number;
  measuredAt?: Date | string;
  notes?: string;
}
