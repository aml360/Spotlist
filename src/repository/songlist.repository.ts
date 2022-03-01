import { SongList } from 'src/entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(SongList)
export class SongListRepository extends Repository<SongList> {}
