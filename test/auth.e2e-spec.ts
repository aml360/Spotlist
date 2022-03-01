import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RegisterDTO } from 'src/dto/auth.dto';
import { plainToInstance } from 'class-transformer';

describe('AppController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('Should register a new user', () => {
		const jsonRegister = plainToInstance(RegisterDTO, {
			name: 'random-name',
			password: 'random-password',
		} as RegisterDTO);

		return request(app.getHttpServer())
			.post('/auth/register')
			.set(jsonRegister)
			.then(response => {
				expect(response.status).toBe(200);
			});
	});

	it('Should return a valid jwt', () => {
		return request(app.getHttpServer())
			.get('/auth/signin')
			.set({ name: 'Adrian Molina', password: 'aml360' })
			.then(response => {
				expect(response.status).toBe(200);
				// TODO: Assert that is a valid jwt
			});
	});
});
