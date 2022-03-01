import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { USER_OWNER } from './shared';
import { cloneDeep } from 'lodash';

describe('Create SongList e2e', () => {
	const user = cloneDeep(USER_OWNER);
	const basePath: string = `/users/${user.id}/lists`;

	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});
	// TODO: Implement addListTest e2e
});
