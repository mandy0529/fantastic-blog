import { User } from './../user/user.entity';
import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import { GithubCodeDto } from './dto/Github.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /**
   * register
   * @param user
   */
  @ApiResponse({ status: 201, description: 'register user', type: [User] })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() user: Partial<User>) {
    return this.authService.register(user);
  }

  /**
   * login
   * @param user
   */
  @ApiResponse({ status: 200, description: 'login user', type: [User] })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() user: Partial<User>) {
    return this.authService.login(user);
  }

  /**
   * github login
   * @param user
   */

  @Post('github-login')
  @HttpCode(HttpStatus.OK)
  async loginWithGithub(@Body() githubCodeDto: GithubCodeDto) {
    return await this.authService.loginWithGithub(githubCodeDto);
  }
}
