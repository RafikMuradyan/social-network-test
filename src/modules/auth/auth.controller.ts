import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos';
import { ILoginResponse } from './interfaces';
import { UserService } from '../user/user.service';
import { ChangePasswordDto, CreateUserDto } from '../user/dtos';
import { JwtAuthGuard } from './guards';
import { IRequestWithUser } from 'src/common';
import { AdminUnauthorizedException } from './exceptions';
import { User } from '../user/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new AdminUnauthorizedException();
    }

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
    };

    const accessToken = await this.authService.login(payload);

    return {
      success: true,
      accessToken,
    };
  }

  @Post('registration')
  async registration(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Partial<User>> {
    const createdUser = this.userService.registration(createUserDto);

    return createdUser;
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: IRequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<Partial<User>> {
    await changePasswordDto.validate();
    const userId = req.user.id;

    return this.userService.changePassword(userId, changePasswordDto);
  }
}
