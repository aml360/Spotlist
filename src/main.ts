import { NestFactory } from '@nestjs/core';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { load as loadYaml } from 'js-yaml';
import { readFileSync } from 'fs';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const options = loadYaml(
		readFileSync(__dirname + '/../doc/swagger.yaml', 'utf8'),
	) as Omit<OpenAPIObject, 'paths'>;
	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('api', app, document);

	await app.listen(3000);
}
bootstrap();
