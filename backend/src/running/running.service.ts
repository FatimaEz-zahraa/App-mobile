import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RunningService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, data: any) {
    return this.prisma.runningSession.create({
      data: {
        userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        ...data,
      },
    });
  }

  async addGpsPoint(sessionId: string, userId: string, data: any) {
    const session = await this.prisma.runningSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new NotFoundException('Session not found');

    const lastPoint = await this.prisma.runningGpsPoint.findFirst({
      where: { sessionId },
      orderBy: { sequenceNum: 'desc' },
    });

    return this.prisma.runningGpsPoint.create({
      data: {
        sessionId,
        sequenceNum: (lastPoint?.sequenceNum || 0) + 1,
        latitude: new Prisma.Decimal(data.latitude),
        longitude: new Prisma.Decimal(data.longitude),
        speedKmh: data.speedKmh ? new Prisma.Decimal(data.speedKmh) : null,
        recordedAt: new Date(),
      },
    });
  }

  async endSession(sessionId: string, userId: string, data: any) {
    const session = await this.prisma.runningSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new NotFoundException('Session not found');

    let caloriesBurned = data.caloriesBurned ? new Prisma.Decimal(data.caloriesBurned) : undefined;
    
    // Auto-calculate calories if distance is available and calories weren't provided
    if (!caloriesBurned && data.distanceMeters) {
      const profile = await this.prisma.userPhysicalProfile.findUnique({ where: { userId } });
      const weight = profile?.weightKg ? Number(profile.weightKg) : 70;
      const distanceKm = Number(data.distanceMeters) / 1000;
      caloriesBurned = new Prisma.Decimal(1.036 * weight * distanceKm);
    }

    return this.prisma.runningSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        distanceMeters: data.distanceMeters ? new Prisma.Decimal(data.distanceMeters) : undefined,
        durationSeconds: data.durationSeconds,
        caloriesBurned,
        ...data,
      },
    });
  }

  async getRecords(userId: string) {
    return this.prisma.runningPersonalRecord.findMany({
      where: { userId },
    });
  }
}
