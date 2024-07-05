import { ApiProperty } from '@nestjs/swagger';

export class ChatRto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  createrId: number;
  @ApiProperty()
  name: string;
}
