import { Module } from '@nestjs/common';
import { TypingTestService } from './typingtest.service';

@Module({
  providers: [TypingTestService],
  exports: [TypingTestService],
})
export class TypingTestModule {}
