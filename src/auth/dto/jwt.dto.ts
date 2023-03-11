import { IsEmail, IsNumber } from 'class-validator';

export class JwtDto {
  @IsNumber()
  sub: number;

  @IsEmail()
  email: string;
}
