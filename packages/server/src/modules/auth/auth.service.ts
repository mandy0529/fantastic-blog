import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * register
   * @param user
   */
  async register(user: Partial<User>) {
    const { email, name, password } = user;

    // no parameter required
    if (!name || !password || !email) {
      throw new HttpException(
        'name, email, password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if user already exists
    const existUser = await this.userRepository.findOne({ where: { name } });

    if (existUser) {
      throw new HttpException('user already exists', HttpStatus.CONFLICT);
    }

    // create new user
    const newUser = await this.userRepository.create(user);
    await this.userRepository.save(newUser);
    return { user: newUser };
  }

  /**
   * login
   * @param user
   */
  async login(user: Partial<User>) {
    const { name, password } = user;

    // no parameter required
    if (!name || !password) {
      throw new HttpException(
        'name and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existUser = await this.userRepository.findOne({ where: { name } });

    // throw error if user does not exist or password is incorrect
    if (
      !existUser ||
      !(await User.comparePassword(password, existUser.password))
    ) {
      throw new HttpException('Invalid credentials', HttpStatus.NOT_FOUND);
    }

    // user status is locked
    if (existUser.status === 'locked') {
      throw new HttpException('Your account is locked', HttpStatus.BAD_REQUEST);
    }

    // create JWT payload
    const payload = {
      id: existUser.id,
      name: existUser.name,
      email: existUser.email,
      role: existUser.role,
    };
    const token = await this.createJWT(payload);
    return Object.assign(existUser, { token });
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  // create JWt
  async createJWT(payload: Pick<User, 'email' | 'id' | 'name' | 'role'>) {
    try {
      // generate jwt
      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException(
        'Something went wrong while generating the access token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // generate access token
  async generateAccessToken(
    payload: Pick<User, 'email' | 'id' | 'name' | 'role'>,
  ) {
    return await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  // generate refresh token
  async generateRefreshToken(payload: Pick<User, 'id'>) {
    return await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}
