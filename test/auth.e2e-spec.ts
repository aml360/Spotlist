import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppTestingModule } from 'src/app.module';
import { RegisterDTO, SignInDTO } from 'src/dto/auth.dto';
import { TestingDatabaseModule } from 'src/modules/database/database.module';

describe('Auth controller (e2e)', () => {
	let app: INestApplication;
	const data = {
		userToRegister: {
			name: 'AnotherRandomName',
			password: 'random-password',
		} as RegisterDTO,
		userRegistered: {
			name: 'user_registered',
			password: 'random-password',
		} as SignInDTO,
		userNotRegistered: {
			name: 'random_username',
			password: 'random-password',
		} as RegisterDTO,
		baseSignInUrl: '/auth/signin',
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppTestingModule, TestingDatabaseModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// TODO: Change this and use typeorm repository for adding data to database
		// I do this because I know that endpoints works but this won't in early development stages or if a developer changes the endpoint function invalidating it.
		await request(app.getHttpServer()).post('/auth/register').send(data.userRegistered);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('Register endpoint tests', () => {
		it('Should register a new user', () => {
			return request(app.getHttpServer())
				.post('/auth/register')
				.send(data.userToRegister)
				.then(response => {
					expect(response.status).toBe(201);
				});
		});

		it('Should return 400 BadRequest', () => {
			return request(app.getHttpServer())
				.post('/auth/register')
				.send(data.userRegistered)
				.then(response => {
					expect(response.status).toBe(400);
					expect(response.badRequest).toBeTruthy();
				});
		});

		it(`Should return this error message: user with ${data.userRegistered.name} is already registered`, () => {
			return request(app.getHttpServer())
				.post('/auth/register')
				.send(data.userRegistered)
				.then(response => {
					expect(response.body.message).toBe(`user with ${data.userRegistered.name} is already registered`);
				});
		});
	});

	describe('Signin endpoint tests', () => {
		it('Should return status 200 with valid username and password', () => {
			return request(app.getHttpServer())
				.get(data.baseSignInUrl)
				.send(data.userRegistered)
				.then(response => {
					expect(response.status).toBe(200);
				});
		});

		it('Should return status 400 (BadRequestException)', () => {
			return request(app.getHttpServer())
				.get(data.baseSignInUrl)
				.send(data.userNotRegistered)
				.then(response => {
					expect(response.status).toBe(400);
					expect(response.badRequest).toBeTruthy();
				});
		});

		it(`Should return this error message:  ${data.userNotRegistered.name} is not registered`, () => {
			return request(app.getHttpServer())
				.get(data.baseSignInUrl)
				.send(data.userNotRegistered)
				.then(response => {
					expect(response.body.message).toBe(`user with ${data.userNotRegistered.name} is not registered`);
				});
		});

		it('Should return this error message:  incorrect user name or password', () => {
			return request(app.getHttpServer())
				.get(data.baseSignInUrl)
				.send({ ...data.userRegistered, password: 'dasdsadas' })
				.then(response => {
					expect(response.body.message).toBe('incorrect user name or password');
				});
		});
	});
});
