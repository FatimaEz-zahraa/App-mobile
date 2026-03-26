import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RunningModule } from './running/running.module';
import { WorkoutModule } from './workout/workout.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RunningModule,
    WorkoutModule,
    NutritionModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
