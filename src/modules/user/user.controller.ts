import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageDto, PageOptionsDto } from 'src/common';
import { User } from './user.entity';
import { UserSearchDto } from './dtos/user-search.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async searchUsers(
    @Req() req: IRequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchParams: UserSearchDto,
  ): Promise<PageDto<User>> {
    const currentUserId = req.user.id;
    return this.userService.searchUsers(
      currentUserId,
      searchParams,
      pageOptionsDto,
    );
  }
}
