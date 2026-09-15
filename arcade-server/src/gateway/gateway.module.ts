import { Module } from '@nestjs/common';
import { ArcadeGateway } from './arcade.gateway';
import { AuthModule } from '../auth/auth.module';
import { ChessModule } from '../games/chess/chess.module';
import { MatchmakingModule } from '../matchmaking/matchmaking.module';
import { ChatModule } from '../chat/chat.module';
import { DbModule } from '../db/db.module';
import { TypingTestModule } from '../games/typingtest/typingtest.module';

@Module({
  imports: [
    AuthModule,
    ChessModule,
    MatchmakingModule,
    ChatModule,
    DbModule,
    TypingTestModule,
  ],
  providers: [ArcadeGateway],
})
export class GatewayModule {}