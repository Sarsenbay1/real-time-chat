import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRto {
  @ApiProperty()
  createrId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  users: {
    id: number;
    username: string;
    password: string;
  }[];

  @ApiProperty()
  id: number;
}
