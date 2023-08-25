import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
