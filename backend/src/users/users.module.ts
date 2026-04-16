import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';

@Module({
  controllers: [UsersController, OnboardingController],
  providers: [UsersService, OnboardingService],
  exports: [UsersService, OnboardingService],
})
export class UsersModule {}
