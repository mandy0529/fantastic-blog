import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategy';

const jwtModule = JwtModule.registerAsync({
  useFactory: async () => ({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1d' },
  }),
  inject: [ConfigService],
});
@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule, jwtModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
