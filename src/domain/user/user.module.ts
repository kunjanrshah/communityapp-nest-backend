import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusChangeService } from './status-change.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [],
  providers: [UserResolver, UserService, PrismaService, StatusChangeService],
  exports: [],
})
export class UserModule {}
