import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NewSoDto {
	@IsString()
	@IsNotEmpty()
	content: string;

	@IsString()
	@IsOptional()
	tag?: string;
}
