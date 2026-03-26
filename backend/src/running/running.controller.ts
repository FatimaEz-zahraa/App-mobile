import { Controller, Post, Body, Param, UseGuards, Req, Put } from '@nestjs/common';
import { RunningService } from './running.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('running')
export class RunningController {
  constructor(private readonly runningService: RunningService) {}

  @Post('start')
  startSession(@Req() req, @Body() body: any) {
    return this.runningService.startSession(req.user.userId, body);
  }

  @Post(':id/gps')
  addGpsPoint(@Req() req, @Param('id') sessionId: string, @Body() body: any) {
    return this.runningService.addGpsPoint(sessionId, req.user.userId, body);
  }

  @Put(':id/end')
  endSession(@Req() req, @Param('id') sessionId: string, @Body() body: any) {
    return this.runningService.endSession(sessionId, req.user.userId, body);
  }

  @Post('records')
  getRecords(@Req() req) {
    return this.runningService.getRecords(req.user.userId);
  }
}
