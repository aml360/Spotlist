import { TypeOrmModule } from '@nestjs/typeorm';
import { Song, SongList, User } from 'src/entity';
import { ConnectionOptions } from 'typeorm';

export const databaseProviders = [
	TypeOrmModule.forRootAsync({
		async useFactory() {
			return {
				type: 'sqlite',
				// TODO: This should not be hardcoded (magic string)
				database: __dirname + '/../../../data/database.sqlite',
				entities: [User, Song, SongList],
				migrations: [__dirname + '/migrations/*{.ts,.js}'],
				logging: false,
			} as ConnectionOptions;
		},
	}),
];
