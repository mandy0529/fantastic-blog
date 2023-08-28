import { User } from './../user/user.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';

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

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto) {
    return this.authService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
