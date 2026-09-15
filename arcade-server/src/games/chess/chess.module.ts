import { Module } from '@nestjs/common';
import { ChessService } from './chess.service';
import { ChessTimerService } from './chess-timer.service';

@Module({
  providers: [ChessService, ChessTimerService],
  exports: [ChessService, ChessTimerService],
})
export class ChessModule {}
