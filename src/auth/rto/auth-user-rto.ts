import { ApiProperty } from '@nestjs/swagger';

export class AuthRto {
  @ApiProperty()
  MediaKeySystemAccess_token: string;
}
