import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post(':sessionId/log')
  createLog(@Req() req, @Param('sessionId') sessionId: string, @Body() data: any) {
    return this.workoutService.createLog(req.user.userId, sessionId, data);
  }

  @Post('log/:logId/set')
  addSetLog(@Req() req, @Param('logId') logId: string, @Body() data: any) {
    return this.workoutService.addSetLog(logId, req.user.userId, data);
  }

  @Post('program')
  createProgram(@Req() req, @Body() data: any) {
    return this.workoutService.createProgram(req.user.userId, data);
  }

  @Post('smart-generate')
  generateSmartWorkout(@Req() req, @Body() data: { energyLevel: string, durationMin: number }) {
    return this.workoutService.generateSmartWorkout(req.user.userId, data.energyLevel, data.durationMin);
  }

  @Post(':sessionId/reschedule')
  rescheduleMissedWorkout(@Req() req, @Param('sessionId') sessionId: string) {
    return this.workoutService.rescheduleMissedWorkout(req.user.userId, sessionId);
  }
}
