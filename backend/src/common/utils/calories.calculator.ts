// src/common/utils/calories.calculator.ts

/**
 * Calculateur de calories brûlées pour la course
 * Utilise la formule MET (Metabolic Equivalent of Task)
 * combinée avec le profil physique de l'utilisateur.
 */

export interface UserPhysicalData {
  weightKg: number;
  heightCm: number;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  restingHr?: number;
  maxHr?: number;
}

export interface RunningCaloriesInput {
  durationSeconds: number;
  distanceMeters: number;
  avgSpeedKmh: number;
  avgHeartRate?: number;
  user: UserPhysicalData;
}

export class CaloriesCalculator {

  /**
   * Calcule les calories brûlées pendant la course
   * Méthode principale : Formule de Keytel (basée FC) si FC dispo,
   * sinon Formule MET (basée vitesse)
   */
  static calculateRunningCalories(input: RunningCaloriesInput): number {
    const { durationSeconds, avgSpeedKmh, avgHeartRate, user } = input;
    const durationMin = durationSeconds / 60;
    const age = CaloriesCalculator.calculateAge(user.birthDate);

    if (avgHeartRate && user.restingHr) {
      // ── Méthode Keytel (plus précise avec FC) ──────────────────────────
      return CaloriesCalculator.keytelFormula(
        avgHeartRate,
        durationMin,
        age,
        user.weightKg,
        user.gender,
      );
    }

    // ── Méthode MET (basée sur la vitesse) ────────────────────────────────
    const met = CaloriesCalculator.getRunningMET(avgSpeedKmh);
    return CaloriesCalculator.metFormula(met, user.weightKg, durationMin);
  }

  /**
   * Formule Keytel basée sur la fréquence cardiaque
   * Référence : Keytel LR et al. (2005)
   */
  private static keytelFormula(
    avgHr: number,
    durationMin: number,
    age: number,
    weightKg: number,
    gender: string,
  ): number {
    let calories: number;

    if (gender === 'MALE') {
      calories =
        ((-55.0969 + 0.6309 * avgHr + 0.1988 * weightKg + 0.2017 * age) / 4.184) *
        durationMin;
    } else {
      calories =
        ((-20.4022 + 0.4472 * avgHr - 0.1263 * weightKg + 0.074 * age) / 4.184) *
        durationMin;
    }

    return Math.max(0, Math.round(calories));
  }

  /**
   * Formule MET : Calories = MET × poids(kg) × durée(h)
   */
  private static metFormula(met: number, weightKg: number, durationMin: number): number {
    const durationHours = durationMin / 60;
    return Math.round(met * weightKg * durationHours);
  }

  /**
   * Table MET selon la vitesse de course
   * Source : Compendium of Physical Activities (Ainsworth et al.)
   */
  static getRunningMET(speedKmh: number): number {
    if (speedKmh < 6.4)   return 6.0;   // Marche rapide
    if (speedKmh < 8.0)   return 8.3;   // Jogging lent
    if (speedKmh < 9.7)   return 9.0;   // Course légère
    if (speedKmh < 11.3)  return 9.8;   // Course modérée
    if (speedKmh < 12.9)  return 10.5;  // Course soutenue
    if (speedKmh < 14.5)  return 11.0;  // Course rapide
    if (speedKmh < 16.1)  return 11.8;  // Course très rapide
    if (speedKmh < 17.7)  return 12.8;  // Sprint modéré
    if (speedKmh < 19.3)  return 14.5;  // Sprint
    return 16.0;                         // Sprint max
  }

  /**
   * Calcule le BMR (Basal Metabolic Rate) — Mifflin-St Jeor
   * Utile pour estimer les besoins caloriques quotidiens
   */
  static calculateBMR(user: UserPhysicalData): number {
    const age = CaloriesCalculator.calculateAge(user.birthDate);

    if (user.gender === 'MALE') {
      return 10 * user.weightKg + 6.25 * user.heightCm - 5 * age + 5;
    } else {
      return 10 * user.weightKg + 6.25 * user.heightCm - 5 * age - 161;
    }
  }

  /**
   * Estime la FC max si non renseignée (Formule Tanaka)
   * Plus précise que la formule classique 220-âge pour les adultes actifs
   */
  static estimateMaxHR(age: number): number {
    return Math.round(208 - 0.7 * age);
  }

  /**
   * Calcule l'allure (pace) en secondes par km
   */
  static calculatePace(distanceMeters: number, durationSeconds: number): number {
    if (distanceMeters === 0) return 0;
    const distanceKm = distanceMeters / 1000;
    return Math.round(durationSeconds / distanceKm);
  }

  /**
   * Formate l'allure en string "mm:ss /km"
   */
  static formatPace(paceSecPerKm: number): string {
    const minutes = Math.floor(paceSecPerKm / 60);
    const seconds = paceSecPerKm % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  }

  /**
   * Estime la VO2max (capacité aérobie) — Équation de Cooper
   */
  static estimateVO2Max(distanceMeters12min: number): number {
    return Math.round((distanceMeters12min - 504.9) / 44.73);
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }
}
