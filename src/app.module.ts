import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
	imports: [UsersModule, DatabaseModule, AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

/**
 * App module without the database module.
 * Use only for testing
 */
@Module({
	imports: [UsersModule, AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppTestingModule {}
