import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppTestingModule } from '../src/app.module';
import * as request from 'supertest';
import { TestingDatabaseModule } from 'src/modules/database/database.module';
import { hashSync } from '@node-rs/bcrypt';
import { getConnection } from 'typeorm';
import { Song, SongList, User } from 'src/entity';
import { SongListPostDTO } from 'src/dto/songlist.dto';
import { SongDTO } from 'src/dto/song.dto';

describe('UsersController (e2e)', () => {
	let app: INestApplication;

	let data = {
		user1: { id: '35806c7f-980c-4e77-afd5-1be01002ab6c', name: 'Adrian Molina', password: 'aml360' },
		user2: { id: '7ddd9115-c26c-4ed0-88de-a2ad50affd9b', name: 'Graydon Hoare', password: 'rust-designer' },
		userNotRegistered: { id: '30d66349-2e7c-40c3-b430-c09ddf2e79cb', name: 'Random name', password: 'random_pass' },
		/** Changed in beforeAll with correct id */
		user1ListId: 0,
		/** Changed in beforeAll with correct id */
		user2ListId: 0,
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

		// IFEEs are used to imitate rust syntax and don't pollute the scope of beforeAll with variables, prefered over this code:
		//
		// ```ts
		// let song1: Song | undefined = undefined;
		// {
		// 	const entity = entityManager.create(Song, { artist: 'The weekend', title: 'Best Friends' });
		// 	song1 = entityManager.save(entity);
		// }
		// ```
		// Because song1 is const instead of let and can't be undefined
		//

		// Insert user1
		const user1 = await entityManager.insert<User>(User, {
			id: data.user1.id,
			name: data.user1.name,
			password: hashSync(data.user1.password),
		});

		// Insert user2
		const user2 = await entityManager.insert<User>(User, {
			id: data.user2.id,
			name: data.user2.name,
			password: hashSync(data.user2.password),
		});
		// Insert song1;
		const song1 = await (async () => {
			const entity = entityManager.create(Song, { artist: 'The weekend', title: 'Gasoline' });
			return entityManager.save(entity);
		})();

		// Insert song2;
		const song2 = await (async () => {
			const entity = entityManager.create(Song, { artist: 'The weekend', title: 'Best Friends' });
			return entityManager.save(entity);
		})();

		// Insert SongList to user1
		const listUserOwner = await (async () => {
			const entity = entityManager.create(SongList, {
				name: 'Pop',
				user: user1.identifiers[0]!.id as User,
				songs: [song1, song2],
			});
			return entityManager.save(entity);
		})();
		data.user1ListId = listUserOwner.listId;

		// Insert empty SongList to user2
		const listUser2 = await (async () => {
			const entity = entityManager.create(SongList, {
				name: 'Rock',
				user: user2.identifiers[0]!.id as User,
				songs: [],
			});
			return entityManager.save(entity);
		})();
		data.user2ListId = listUser2.listId;

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
					// TODO: Change and not use static jsons. Expected data should be created on beforeAll
					expect(response.body).toStrictEqual(
						JSON.parse(
							'[{"listId":1,"name":"Pop","songs":[{"id":1,"artist":"The weekend","title":"Gasoline"},{"id":2,"artist":"The weekend","title":"Best Friends"}]}]',
						),
					);
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
		it('should add a list to a given user with correct auth', async () => {
			const payload: SongListPostDTO = { name: 'any_name', songs: [] };
			const req1 = await request(app.getHttpServer())
				.post(`/users/${data.user2.id}/lists`)
				.send(payload)
				.auth(tokens.user2, { type: 'bearer' });

			expect(req1.status).toBe(201);
			expect(req1.body).toEqual(expect.any(Object));
			expect(req1.body.listId).toEqual(expect.any(Number));

			const req2 = await request(app.getHttpServer())
				.get(`/users/${data.user2.id}/lists/${req1.body.listId}`)
				.auth(tokens.user2, { type: 'bearer' });
			expect(req2.body).toStrictEqual(JSON.parse(`{"listId":${req1.body.listId},"name":"any_name","songs":[]}`));
		});

		it('should add a list with songs to a given user with correct auth', async () => {
			const payload: SongListPostDTO = { name: 'anotherName', songs: [{ artist: 'Artist', title: 'AnotherTitle' }] };
			const req1 = await request(app.getHttpServer())
				.post(`/users/${data.user2.id}/lists`)
				.send(payload)
				.auth(tokens.user2, { type: 'bearer' });
			expect(req1.status).toBe(201);
			expect(req1.body).toEqual(expect.any(Object));
			expect(req1.body.listId).toEqual(expect.any(Number));

			const req2 = await request(app.getHttpServer())
				.get(`/users/${data.user2.id}/lists/${req1.body.listId}`)
				.auth(tokens.user2, { type: 'bearer' });
			expect(req2.body).toStrictEqual(
				JSON.parse(
					`{"listId":${req1.body.listId},"name":"anotherName","songs":[{"id":3,"artist":"Artist","title":"AnotherTitle"}]}`,
				),
			);
		});

		// Common validations
		it('should return 403 if there is no token provided', () => {
			const payload: SongListPostDTO = { name: 'any_name', songs: [] };
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists`)
				.send(payload)
				.then(response => {
					expect(response.status).toBe(403);
					expect(response.body.message).toBe('Token is not provided or is not a Bearer one');
				});
		});

		it('should return 403 if id of jwt.payload does not match with url user id', () => {
			const payload: SongListPostDTO = { name: 'any_name', songs: [] };
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists`)
				.send(payload)
				.auth(tokens.user2, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(403);
				});
		});

		it('should return 400 if token is malformed', () => {
			const payload: SongListPostDTO = { name: 'any_name', songs: [] };
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists`)
				.send(payload)
				.auth('malformed-token', { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(400);
				});
		});
		//End Common validations
	});

	describe('getListOfUser endpoint', () => {
		it('should return a given list of user that exist', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists/${data.user1ListId}`)
				.auth(tokens.user1, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(200);
					expect(response.body).toStrictEqual(
						// TODO: Generate data in beforeAll to not parse a magic string
						JSON.parse(
							'{"listId":1,"name":"Pop","songs":[{"id":1,"artist":"The weekend","title":"Gasoline"},{"id":2,"artist":"The weekend","title":"Best Friends"}]}',
						),
					);
				});
		});
		it('should return 404 if that list does not exist', () => {
			const listIdNotExist = 99999;
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists/${listIdNotExist}`)
				.auth(tokens.user1, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(404);
					expect(response.body.message).toBe(`songList with id ${listIdNotExist} doesn't exist`);
				});
		});

		// Common validations
		it('should return 403 if there is no token provided', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists/1`)
				.then(response => {
					expect(response.status).toBe(403);
					expect(response.body.message).toBe('Token is not provided or is not a Bearer one');
				});
		});

		it('should return 403 if id of jwt.payload does not match with url user id', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists/1`)
				.auth(tokens.user2, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(403);
				});
		});

		it('should return 400 if token is malformed', () => {
			return request(app.getHttpServer())
				.get(`/users/${data.user1.id}/lists/1`)
				.auth('malformed-token', { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(400);
				});
		});
		//End Common validations
	});

	describe('addSongToList endpoint', () => {
		it('should add a song to a given list that exist on db', async () => {
			const payload: SongDTO = { artist: 'Dua Lipa', title: 'Cold Heart' };
			const req1 = await request(app.getHttpServer())
				.post(`/users/${data.user2.id}/lists/${data.user2ListId}/songs`)
				.send(payload)
				.auth(tokens.user2, { type: 'bearer' });

			expect(req1.status).toBe(201);
		});

		it('should NOT add a song to a given list that does not exist on db', () => {
			const payload: SongDTO = { artist: 'Dua Lipa', title: 'Cold Heart' };
			const listId = 9999;
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists/${listId}/songs`)
				.auth(tokens.user1, { type: 'bearer' })
				.send(payload)
				.then(response => {
					expect(response.status).toBe(400);
					expect(response.body.message).toBe(`SongList with id ${listId} does not exist`);
				});
		});

		// Common validations
		it('should return 403 if there is no token provided', () => {
			const payload: SongDTO = { title: 'RandomTitle', artist: 'RandomArtist' };
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists/${data.user1ListId}/songs`)
				.send(payload)
				.then(response => {
					expect(response.status).toBe(403);
					expect(response.body.message).toBe('Token is not provided or is not a Bearer one');
				});
		});

		it('should return 403 if id of jwt.payload does not match with url user id', () => {
			const payload: SongDTO = { title: 'RandomTitle', artist: 'RandomArtist' };
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists/${data.user1ListId}/songs`)
				.send(payload)
				.auth(tokens.user2, { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(403);
				});
		});

		it('should return 400 if token is malformed', () => {
			const payload = {};
			return request(app.getHttpServer())
				.post(`/users/${data.user1.id}/lists/${data.user1ListId}/songs`)
				.send(payload)
				.auth('malformed-token', { type: 'bearer' })
				.then(response => {
					expect(response.status).toBe(400);
				});
		});
		//End Common validations
	});
});
