import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
}
