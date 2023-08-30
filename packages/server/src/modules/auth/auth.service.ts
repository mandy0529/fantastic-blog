import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { GithubCodeDto } from './dto/Github.dto';
import axios, { AxiosResponse } from 'axios';
import { generateUUID } from 'src/utils';
import { SmtpService } from '../smtp/smtp.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwt: JwtService,
    private readonly smtp: SmtpService,
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

  /**
   * github login
   * @param user
   */
  async loginWithGithub(githubCodeDto: GithubCodeDto) {
    const { code } = githubCodeDto;

    // no github authorization code throw error
    if (!code) {
      throw new HttpException(
        'ease enter the Gitub authorization code',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 깃허브 access token을 얻기위한 요청 API 주소
    const getTokenUrl: string = 'https://github.com/login/oauth/access_token';
    const getUserUrl: string = 'https://api.github.com/user';

    // request github access token
    const request = {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    };

    try {
      // get github access token
      const response: AxiosResponse = await axios.post(getTokenUrl, request, {
        headers: {
          accept: 'application/json',
        },
      });

      // throw error if failed to get access token
      if (response.data.error) {
        throw new HttpException(
          'failed to get github access token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { access_token } = response.data;

      // get github user
      const responseUser = await axios.get(getUserUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // data 존재할 때  user 정의
      if (responseUser?.data) {
        const user = {
          avatar: responseUser?.data?.avatar_url,
          name: responseUser?.data?.login,
          type: 'github',
          email: responseUser?.data?.email,
        };

        // 내 user db에서 user 존재하는지 찾기
        const existUser = await this.userRepository.findOne({
          where: { email: user.email },
        });

        // 존재하지않으면  smtp 보내서 인증
        if (!existUser) {
          // temporary password setting
          const password = `fantastic_blog_${generateUUID()}_${user?.name}`;

          // create new user with temporary password
          await this.register({ ...user, password });

          // email message setting
          const emailMessage = {
            from: 'fantastic-blog HOST',
            to: responseUser?.data?.email,
            subject: 'GitHub User Login Notification',
            text: 'GitHub User Login Notification',
            html: `Hello, you have logged in to wipi using GitHub. <br/>
            Fanstic-blog has created a user for you with the username: ${user?.name}, <br/> 
            and the user password:<h1>${password}</h1>. <br/>
            Please log in to the system promptly to change the password.`,
          };

          // send email to my smtp DB
          this.smtp.sendEmail(emailMessage).catch((e) => {
            throw new HttpException(
              `Notifying user ${responseUser?.data?.name} (${responseUser?.data?.email}), but failed to send email notification.
              error : ${e}`,
              HttpStatus.BAD_REQUEST,
            );
          });
        }
        // github login을 해서 이미 유저가 있다면, 바로 login 시키기
        const loginUser = await this.loginWithoutPasswordGithub(user);
        console.log(loginUser, '@@login user');

        return { user: loginUser };
      } else {
        throw new HttpException(
          'failed to get github user',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(error.message || error, HttpStatus.BAD_REQUEST);
    }
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

  // loginWithoutPasswordGithub
  async loginWithoutPasswordGithub(user: Partial<User>) {
    const { name } = user;
    const existUser = await this.userRepository.findOne({ where: { name } });

    // user status is locked
    if (existUser?.status === 'locked') {
      throw new HttpException('Your account is locked', HttpStatus.BAD_REQUEST);
    }

    // create JWT payload
    const payload = {
      id: existUser?.id,
      name: existUser?.name,
      email: existUser?.email,
      role: existUser?.role,
    };
    const token = await this.createJWT(payload);

    delete existUser.password;

    return Object.assign(existUser && existUser, { token });
  }
}
