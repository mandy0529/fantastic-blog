import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SMTP } from './smtp.entity';
import { JwtAuthGuard } from '../auth/guard';

@ApiTags('Smtp')
@Controller('smtp')
// @UseGuards(RolesGuard)
@Controller('smtp')
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  /**
   * send email
   * @param data
   */
  @ApiResponse({ status: 200, description: 'send email', type: [SMTP] })
  @Post()
  @UseGuards(JwtAuthGuard)
  sendEmail(@Body() data) {
    return this.smtpService.sendEmail(data);
  }
}
