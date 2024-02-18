import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.chats)
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
