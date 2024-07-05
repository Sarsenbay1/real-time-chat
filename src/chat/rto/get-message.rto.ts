import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesRto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  date_sending: string;

  @ApiProperty()
  users: {
    id: number;
    username: string;
    password: string;
  };
}
