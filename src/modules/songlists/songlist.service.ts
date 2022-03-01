import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SongDTO } from 'src/dto/song.dto';
import { Song, SongList } from 'src/entity';
import { SongListRepository, SongRepository } from 'src/repository';

@Injectable()
export class SongListService {
	constructor(
		@InjectRepository(SongListRepository)
		private readonly songListRepo: SongListRepository,
		@InjectRepository(SongRepository)
		private readonly songRepo: SongRepository,
	) {}

	/**
	 * @param listId The list id for searching one songlist
	 * @returns A songlist if exists on db, undefined otherwise
	 */
	findOne(listId: SongList['listId']): Promise<SongList | undefined> {
		return this.songListRepo.findOne(listId);
	}

	/**
	 * Creates a new songList, it does not check if a list with the same songs and name exist on db.
	 * If the same list exist, it will duplicate it with diferent id.
	 *
	 * @param list The songList without user and id
	 * @returns The songList entity created on db with the id
	 */
	create(list: SongList) {
		return this.songListRepo.save(list);
	}

	/**
	 * Executes a fast select query without any data column to check if some row exist on db
	 * @param id The songList id
	 * @returns True if exist a SongList with that id, false otherwise
	 */
	async existList(id: SongList['listId']): Promise<boolean> {
		return !!(await this.songListRepo.findOne(id, { select: ['listId'] }));
	}

	/**
	 * CREATES the song and then adds to an existing songList
	 * @param id
	 * @param songToAdd
	 */
	async addSongToList(id: SongList['listId'], songToAdd: SongDTO): Promise<SongList>;
	/**
	 * UPDATE a songlist adding an EXISTING song on db
	 * @param id the songlist id
	 * @param songToAdd The song id witch will be included on a songlist
	 */
	async addSongToList(id: SongList['listId'], songToAdd: Song['id']): Promise<SongList>;
	async addSongToList(id: SongList['listId'], songToAdd: SongDTO | Song['id']): Promise<SongList> {
		if (typeof songToAdd === 'object') {
			const [list, songDb] = await Promise.all([
				this.songListRepo.findOne(id, { relations: ['songs'] }),
				this.songRepo.save(songToAdd),
			]);
			if (!list) {
				throw new Error(`List with id ${id} does not exist`);
			}
			return this.songListRepo.save({ listId: id, songs: [...list.songs!, songDb] });
		} else {
			const list = await this.songListRepo.findOne(id, { relations: ['songs'] });
			if (!list) {
				throw new Error(`List with id ${id} does not exist`);
			}
			return this.songListRepo.save({ listId: id, songs: [...list.songs!, songToAdd as any] });
		}
	}
}
