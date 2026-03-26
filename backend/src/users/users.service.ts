// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CreatePhysicalProfileDto,
  UpdatePhysicalProfileDto,
} from './dto/physical-profile.dto';
import { CreateMeasurementDto } from './dto/measurement.dto';
import { Prisma } from '@prisma/client';

// Sélection sécurisée (sans passwordHash)
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  // ─── PROFIL UTILISATEUR ────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...SAFE_USER_SELECT,
        physicalProfile: true,
        _count: {
          select: {
            runningSessions: true,
            workoutLogs: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  }

  async deleteAccount(userId: string) {
    // Cascade supprime tout grâce aux FK ON DELETE CASCADE dans Prisma
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Compte supprimé définitivement' };
  }

  // ─── PROFIL PHYSIQUE ───────────────────────────────────────────────────────

  async getPhysicalProfile(userId: string) {
    const profile = await this.prisma.userPhysicalProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'Profil physique non configuré. Veuillez le créer via POST /users/me/physical-profile',
      );
    }

    return profile;
  }

  async upsertPhysicalProfile(
    userId: string,
    dto: CreatePhysicalProfileDto | UpdatePhysicalProfileDto,
  ) {
    // Calculer l'âge pour validation
    const birthDate = new Date(dto.birthDate);
    const age = this.calculateAge(birthDate);

    if (age < 10 || age > 100) {
      throw new BadRequestException('Date de naissance invalide');
    }

    // Calculer BMI automatiquement si poids et taille fournis
    const bmi = this.calculateBMI(dto.weightKg, dto.heightCm);

    // Calculer FC max estimée si non fournie (Formule : 220 - âge)
    const estimatedMaxHr = dto.maxHr ?? (220 - age);

    const profile = await this.prisma.userPhysicalProfile.upsert({
      where: { userId },
      create: {
        userId,
        birthDate: birthDate,
        gender: dto.gender,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        wristCm: dto.wristCm,
        neckCm: dto.neckCm,
        waistCm: dto.waistCm,
        hipCm: dto.hipCm,
        restingHr: dto.restingHr,
        maxHr: estimatedMaxHr,
        fitnessLevel: dto.fitnessLevel,
        healthNotes: dto.healthNotes,
      },
      update: {
        birthDate: birthDate,
        gender: dto.gender,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        wristCm: dto.wristCm,
        neckCm: dto.neckCm,
        waistCm: dto.waistCm,
        hipCm: dto.hipCm,
        restingHr: dto.restingHr,
        maxHr: estimatedMaxHr,
        fitnessLevel: dto.fitnessLevel,
        healthNotes: dto.healthNotes,
      },
    });

    // Créer une mesure initiale automatiquement
    await this.prisma.userMeasurement.create({
      data: {
        userId,
        weightKg: dto.weightKg,
        bmi: bmi,
        measuredAt: new Date(),
      },
    });

    this.logger.log(`Profil physique mis à jour: userId=${userId}`);
    return { ...profile, bmi };
  }

  // ─── MESURES CORPORELLES ───────────────────────────────────────────────────

  async getMeasurements(
    userId: string,
    query: { limit?: number; offset?: number },
  ) {
    const { limit = 30, offset = 0 } = query;

    const [measurements, total] = await Promise.all([
      this.prisma.userMeasurement.findMany({
        where: { userId },
        orderBy: { measuredAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.userMeasurement.count({ where: { userId } }),
    ]);

    return {
      data: measurements,
      meta: { total, limit, offset },
    };
  }

  async addMeasurement(userId: string, dto: CreateMeasurementDto) {
    // Calculer BMI si poids fourni et profil physique existe
    let bmi = dto.bmi;
    if (dto.weightKg && !bmi) {
      const profile = await this.prisma.userPhysicalProfile.findUnique({
        where: { userId },
        select: { heightCm: true },
      });
      if (profile) {
        bmi = this.calculateBMI(dto.weightKg, Number(profile.heightCm));
      }
    }

    const measurement = await this.prisma.userMeasurement.create({
      data: {
        userId,
        weightKg: dto.weightKg,
        bodyFatPct: dto.bodyFatPct,
        muscleMassKg: dto.muscleMassKg,
        bmi: bmi,
        measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date(),
        notes: dto.notes,
      },
    });

    // Mettre à jour le poids actuel dans le profil physique
    if (dto.weightKg) {
      await this.prisma.userPhysicalProfile.updateMany({
        where: { userId },
        data: { weightKg: dto.weightKg },
      });
    }

    return measurement;
  }

  // ─── STATISTIQUES UTILISATEUR ──────────────────────────────────────────────

  async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRuns,
      weekRuns,
      monthRuns,
      totalWorkouts,
      weekWorkouts,
      lastRun,
      totalDistanceResult,
      weekDistanceResult,
      achievementsCount,
    ] = await Promise.all([
      // Totaux courses
      this.prisma.runningSession.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.runningSession.count({
        where: { userId, status: 'COMPLETED', startedAt: { gte: startOfWeek } },
      }),
      this.prisma.runningSession.count({
        where: { userId, status: 'COMPLETED', startedAt: { gte: startOfMonth } },
      }),

      // Totaux séances fitness
      this.prisma.workoutLog.count({ where: { userId } }),
      this.prisma.workoutLog.count({
        where: { userId, startedAt: { gte: startOfWeek } },
      }),

      // Dernière course
      this.prisma.runningSession.findFirst({
        where: { userId, status: 'COMPLETED' },
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          startedAt: true,
          distanceMeters: true,
          durationSeconds: true,
          caloriesBurned: true,
        },
      }),

      // Distance totale
      this.prisma.runningSession.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { distanceMeters: true, caloriesBurned: true, durationSeconds: true },
      }),

      // Distance cette semaine
      this.prisma.runningSession.aggregate({
        where: { userId, status: 'COMPLETED', startedAt: { gte: startOfWeek } },
        _sum: { distanceMeters: true },
      }),

      // Achievements
      this.prisma.userAchievement.count({ where: { userId } }),
    ]);

    return {
      running: {
        totalSessions: totalRuns,
        weekSessions: weekRuns,
        monthSessions: monthRuns,
        totalDistanceKm: Number(totalDistanceResult._sum.distanceMeters ?? 0) / 1000,
        weekDistanceKm: Number(weekDistanceResult._sum.distanceMeters ?? 0) / 1000,
        totalCalories: Number(totalDistanceResult._sum.caloriesBurned ?? 0),
        totalDurationHours: Math.round((totalDistanceResult._sum.durationSeconds ?? 0) / 3600 * 10) / 10,
        lastRun,
      },
      fitness: {
        totalSessions: totalWorkouts,
        weekSessions: weekWorkouts,
      },
      achievements: achievementsCount,
    };
  }

  // ─── UTILITAIRES PRIVÉS ────────────────────────────────────────────────────

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }
}
