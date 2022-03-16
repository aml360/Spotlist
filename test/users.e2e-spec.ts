import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { USER_OWNER } from './shared';

describe('getLists (e2e)', () => {
	let app: INestApplication;
	const userOwner = USER_OWNER;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});
});
