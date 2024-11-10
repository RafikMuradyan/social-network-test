import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IRequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PageDto, PageOptionsDto } from 'src/common';
import { FriendRequest } from './friend-request.entity';

@ApiTags('Friend Requests')
@ApiBearerAuth()
@Controller('friend-requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestController {
  constructor(private friendRequestService: FriendRequestService) {}

  @Post('send/:receiverId')
  async sendRequest(
    @Req() req: IRequestWithUser,
    @Param('receiverId') receiverId: number,
  ): Promise<FriendRequest> {
    return this.friendRequestService.sendRequest(req.user.id, receiverId);
  }

  @Get('received')
  async getReceivedRequests(
    @Req() req: IRequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<FriendRequest>> {
    return this.friendRequestService.getReceivedRequests(
      req.user.id,
      pageOptionsDto,
    );
  }

  @Get('sent')
  async getSentRequests(
    @Req() req: IRequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<FriendRequest>> {
    return this.friendRequestService.getSentRequests(
      req.user.id,
      pageOptionsDto,
    );
  }

  @Patch('accept/:requestId')
  async acceptRequest(
    @Req() req: IRequestWithUser,
    @Param('requestId') requestId: number,
  ): Promise<FriendRequest>  {
    return this.friendRequestService.acceptRequest(requestId, req.user.id);
  }

  @Patch('decline/:requestId')
  async declineRequest(
    @Req() req: IRequestWithUser,
    @Param('requestId') requestId: number,
  ): Promise<FriendRequest>  {
    return this.friendRequestService.declineRequest(requestId, req.user.id);
  }
}
