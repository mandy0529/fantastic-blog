import { Module, forwardRef } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { SmtpController } from './smtp.controller';
import { SMTP } from './smtp.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SMTP]), forwardRef(() => AuthModule)],
  controllers: [SmtpController],
  providers: [SmtpService],
  exports: [SmtpService],
})
export class SmtpModule {}
