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

import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketsModule } from './websockets/websockets.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ global: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // Keep false as we are migrating from Prisma
    }),
    WebsocketsModule,
    NotificationsModule,
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
