import { IsArray, IsString, MinLength } from 'class-validator';

export class CreateChatDto {
  @MinLength(1)
  @IsString()
  name: string;

  @IsArray()
  usersId: number[];
}
