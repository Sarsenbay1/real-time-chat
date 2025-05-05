import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, MinLength } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @MinLength(1)
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  userIds: number[];
}
