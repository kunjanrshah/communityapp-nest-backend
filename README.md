<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Connect pgadmin4 using docker

To add a `pgAdmin` container to your `docker-compose.yml` file, follow these steps:

---

### **Step 1: Update `docker-compose.yml`**

Add a new service for `pgAdmin` alongside your existing PostgreSQL configuration. Here’s an example:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: your_database
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin_password
    ports:
      - '8080:80'
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

### **Step 2: Start the Services**

Run the following command to start both the PostgreSQL and pgAdmin services:

```bash
docker-compose up -d
```

---

### **Step 3: Access pgAdmin**

1. Open your web browser and navigate to `http://localhost:8080`.
2. Log in using the credentials provided in the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` environment variables from your `docker-compose.yml` file.

---

### **Step 4: Connect pgAdmin to PostgreSQL**

1. Once logged in, click on "Add New Server."
2. Enter the following details:
   - **Name**: Any name for your server (e.g., `Postgres`).
3. Go to the **Connection** tab and provide:

   - **Host**: `postgres` (this should match the service name in your `docker-compose.yml` file).
   - **Port**: `5432`.
   - **Username**: `POSTGRES_USER` from the `postgres` service environment variables (e.g., `postgres`).
   - **Password**: `POSTGRES_PASSWORD` from the `postgres` service environment variables (e.g., `your_password`).

4. Save the configuration. You should now see the PostgreSQL database in the pgAdmin interface.

---

### **Additional Notes**

- Make sure `postgres` and `pgadmin` services are on the same Docker network (default is fine when defined in the same `docker-compose.yml`).
- Replace `your_password` and `your_database` with your desired credentials and database name.

This setup should allow you to manage your PostgreSQL database with pgAdmin!

---

## Push Notifications (Firebase Cloud Messaging / FCM)

The backend sends push notifications (e.g. _"Please approve X's Request"_ to
ADMIN users when a new member registers) through Firebase Cloud Messaging using
the **Firebase Admin SDK**.

### How delivery works (why ngrok is NOT needed)

```
Android app  --GraphQL (via ngrok/localhost)-->  Nest backend
Nest backend --FCM HTTP v1 API (outbound)----->  Google FCM servers  -->  Android device
```

- The backend talks to Google's FCM servers over the **public internet**
  (outbound request). It does **not** need to be reachable from the internet.
- The device receives the push over its **own** internet connection.
- ngrok is only used so the Android app can reach your `localhost` GraphQL API
  (register / updateDeviceToken). **It has nothing to do with the push itself.**

### Backend configuration (already wired in code)

1. `public/firebase-service-account.json` — the Firebase **service account key**
   for the project `communityapp-1341c`. Keep it out of public version control.
2. `FirebaseModule` (`src/firebase/firebase.module.ts`) provides & exports
   `FirebaseService`, which initialises `firebase-admin` and sends messages.
3. Optional env var (only if the Android app creates a specific channel):

   ```
   FCM_ANDROID_CHANNEL_ID=default
   ```

### Android app configuration (required — otherwise no notification appears)

1. Go to the [Firebase Console](https://console.firebase.google.com/) →
   project **communityapp-1341c** → **Project settings** → **Your apps**.
2. Add an **Android app** whose **package name exactly matches** the Android
   project's `applicationId` (e.g. `com.example.communityapp`).
3. Download **`google-services.json`** and place it in the Android app module
   folder (`android/app/google-services.json`).
4. In `android/build.gradle` add the Google services classpath, and in
   `android/app/build.gradle` apply the plugin + FCM dependency:

   ```gradle
   // android/build.gradle
   classpath 'com.google.gms:google-services:4.4.2'

   // android/app/build.gradle
   apply plugin: 'com.google.gms.google-services'
   dependencies {
     implementation platform('com.google.firebase:firebase-bom:33.5.1')
     implementation 'com.google.firebase:firebase-messaging'
   }
   ```

5. In the app, obtain the **FCM registration token**
   (`FirebaseMessaging.getInstance().getToken()`) and send it to the backend by
   calling the `updateDeviceToken` mutation with the token in the
   **`device-token` HTTP header** (see `src/core/middleware/device-token.middleware.ts`).
   The backend stores it in the `tkn_devices` table (`types = 1` for Android).
6. **Android 13+ (API 33+)**: request the runtime permission
   `POST_NOTIFICATIONS` before relying on notifications.
7. **Android 8+ (Oreo)**: create a notification channel and, if you set
   `FCM_ANDROID_CHANNEL_ID`, create a channel with that exact id.

### Common reasons a push doesn't arrive

| Symptom                                                    | Likely cause                                                                                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tkn_devices` has no row for the admin/sub-admin users     | The admin users must **log in to the Android app** and call `updateDeviceToken` **before** a new registration happens.                                |
| Backend log: `No admin device tokens found`                | Same as above — no stored tokens for the target admins.                                                                                               |
| Backend log: `messaging/registration-token-not-registered` | The token is stale (app reinstall / cleared data). Re-login on the device to refresh it.                                                              |
| Backend log: `messaging/mismatched-credential`             | `google-services.json` in the Android app is from a **different** Firebase project than the backend's `firebase-service-account.json`.                |
| `google-services.json` package name mismatch               | The Android `applicationId` must match the package registered in Firebase.                                                                            |
| App in foreground shows nothing                            | FCM does not auto-display notifications in the foreground; handle it in `onMessageReceived` (or use a `notification` payload for background display). |
