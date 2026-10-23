import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { DomainModule } from './domain/domain.module';
import dbConfig from './config/database';
import { NotificationService } from './notification/notification.service';
import { NotificationResolver } from './notification/notification.resolver';
import { FirebaseModule } from './firebase/firebase.module';

// Use NODE_ENV to load appropriate file
// NODE_ENV=dev npm run start:dev
// NODE_ENV=prod npm run start:prod
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available globally
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env' : `.env.${process.env.NODE_ENV || 'dev'}`,
      load: [dbConfig],
    }),
    DomainModule,
    AuthModule,
    FirebaseModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      debug: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      // uploads: {
      //   maxFileSize: 10_000_000,
      //   maxFiles: 5,
      // },
      csrfPrevention: false,
      context: ({ req }) => ({ req }),
      formatError: (error) => {
        // For HttpExceptions (like BadRequestException), return only the
        // original error payload: { message, error, statusCode }
        const originalError = error.extensions?.originalError;
        if (originalError && typeof originalError === 'object') {
          return originalError as Record<string, unknown>;
        }

        // Fallback for other errors (GraphQL validation, internal, etc.)
        return {
          message: error.message,
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, NotificationService, NotificationResolver],
})
export class AppModule {}
