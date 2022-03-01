import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDTO {
	@Expose()
	@IsString({ message: 'User.username must be a string' })
	@IsNotEmpty({ message: 'User.username must be defined' })
	id!: string;

	@Expose()
	@ApiProperty()
	@IsString({ message: 'User.email must be a string' })
	@IsNotEmpty({ message: 'User.email must be defined' })
	name!: string;

	@Expose()
	@IsString({ message: 'User.password must be a string' })
	@IsNotEmpty({ message: 'User.password must be defined' })
	password!: string;
}

// User:
// type: object
// required:
// 	- id
// 	- name
// 	- password
// properties:
// 	id:
// 		type: string
// 	name:
// 		type: string
// 	password:
// 		type: string
