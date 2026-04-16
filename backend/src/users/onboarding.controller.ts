import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  completeOnboarding(@Req() req, @Body() dto: OnboardingDto) {
    return this.onboardingService.saveOnboarding(req.user.userId, dto);
  }

  @Get('energy-suggestion')
  getEnergySuggestion(@Req() req, @Query('level') level: string) {
    return this.onboardingService.getEnergyBasedSuggestion(req.user.userId, level ?? 'medium');
  }
}
