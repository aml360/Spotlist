import { Injectable } from '@nestjs/common';
import { RegisterDTO } from 'src/dto/auth.dto';
import { hashSync, verifySync } from '@node-rs/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from 'src/entity';

@Injectable()
export class AuthService {
	constructor(private readonly usrSv: UsersService, private readonly jwtSv: JwtService) {}

	/**
	 *
	 * @param user The user to save on db, with password not hashed
	 * @throws error if the user is already registered.
	 */
	async registerUser(user: RegisterDTO): Promise<void> {
		user.password = hashSync(user.password);
		await this.usrSv.addUserToDb(user);
	}

	/**
	 *
	 * @param user The name and password to validate against database
	 * @returns
	 */
	matchesUserPassword(user: Pick<User, 'password'>, userDb: Pick<User, 'password'>): boolean {
		return verifySync(user.password, userDb.password);
	}

	generateJwt(payload: {} | string): string {
		return this.jwtSv.sign(payload);
	}
}
