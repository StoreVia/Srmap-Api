import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ChessModule } from './games/chess/chess.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { ChatModule } from './chat/chat.module';
import { DbModule } from './db/db.module';
import { TypingTestModule } from './games/typingtest/typingtest.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    RedisModule,
    AuthModule,
    DbModule,
    ChessModule,
    MatchmakingModule,
    TypingTestModule,
    ChatModule,
    GatewayModule,
  ],
})
export class AppModule {}