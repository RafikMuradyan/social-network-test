import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Raw,
  Repository,
} from 'typeorm';
import { UserNotFoundException } from './exceptions';
import { ChangePasswordDto, CreateUserDto, UserSearchDto } from './dtos';
import { IncorrectPasswordException } from '../auth/exceptions';
import { plainToInstance } from 'class-transformer';
import { UserAlreadyExsistsException } from './exceptions';
import { PageOptionsDto, PageDto, PageMetaDto } from 'src/common';
import { FriendRequestStatus } from '../friend-request/enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ id });

    if (!existingUser) {
      throw new UserNotFoundException();
    }

    return existingUser;
  }

  async findByUsername(username: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    return existingUser;
  }

  async findByUsernameOrFail(username: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (!existingUser) {
      throw new UserNotFoundException();
    }

    return plainToInstance(User, existingUser);
  }

  async registration(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new UserAlreadyExsistsException();
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    return plainToInstance(User, savedUser);
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<Partial<User>> {
    const user = await this.findById(id);

    const isMatch = await compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new IncorrectPasswordException();
    }

    const hashedNewPassword = await hash(changePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;

    const updatedUser = await this.userRepository.save(user);

    return plainToInstance(User, updatedUser);
  }

  async searchUsers(
    currentUserId: number,
    searchParams: UserSearchDto,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    const { searchTerm, minAge, maxAge } = searchParams;
    const where: FindOptionsWhere<User> = {};

    where.id = Not(currentUserId);

    if (searchTerm) {
      const search = `%${searchTerm}%`;
      where.username = Raw((alias) => `${alias} ILIKE :search`, { search });
    }

    if (minAge && maxAge) {
      where.age = Between(minAge, maxAge);
    } else if (minAge) {
      where.age = MoreThanOrEqual(minAge);
    } else if (maxAge) {
      where.age = LessThanOrEqual(maxAge);
    }

    const [users, totalCount] = await this.userRepository.findAndCount({
      where,
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.take,
    });

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(plainToInstance(User, users), pageMetaDto);
  }

  async getFriends(
    userId: number,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    const [friends, totalCount] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        'friend_requests',
        'sentRequests',
        'sentRequests.sender_id = user.id',
      )
      .leftJoin(
        'friend_requests',
        'receivedRequests',
        'receivedRequests.receiver_id = user.id',
      )
      .where(
        '(sentRequests.receiver_id = :userId AND sentRequests.status = :status) OR ' +
          '(receivedRequests.sender_id = :userId AND receivedRequests.status = :status)',
        { userId, status: FriendRequestStatus.ACCEPTED },
      )
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({ totalCount, pageOptionsDto });

    return new PageDto(plainToInstance(User, friends), pageMetaDto);
  }
}
