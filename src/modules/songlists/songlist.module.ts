import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongListRepository, SongRepository } from 'src/repository';
import { SongListService } from './songlist.service';

@Module({
	imports: [TypeOrmModule.forFeature([SongListRepository, SongRepository])],
	providers: [SongListService],
	exports: [SongListService],
})
export class SongListModule {}
