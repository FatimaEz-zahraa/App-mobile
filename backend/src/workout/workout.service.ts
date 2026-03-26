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
          create: data.exercises.map((ex: any, index: number) => ({
            exerciseId: ex.exerciseId,
            orderIndex: index,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg ? new Prisma.Decimal(ex.weightKg) : null,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });
  }
}
