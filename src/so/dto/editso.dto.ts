import { IsOptional, IsString } from 'class-validator';

export class EditSoDto {
	@IsString()
	@IsOptional()
	content?: string;

	@IsString()
	@IsOptional()
	tag?: string;
}
