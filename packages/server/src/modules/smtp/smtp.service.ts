import { Injectable } from '@nestjs/common';
import { SMTP } from './smtp.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SmtpService {
  constructor(
    @InjectRepository(SMTP)
    private readonly smtpRepository: Repository<SMTP>,
  ) {}

  /**
   * send email
   * @param SMTP
   */
  async sendEmail(data: Partial<SMTP>) {
    return 'send email';
  }
}
