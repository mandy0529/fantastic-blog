import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SMTP } from './smtp.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SmtpService {
  constructor(
    @InjectRepository(SMTP)
    private readonly smtp: Repository<SMTP>,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * send email
   * @param SMTP
   */
  async sendEmail(data: Partial<SMTP>) {
    // modules/mailer
    await this.mailerService.sendMail(data).catch(() => {
      throw new HttpException('failed to send email', HttpStatus.BAD_REQUEST);
    });

    // create new smtp to db
    const newSMTP = await this.smtp.create(data);

    await this.smtp.save(newSMTP);

    return { msg: 'successfully sent email' };
  }
}
