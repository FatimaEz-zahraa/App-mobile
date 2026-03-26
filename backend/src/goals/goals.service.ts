import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async createGoal(userId: string, data: any) {
    return this.prisma.userGoal.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateProgress(userId: string, goalId: string, value: number) {
    const goal = await this.prisma.userGoal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) throw new NotFoundException('Goal not found');

    const newValue = Number(goal.currentValue) + value;
    const isCompleted = goal.targetValue ? newValue >= Number(goal.targetValue) : false;

    return this.prisma.userGoal.update({
      where: { id: goalId },
      data: {
        currentValue: new Prisma.Decimal(newValue),
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      },
    });
  }

  async checkDailyAlerts(userId: string) {
    const goals = await this.prisma.userGoal.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const alerts: string[] = [];
    for (const goal of goals) {
      if (goal.targetValue) {
        const progressPct = (Number(goal.currentValue) / Number(goal.targetValue)) * 100;
        if (progressPct >= 90 && progressPct < 100) {
          alerts.push(`Presque fini ! Votre objectif "${goal.title}" est à ${Math.round(progressPct)}%`);
        }
      }
    }
    return alerts;
  }
}
