import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserNotFoundException } from './exceptions';
import { ChangePasswordDto, CreateUserDto } from './dtos';
import { IncorrectPasswordException } from '../auth/exceptions';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserAlreadyExsistsException } from './exceptions/user-already-exsists.exception';

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

    const updatedAdmin = await this.userRepository.save(user);

    return instanceToPlain(updatedAdmin);
  }
}
