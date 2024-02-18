import {
  IsArray,
  IsNumber,
  IsString,
  MinLength,
  isArray,
  isNumber,
} from 'class-validator';

export class CreateChatDto {
  @MinLength(1)
  @IsString()
  name: string;

  @IsArray()
  @MinLength(2)
  usersId: number[];
}
