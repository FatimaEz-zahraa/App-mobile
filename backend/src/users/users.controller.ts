import { Controller, Get, Post, Body, UseGuards, Req, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePhysicalProfileDto, UpdatePhysicalProfileDto } from './dto/physical-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Get('me/physical-profile')
  getPhysicalProfile(@Req() req) {
    return this.usersService.getPhysicalProfile(req.user.userId);
  }

  @Post('me/physical-profile')
  createPhysicalProfile(@Req() req, @Body() dto: CreatePhysicalProfileDto) {
    // Also save simple preferences via Profile if passed here
    return this.usersService.upsertPhysicalProfile(req.user.userId, dto);
  }
  
  @Put('me/physical-profile')
  updatePhysicalProfile(@Req() req, @Body() dto: UpdatePhysicalProfileDto) {
    return this.usersService.upsertPhysicalProfile(req.user.userId, dto);
  }
}
