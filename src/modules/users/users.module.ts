import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongRepository } from 'src/repository';
import { UserRepository } from 'src/repository/user.repository';
import { JwtSharedModule } from '../jwt/jwt.module';
import { SongListModule } from '../songlists/songlist.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository, SongRepository]), SongListModule, JwtSharedModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
