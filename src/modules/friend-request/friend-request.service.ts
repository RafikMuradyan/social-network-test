import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './friend-request.entity';
import { FriendRequestStatus } from './enums';
import { UserService } from '../user/user.service';
import {
  CantRequestToSelfException,
  FriendRequestExsistsException,
  FriendRequestNotFoundException,
} from './exceptions';
import { PageDto, PageMetaDto, PageOptionsDto } from '../../common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    private userService: UserService,
  ) {}

  async sendRequest(
    senderId: number,
    receiverId: number,
  ): Promise<FriendRequest> {
    if (senderId === receiverId) {
      throw new CantRequestToSelfException();
    }

    const receiver = await this.userService.findById(receiverId);

    const existingRequest = await this.friendRequestRepository.findOne({
      where: [
        { sender: { id: senderId }, receiver: { id: receiver.id } },
        { sender: { id: receiver.id }, receiver: { id: senderId } },
      ],
    });

    if (existingRequest) {
      throw new FriendRequestExsistsException();
    }

    const friendRequest = this.friendRequestRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      status: FriendRequestStatus.PENDING,
    });

    const createdRequest =
      await this.friendRequestRepository.save(friendRequest);

    return plainToInstance(FriendRequest, createdRequest);
  }

  async getReceivedRequests(
    userId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<FriendRequest>> {
    const [requests, totalCount] =
      await this.friendRequestRepository.findAndCount({
        where: {
          receiver: { id: userId },
          status: FriendRequestStatus.PENDING,
        },
        relations: ['sender'],
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take,
        order: {
          createdAt: pageOptionsDto.order,
        },
      });

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(plainToInstance(FriendRequest, requests), pageMetaDto);
  }

  async getSentRequests(
    userId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<FriendRequest>> {
    const [requests, totalCount] =
      await this.friendRequestRepository.findAndCount({
        where: { sender: { id: userId } },
        relations: ['receiver'],
        skip: pageOptionsDto.skip,
        take: pageOptionsDto.take,
      });

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(plainToInstance(FriendRequest, requests), pageMetaDto);
  }

  async acceptRequest(
    requestId: number,
    userId: number,
  ): Promise<FriendRequest> {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId, receiver: { id: userId } },
    });

    if (!request || request.status !== FriendRequestStatus.PENDING) {
      throw new FriendRequestNotFoundException();
    }

    request.status = FriendRequestStatus.ACCEPTED;
    const savedRequest = await this.friendRequestRepository.save(request);

    return plainToInstance(FriendRequest, savedRequest);
  }

  async declineRequest(
    requestId: number,
    userId: number,
  ): Promise<FriendRequest> {
    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId, receiver: { id: userId } },
    });

    if (!request || request.status !== FriendRequestStatus.PENDING) {
      throw new FriendRequestNotFoundException();
    }

    request.status = FriendRequestStatus.DECLINED;
    const savedRequest = await this.friendRequestRepository.save(request);

    return plainToInstance(FriendRequest, savedRequest);
  }
}
