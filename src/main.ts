import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DeviceTokenMiddleware } from './core/middleware/device-token.middleware';
import { graphqlUploadExpress } from 'graphql-upload';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as ngrok from '@ngrok/ngrok';
import * as dotenv from 'dotenv';

// Load environment variables from the appropriate .env.* file BEFORE anything
// else runs, so the ngrok constants below pick up NGROK_AUTHTOKEN etc. early.
// ConfigModule also loads this file during bootstrap; dotenv.config() does not
// override variables that are already set in the process environment.
// Use .env for production, .env.dev for development (default)
const envFile = process.env.NODE_ENV === 'prod' ? '.env' : `.env.${process.env.NODE_ENV || 'dev'}`;
dotenv.config({ path: join(process.cwd(), envFile) });

const PORT = Number(process.env.PORT) || 3000;
const NGROK_ENABLED = (process.env.NGROK_ENABLED || 'false').toLowerCase() === 'true';
const NGROK_DOMAIN = process.env.NGROK_DOMAIN || '';
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN || '';

// Small helper that sleeps for the given number of milliseconds.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function forwardToApp() {
  // The static ngrok-free domain (NGROK_DOMAIN) can only be held by ONE live
  // session at a time. On a restart (nodemon --watch, container recreate) the
  // previous ngrok session/agent may still be alive in this process or not yet
  // released by ngrok's cloud, so ngrok reports ERR_NGROK_334 ("endpoint is
  // already online"). Tear down any existing listeners first, and never crash
  // the app if ngrok is unavailable.
  try {
    await ngrok.kill();
  } catch {
    /* no existing listeners to close */
  }

  // Extend ngrok's Config with the endpoint-pooling option used below (the
  // underlying NAPI type does not declare it explicitly).
  interface NgrokForwardConfig extends ngrok.Config {
    pooling_enabled?: boolean;
  }

  const forwardConfig: NgrokForwardConfig = {
    addr: `localhost:${PORT}`,
    // Enable endpoint pooling so multiple ngrok agents can share the same
    // static domain (the equivalent of the `--pooling-enabled` flag in the
    // terminal agent). Without it, a static ngrok-free.dev domain that is
    // already online somewhere fails with ERR_NGROK_334.
    pooling_enabled: true,
    // Prefer the explicit token from .env; fall back to the NGROK_AUTHTOKEN
    // environment variable / ngrok config if it is not set.
    ...(NGROK_AUTHTOKEN ? { authtoken: NGROK_AUTHTOKEN } : { authtoken_from_env: true }),
    ...(NGROK_DOMAIN ? { domain: NGROK_DOMAIN } : {}),
  };

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const forwarder = await ngrok.forward(forwardConfig);
      console.log(`ngrok available at: ${forwarder.url()}`);
      return;
    } catch (error) {
      // ERR_NGROK_334 = the endpoint is still online (usually a recently
      // restarted session whose socket has not yet been released). Wait briefly
      // and retry a couple of times before giving up — but never crash.
      const err = error as { errorCode?: string; code?: string; message?: string };
      const code = err?.errorCode || err?.code;
      console.warn(
        `[ngrok] attempt ${attempt}/${MAX_ATTEMPTS} failed (${code ?? 'unknown error'}): ${
          err?.message || error
        }`,
      );
      if (code === 'ERR_NGROK_334' && attempt < MAX_ATTEMPTS) {
        await sleep(5000 * attempt); // 5s, 10s before retrying
        continue;
      }
      break;
    }
  }
  console.warn('[ngrok] could not start the ngrok tunnel; continuing without it.');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //app.useGlobalFilters(new GraphQLExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(new DeviceTokenMiddleware().use);

  // This line is required for file upload
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 5 }));
  // Serve files from /public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // app.enableCors({
  //   origin: '*', // or specify IP-based origin like "http://192.168.1.50"
  // });

  await app.listen(PORT, '0.0.0.0');

  // Optionally expose the local server via ngrok (set NGROK_ENABLED=true)
  if (NGROK_ENABLED) {
    await forwardToApp();
  }
}
bootstrap();
