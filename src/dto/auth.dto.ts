import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDTO {
	@Expose()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@Expose()
	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class SignInDTO {
	@Expose()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@Expose()
	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class JwtDTO {
	@Expose()
	@IsString()
	@IsNotEmpty()
	token!: string;
}

/**
 * Payload that jwt will have inside
 */
export class JwtPayloadDTO {
	/** User uuid */
	@Expose()
	@IsString()
	@IsNotEmpty()
	id!: string;
}
