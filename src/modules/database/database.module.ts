import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Song, SongList } from 'src/entity';
import { databaseProviders } from './database.providers';
@Module({
	imports: [...databaseProviders],
})
export class DatabaseModule {}

/**
 * Database module, creates an empty syncronized database in memory for each running app
 * Use only for testing
 */
@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'sqlite',
			database: ':memory:',
			dropSchema: true,
			synchronize: true,
			entities: [User, Song, SongList],
			logging: false,
		}),
	],
})
export class TestingDatabaseModule {}
