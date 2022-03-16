import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	Get,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { JwtDTO, RegisterDTO, SignInDTO } from 'src/dto/auth.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }))
export class AuthController {
	constructor(private readonly authSv: AuthService, private readonly userSv: UsersService) {}

	@Get('signin')
	async signin(@Body() signInDto: SignInDTO): Promise<JwtDTO> {
		const userDb = await this.userSv.findBy({ name: signInDto.name });
		if (!userDb) {
			throw new BadRequestException(`user with ${signInDto.name} is not registered`);
		}
		const isPasswordCorrect = this.authSv.matchesUserPassword(signInDto, userDb);

		if (!isPasswordCorrect) {
			throw new ForbiddenException('incorrect user name or password');
		}
		return { token: this.authSv.generateJwt({ id: userDb.id }) };
	}

	@Post('register')
	async register(@Body() registerDto: RegisterDTO): Promise<true> {
		const isUserRegistered = await this.userSv.existUser({ name: registerDto.name });
		if (isUserRegistered) {
			throw new BadRequestException(`user with ${registerDto.name} is already registered`);
		}
		await this.authSv.registerUser(registerDto);
		return true;
	}
}
