import { ApiProperty } from '@nestjs/swagger';

export class UserRto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  id: string;
}
