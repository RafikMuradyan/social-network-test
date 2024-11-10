import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common';
import { Exclude } from 'class-transformer';
import { FriendRequest } from '../friend-request/friend-request.entity';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;

  @Column({ nullable: false, type: 'smallint' })
  age!: number;

  @Column({ unique: true, nullable: false, type: 'varchar' })
  username!: string;

  @Column({ nullable: false, type: 'varchar' })
  @Exclude()
  password!: string;

  @OneToMany(() => FriendRequest, (request) => request.sender)
  sentRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (request) => request.receiver)
  receivedRequests: FriendRequest[];
}
