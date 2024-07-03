import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @MinLength(1)
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  chatId: number;
}
