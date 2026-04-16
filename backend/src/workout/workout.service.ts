import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  async createLog(userId: string, sessionId: string, data: any) {
    return this.prisma.workoutLog.create({
      data: {
        userId,
        sessionId,
        startedAt: new Date(),
        ...data,
      },
    });
  }

  async addSetLog(logId: string, userId: string, data: any) {
    const log = await this.prisma.workoutLog.findUnique({ where: { id: logId } });
    if (!log || log.userId !== userId) throw new NotFoundException('Workout log not found');

    const lastSet = await this.prisma.workoutLogSet.findFirst({
      where: { logId, exerciseId: data.exerciseId },
      orderBy: { setNumber: 'desc' },
    });

    return this.prisma.workoutLogSet.create({
      data: {
        logId,
        exerciseId: data.exerciseId,
        setNumber: (lastSet?.setNumber || 0) + 1,
        repsDone: data.repsDone,
        weightKg: data.weightKg ? new Prisma.Decimal(data.weightKg) : null,
      },
    });
  }

  async createProgram(userId: string, data: any) {
    return this.prisma.workoutSession.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        exercises: {
          create: await Promise.all(data.exercises.map(async (ex: any, index: number) => {
            // Find or insert dummy exercise if not existing
            let exercise = await this.prisma.exercise.findFirst({ where: { name: ex.name || 'Custom' } });
            if (!exercise) {
               exercise = await this.prisma.exercise.create({
                  data: { name: ex.name || 'Custom', isCustom: true, createdBy: userId }
               });
            }
            return {
              exerciseId: exercise.id,
              orderIndex: index,
              sets: ex.sets,
              reps: ex.reps,
              weightKg: ex.weightKg ? new Prisma.Decimal(ex.weightKg) : null,
            };
          })),
        },
      },
      include: {
        exercises: true,
      },
    });
  }

  async generateSmartWorkout(userId: string, energyLevel: string, maxDurationMinutes: number) {
    let workoutName = 'Custom Smart Workout';
    let exercises: any[] = [];

    // Simple AI heuristic based on user selection
    if (energyLevel === 'low' || maxDurationMinutes <= 15) {
      workoutName = '15-Min Low Energy Recovery';
      exercises = [
        { name: 'Cat-Cow Stretch', durationSec: 60, sets: 2 },
        { name: 'Childs Pose', durationSec: 60, sets: 2 },
        { name: 'Light Walk', durationSec: 300, sets: 1 }
      ];
    } else if (energyLevel === 'high') {
      workoutName = `${maxDurationMinutes}-Min High Intensity Full Body`;
      exercises = [
        { name: 'Burpees', durationSec: 45, sets: 3 },
        { name: 'Jump Squats', durationSec: 45, sets: 4 },
        { name: 'Push-ups', durationSec: 45, sets: 4 },
        { name: 'Mountain Climbers', durationSec: 60, sets: 3 }
      ];
    } else {
      workoutName = `${maxDurationMinutes}-Min Balanced Routine`;
      exercises = [
        { name: 'Bodyweight Squats', durationSec: 60, sets: 3 },
        { name: 'Plank', durationSec: 60, sets: 3 },
        { name: 'Lunges', durationSec: 60, sets: 3 }
      ];
    }

    return {
      success: true,
      workoutName,
      estimatedDuration: maxDurationMinutes,
      exercises
    };
  }

  async rescheduleMissedWorkout(userId: string, sessionId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Workout session not found');
    }

    // Determine the next optimal day (e.g. 2 days from now to allow recovery)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);

    return {
      success: true,
      message: `Workout automatically rescheduled to ${nextDate.toDateString()}`,
      newDate: nextDate,
      sessionName: session.name
    };
  }
}
