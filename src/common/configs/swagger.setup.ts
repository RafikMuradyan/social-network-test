import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Social Network App')
    .setDescription('API description')
    .addBearerAuth();

  if (process.env.API_VERSION) {
    documentBuilder.setVersion(process.env.API_VERSION);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  SwaggerModule.setup('documentation', app, document);
}
