import { Controller, Get, Post, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  getGoalAlerts(@Req() req) {
    return this.goalsService.checkDailyAlerts(req.user.userId);
  }

  @Post()
  createGoal(@Req() req, @Body() data) {
    return this.goalsService.createGoal(req.user.userId, data);
  }

  @Patch(':id/progress')
  updateProgress(@Req() req, @Param('id') id: string, @Body('value') value: number) {
    return this.goalsService.updateProgress(req.user.userId, id, value);
  }

  @Get('weekly-report')
  getWeeklyReport(@Req() req) {
    return this.goalsService.generateWeeklyReport(req.user.userId);
  }
}
