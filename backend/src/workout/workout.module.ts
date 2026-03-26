import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkoutController],
  providers: [WorkoutService],
  exports: [WorkoutService],
})
export class WorkoutModule {}
