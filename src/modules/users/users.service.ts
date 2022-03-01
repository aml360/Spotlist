import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { cloneDeep } from 'lodash';
import { RegisterDTO } from 'src/dto/auth.dto';
import { SongListGetDTO, SongListPostDTO } from 'src/dto/songlist.dto';
import { Song, User } from 'src/entity';
import { SongList } from 'src/entity/songlist.entity';
import { SongRepository } from 'src/repository';
import { UserRepository } from 'src/repository/user.repository';
import { SongListService } from '../songlists/songlist.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserRepository)
		private readonly usrRepo: UserRepository,
		@InjectRepository(SongRepository)
		private readonly songRepo: SongRepository,
		private readonly songListSv: SongListService,
	) {}

	findBy(by: { name: string }): Promise<User | undefined>;
	findBy(by: { id: string }): Promise<User | undefined>;
	/**
	 * @param by Object with user find options
	 * @returns An user entity or undefined if user don't exist on db
	 */
	findBy(by: { id?: string; name?: string }): Promise<User | undefined> {
		if (by.id !== undefined) {
			return this.usrRepo.findOne(by.id);
		} else {
			return this.usrRepo.findOne({ where: { name: by.name } });
		}
	}

	existUser(by: { name: User['name'] }): Promise<boolean>;
	existUser(by: { id: User['id'] }): Promise<boolean>;
	async existUser(by: { name?: User['name']; id?: User['id'] }): Promise<boolean> {
		if (typeof by.name === 'string') {
			return !!(await this.usrRepo.findOne({ where: { name: by.name }, select: ['id'] }));
		} else {
			// Due to overloads, here by.id can only be typeof = User['id'] (string)
			return !!(await this.usrRepo.findOne(by.id, { select: ['id'] }));
		}
	}

	/**
	 *
	 * @param userId
	 * @param listId
	 * @returns A single song list of a user with given listId
	 * @throws Error if user not exist
	 *
	 */
	async getUserLists(userId: string, listId: SongList['listId']): Promise<SongListGetDTO>;
	/**
	 *
	 * @param userId
	 * @returns All lists of a user
	 * @throws Error if user not exist
	 *
	 */
	async getUserLists(userId: string): Promise<SongListGetDTO[]>;
	async getUserLists(userId: string, listId?: SongList['listId']): Promise<SongListGetDTO | SongListGetDTO[]> {
		const user = await this.usrRepo.findOne(userId, {
			join: {
				alias: 'user',
				leftJoinAndSelect: {
					songLists: 'user.songLists',
					songs: 'songLists.songs',
				},
			},
		});
		if (!user) {
			throw new Error(`user does not exist with id ${userId}`);
		}
		if (!listId) {
			return user.songLists as unknown as SongListGetDTO[];
		} else {
			return user.songLists.find(list => list.listId === listId) as unknown as SongListGetDTO[];
		}
	}

	/**
	 * CREATE a {@link SongList} and then adds this song list to a user.
	 * Use the listId if SongList has been created and just have to been added to a user
	 * @param userId
	 * @param list
	 */
	async addListToUser(userId: string, list: SongListPostDTO): Promise<void>;
	/**
	 * ADD a {@link SongList} to a {@link User}, the Songlist and the user must exist on database.
	 * @param userId
	 * @param list
	 * @throws
	 */
	async addListToUser(userId: string, list: SongList['listId']): Promise<void>;
	async addListToUser(userId: string, list: SongListPostDTO | SongList['listId']): Promise<void> {
		const userDbPromise = this.usrRepo.findOne(userId, {
			join: { alias: 'user', leftJoinAndSelect: { songLists: 'user.songLists' } },
		});

		// If list is and id, we update the usr songLists
		if (typeof list === 'number') {
			const [songList, userDb] = await Promise.all([this.songListSv.findOne(list), userDbPromise]);
			if (!userDb) {
				throw new Error(`User with id ${userId} does not exist on db`);
			}
			if (!songList) {
				throw new Error(`SongList with id ${list} does not exist on db`);
			}
			this.usrRepo.update(userDb.id, { songLists: [...userDb.songLists, songList] });
		} else {
			//If not, list must be SongListPostDTO, we have to create and then add to usr songLists
			const userDb = await userDbPromise;
			if (!userDb) {
				throw new Error(`User with id ${userId} does not exist on db`);
			}
			const listToSave = cloneDeep(list) as SongList;
			listToSave.user = userDb;
			await this.songRepo.save(listToSave.songs as Song[]);
			const listDb = await this.songListSv.create(listToSave);
		}
	}

	/**
	 *
	 * @param usr User object that will be added to database, password must be already hashed
	 * @throws Exception if user already exists on db
	 *
	 */
	async addUserToDb(usr: RegisterDTO): Promise<void> {
		const usrDb = await this.usrRepo.findOne({ where: { name: usr.name } });
		if (!!usrDb) {
			throw new Error('User already exist on db');
		}
		this.usrRepo.save({ name: usr.name, password: usr.password });
	}
}
