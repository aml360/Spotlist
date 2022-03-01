import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { Configuration } from '../config/config.keys';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cnfSv: ConfigService) => {
				const jwtModuleOptions: JwtModuleOptions = {
					secret: cnfSv.get(Configuration.JWT_SECRET),
					signOptions: {
						expiresIn: parseInt(cnfSv.get(Configuration.JWT_EXPIRETIME)),
					},
				};
				return jwtModuleOptions;
			},
		}),
	],
	providers: [JwtModule],
	exports: [JwtModule],
})
export class JwtSharedModule {}
