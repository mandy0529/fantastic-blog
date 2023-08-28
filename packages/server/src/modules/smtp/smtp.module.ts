import { Module, forwardRef } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { SmtpController } from './smtp.controller';
import { SMTP } from './smtp.entity';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

const mailModule = MailerModule.forRootAsync({
  useFactory: async () => ({
    transport: {
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    defaults: {
      from: `"No Reply" <${process.env.MAIL_USER}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
  inject: [ConfigService],
});
@Module({
  imports: [
    TypeOrmModule.forFeature([SMTP]),
    forwardRef(() => AuthModule),
    mailModule,
  ],
  controllers: [SmtpController],
  providers: [SmtpService],
  exports: [SmtpService],
})
export class SmtpModule {}
