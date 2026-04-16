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

  async generateWeeklyReport(userId: string) {
    const workoutsThisWeek = await this.prisma.workoutLog.count({
      where: {
        userId,
        startedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      }
    });

    // Mocking some advanced streak stats for the demonstration of the AI behavior
    const streakDays = workoutsThisWeek > 0 ? workoutsThisWeek * 2 + 1 : 0;
    const consistencyScore = Math.min(workoutsThisWeek * 20 + 20, 100);

    let summary = `You showed incredible consistency this week training ${workoutsThisWeek} times!`;
    if (workoutsThisWeek === 0) {
      summary = "You haven't logged any workouts this week. Let's start with a quick 15-min mobility session to build momentum.";
    } else if (workoutsThisWeek < 3) {
      summary = `Good effort completing ${workoutsThisWeek} workouts, but let's try to hit 3 next week for optimal energy.`;
    }

    return {
      consistencyScore,
      streakDays,
      summary,
      completedWorkouts: workoutsThisWeek,
      missedWorkouts: workoutsThisWeek < 3 ? 3 - workoutsThisWeek : 0
    };
  }
}
