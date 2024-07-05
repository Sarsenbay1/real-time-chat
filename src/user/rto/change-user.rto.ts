import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserRto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}
