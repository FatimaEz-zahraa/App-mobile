import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('calories')
  getCaloriesInfo(@Req() req) {
    return this.nutritionService.calculateCalories(req.user.userId);
  }

  @Get('meals/recommendations')
  getMealRecommendations(@Req() req) {
    return this.nutritionService.recommendMeals(req.user.userId);
  }

  @Post('water')
  logWater(@Req() req, @Body('waterMl') waterMl: number) {
    return this.nutritionService.logWater(req.user.userId, waterMl);
  }

  @Get('alerts')
  getGoalAlerts(@Req() req) {
    return this.nutritionService.checkGoalAlerts(req.user.userId);
  }
}
