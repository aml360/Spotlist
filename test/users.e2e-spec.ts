import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppTestingModule } from '../src/app.module';
import * as request from 'supertest';
import { TestingDatabaseModule } from 'src/modules/database/database.module';
import { hashSync } from '@node-rs/bcrypt';
import { getConnection } from 'typeorm';
import { User } from 'src/entity';

describe('UsersController (e2e)', () => {
	let app: INestApplication;

	let data = {
		user1: { id: '35806c7f-980c-4e77-afd5-1be01002ab6c', name: 'Adrian Molina', password: 'aml360' },
		user2: { id: '7ddd9115-c26c-4ed0-88de-a2ad50affd9b', name: 'Graydon Hoare', password: 'rust-designer' },
		userNotRegistered: { id: '30d66349-2e7c-40c3-b430-c09ddf2e79cb', name: 'Random name', password: 'random_pass' },
	};

	/**
	 * to debug use {@link https://jwt.io/}
	 */
	const tokens = {
		user1:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1ODA2YzdmLTk4MGMtNGU3Ny1hZmQ1LTFiZTAxMDAyYWI2YyJ9.GRLTw4LwJLON4UQ9b6VJLJT17Xl-6XCKMg9m66l2GEE',
		user2:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdkZGQ5MTE1LWMyNmMtNGVkMC04OGRlLWEyYWQ1MGFmZmQ5YiJ9.0PGgmtvi2-70XiX9zd6aQ2eDKm-4ksnb-BRP9FO0rJs',
		userNotRegistered:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMwZDY2MzQ5LTJlN2MtNDBjMy1iNDMwLWMwOWRkZjJlNzljYiJ9.CDFp1slYjGqaEJTpMugojHc4Wwp_n5e23-ljKQOXn98',
		invalidKeyToken:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM1ODA2YzdmLTk4MGMtNGU3Ny1hZmQ1LTFiZTAxMDAyYWI2YyJ9.7ChTYrxOSLg6QeFX_nyzp7nBH7xJoJ4F8y5fTMjcfMQ',
	};

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppTestingModule, TestingDatabaseModule],
		}).compile();

		const entityManager = getConnection().createEntityManager();

		// Insert user1
		await entityManager.insert<User>(User, {
			id: data.user1.id,
			name: data.user1.name,
			password: hashSync(data.user1.password),
		});

		// Insert user2
		await entityManager.insert<User>(User, {
			id: data.user2.id,
			name: data.user2.name,
			password: hashSync(data.user2.password),
		});
		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('getUserLists endpoint', () => {
		it('should return a list of songs if userOwner is the owner', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists`)
				.auth(tokens.user1, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(200);
					expect(response.body).toEqual(expect.any(Array));
				});
		});

		it('should return 403 if there is no token provided', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists`)
				.then(response => {
					expect(response.status).toBe(403);
					expect(response.body.message).toBe('Token is not provided or is not a Bearer one');
				});
		});

		it('should return 403 if id of jwt.payload does not match with url user id', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists`)
				.auth(tokens.user2, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(403);
				});
		});

		it('should return 400 if token is malformed', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists`)
				.auth('malformed-token', { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(400);
				});
		});

		it('should return 404 if the user does not exist and jwt is valid', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.userNotRegistered.id}/lists`)
				.auth(tokens.userNotRegistered, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(404);
				});
		});
	});

	describe('addListToUser endpoint', () => {
		it.todo('should add a list to a given user with correct auth');
		it.todo('should not add a list to a given user without correct auth');

		// Common validations
		it.todo('should return 403 if there is no token provided');
		it.todo('should return 403 if id of jwt.payload does not match with url user id');
		it.todo('should return 400 if token is malformed');
		//End Common validations
	});
	describe('getListOfUser endpoint', () => {
		it.todo('should return a given list of user that exist');
		it.todo('should return 404 if that list does not exist');

		// Common validations
		it.todo('should return 403 if there is no token provided');
		it.todo('should return 403 if id of jwt.payload does not match with url user id');
		it.todo('should return 400 if token is malformed');
		//End Common validations
	});
	describe('addSongToList endpoint', () => {
		it.todo('should add a song to a given list that exist on db');
		it.todo('should not add a song to a given list that does not exist on db');
		it.todo('should not add a song to a list from other user');

		// Common validations
		it.todo('should return 403 if there is no token provided');
		it.todo('should return 403 if id of jwt.payload does not match with url user id');
		it.todo('should return 400 if token is malformed');
		//End Common validations
	});
});
