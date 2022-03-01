import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { Song } from './song.entity';
import { User } from './user.entity';

@Entity()
export class SongList extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	listId!: number;

	// "and each list will be defined by a **unique** id and a name."
	// Spotify can create many lists with the same name, in the docs is not indicated that list's name must be unique
	@Column({ type: 'varchar', length: 100, nullable: false })
	name!: string;

	@ManyToOne(() => User, usr => usr.songLists, { nullable: false })
	user?: User;

	@ManyToMany(() => Song, song => song.lists, { nullable: false })
	@JoinTable()
	songs?: Song[];
}
