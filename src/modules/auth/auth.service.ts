import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { IPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  private async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(admin: IPayload): Promise<string> {
    return this.jwtService.sign(admin);
  }

  async validateUser(username: string, password: string): Promise<IPayload> {
    const user = await this.userService.findByUsername(username);

    if (user && (await this.comparePasswords(password, user.password))) {
      const { ...result } = user;
      return result;
    }

    return null;
  }
}
