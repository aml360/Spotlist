import {MigrationInterface, QueryRunner} from "typeorm";

export class baseEntities1646127176015 implements MigrationInterface {
    name = 'baseEntities1646127176015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(100) NOT NULL, "password" varchar(100) NOT NULL, CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "song_list" ("listId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100) NOT NULL, "userId" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "song" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "artist" varchar(100) NOT NULL, "title" varchar(100) NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "song_list_songs_song" ("songListListId" integer NOT NULL, "songId" integer NOT NULL, PRIMARY KEY ("songListListId", "songId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e844c4a0c6e7f163fdf7b58f6" ON "song_list_songs_song" ("songListListId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9d3a58382a353bb0b144c82b2" ON "song_list_songs_song" ("songId") `);
        await queryRunner.query(`CREATE TABLE "temporary_song_list" ("listId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100) NOT NULL, "userId" varchar NOT NULL, CONSTRAINT "FK_c1ace847e2df0fe1223b0b4fe5e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_song_list"("listId", "name", "userId") SELECT "listId", "name", "userId" FROM "song_list"`);
        await queryRunner.query(`DROP TABLE "song_list"`);
        await queryRunner.query(`ALTER TABLE "temporary_song_list" RENAME TO "song_list"`);
        await queryRunner.query(`DROP INDEX "IDX_1e844c4a0c6e7f163fdf7b58f6"`);
        await queryRunner.query(`DROP INDEX "IDX_e9d3a58382a353bb0b144c82b2"`);
        await queryRunner.query(`CREATE TABLE "temporary_song_list_songs_song" ("songListListId" integer NOT NULL, "songId" integer NOT NULL, CONSTRAINT "FK_1e844c4a0c6e7f163fdf7b58f6e" FOREIGN KEY ("songListListId") REFERENCES "song_list" ("listId") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_e9d3a58382a353bb0b144c82b2d" FOREIGN KEY ("songId") REFERENCES "song" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("songListListId", "songId"))`);
        await queryRunner.query(`INSERT INTO "temporary_song_list_songs_song"("songListListId", "songId") SELECT "songListListId", "songId" FROM "song_list_songs_song"`);
        await queryRunner.query(`DROP TABLE "song_list_songs_song"`);
        await queryRunner.query(`ALTER TABLE "temporary_song_list_songs_song" RENAME TO "song_list_songs_song"`);
        await queryRunner.query(`CREATE INDEX "IDX_1e844c4a0c6e7f163fdf7b58f6" ON "song_list_songs_song" ("songListListId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e9d3a58382a353bb0b144c82b2" ON "song_list_songs_song" ("songId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_e9d3a58382a353bb0b144c82b2"`);
        await queryRunner.query(`DROP INDEX "IDX_1e844c4a0c6e7f163fdf7b58f6"`);
        await queryRunner.query(`ALTER TABLE "song_list_songs_song" RENAME TO "temporary_song_list_songs_song"`);
        await queryRunner.query(`CREATE TABLE "song_list_songs_song" ("songListListId" integer NOT NULL, "songId" integer NOT NULL, PRIMARY KEY ("songListListId", "songId"))`);
        await queryRunner.query(`INSERT INTO "song_list_songs_song"("songListListId", "songId") SELECT "songListListId", "songId" FROM "temporary_song_list_songs_song"`);
        await queryRunner.query(`DROP TABLE "temporary_song_list_songs_song"`);
        await queryRunner.query(`CREATE INDEX "IDX_e9d3a58382a353bb0b144c82b2" ON "song_list_songs_song" ("songId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1e844c4a0c6e7f163fdf7b58f6" ON "song_list_songs_song" ("songListListId") `);
        await queryRunner.query(`ALTER TABLE "song_list" RENAME TO "temporary_song_list"`);
        await queryRunner.query(`CREATE TABLE "song_list" ("listId" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(100) NOT NULL, "userId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "song_list"("listId", "name", "userId") SELECT "listId", "name", "userId" FROM "temporary_song_list"`);
        await queryRunner.query(`DROP TABLE "temporary_song_list"`);
        await queryRunner.query(`DROP INDEX "IDX_e9d3a58382a353bb0b144c82b2"`);
        await queryRunner.query(`DROP INDEX "IDX_1e844c4a0c6e7f163fdf7b58f6"`);
        await queryRunner.query(`DROP TABLE "song_list_songs_song"`);
        await queryRunner.query(`DROP TABLE "song"`);
        await queryRunner.query(`DROP TABLE "song_list"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
