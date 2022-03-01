import { Song } from 'src/entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(Song)
export class SongRepository extends Repository<Song> {}
