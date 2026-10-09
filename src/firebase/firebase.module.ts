import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

/**
 * Provides (and exports) the Firebase Admin messaging wrapper so any feature
 * module — e.g. `UserModule`'s StatusChange flow — can send push notifications.
 */
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
