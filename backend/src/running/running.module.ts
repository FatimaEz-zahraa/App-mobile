import { Module } from '@nestjs/common';
import { RunningService } from './running.service';
import { RunningController } from './running.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RunningController],
  providers: [RunningService],
  exports: [RunningService],
})
export class RunningModule {}
