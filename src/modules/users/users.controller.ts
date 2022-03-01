import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	Headers,
	BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDTO } from 'src/dto/auth.dto';
import { SongDTO } from 'src/dto/song.dto';
import { SongListGetDTO, SongListPostDTO } from 'src/dto/songlist.dto';
import { SongListService } from '../songlists/songlist.service';
import { UsersService } from './users.service';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }))
export class UsersController {
	constructor(
		private readonly usrSv: UsersService,
		private readonly songListSv: SongListService,
		private readonly jwtSv: JwtService,
	) {}

	@Post(':userId/lists')
	async addListToUser(
		@Param('userId') userId: string,
		@Body() listDto: SongListPostDTO,
		@Headers('Authorization') token: string | undefined,
	): Promise<SongListGetDTO> {
		await this.commonValidations(token, userId);
		await this.usrSv.addListToUser(userId, listDto);
		return {} as SongListGetDTO;
	}

	@Get(':userId/lists')
	async getUserLists(
		@Param('userId') userId: string,
		@Headers('Authorization') token: string | undefined,
	): Promise<SongListGetDTO[]> {
		await this.commonValidations(token, userId);
		return this.usrSv.getUserLists(userId);
	}

	@Get(':userId/lists/:listId')
	async getListOfUser(
		@Param('userId') userId: string,
		@Param('listId', ParseIntPipe) listId: number,
		@Headers('Authorization') token: string | undefined,
	): Promise<SongListGetDTO> {
		await this.commonValidations(token, userId);

		if (!(await this.songListSv.existList(listId))) {
			// Swagger.yaml indicates that 404 exception is not throwed in this endpoint but I think that represent better the error that BadParametersException
			throw new NotFoundException(`songList with id ${listId} doesn't exist`);
		}
		return this.usrSv.getUserLists(userId, listId);
	}

	@Post(':userId/lists/:listId/songs')
	async addSongToList(
		@Param('userId') userId: string,
		@Param('listId') listId: number,
		@Body() song: SongDTO,
		@Headers('Authorization') token: string | undefined,
	): Promise<SongDTO> {
		await this.commonValidations(token, userId);

		this.songListSv.addSongToList(listId, song);
		return song; // This is not correct, but I am just implementing the swagger documentation provided by rviewer.
	}

	private async commonValidations(token: string | undefined, userId: string) {
		if (!token || !this.validateBearerHeader(token)) {
			throw new ForbiddenException(`Token is not provided or is not a Bearer one`);
		}
		const tokenEncoded = this.removeBearerSlice(token);
		let tokenDecoded: JwtPayloadDTO | null = null;
		try {
			tokenDecoded = this.jwtSv.verify<JwtPayloadDTO>(tokenEncoded);
		} catch (error) {}
		if (tokenDecoded === null) {
			throw new BadRequestException(`Jwt is malformed, could not verify it and decode its payload`);
		}
		if (tokenDecoded.id !== userId) {
			throw new ForbiddenException(`Jwt userId does not match with url userId parameter`);
		}
		const existUser = await this.usrSv.existUser({ id: userId });
		if (!existUser) {
			throw new NotFoundException(`user with id ${userId} doesn't exist`);
		}
	}

	private validateBearerHeader(headerContent: string): boolean {
		return headerContent.startsWith('Bearer ');
	}

	private removeBearerSlice(bearerStr: string): string {
		return bearerStr.substring('Bearer '.length);
	}
}
