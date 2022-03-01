import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class SongDTO {
	@Expose()
	@IsString({ message: 'User.username must be a string' })
	@IsNotEmpty({ message: 'User.username must be defined' })
	artist!: string;

	@Expose()
	@ApiProperty()
	@IsString({ message: 'User.email must be a string' })
	@IsNotEmpty({ message: 'User.email must be defined' })
	title!: string;
}

// Song:
// type: object
// required:
// 	- artist
// 	- title
// properties:
// 	artist:
// 		type: string
// 	title:
// 		type: string
