import { Injectable, Logger } from '@nestjs/common';
import { StatusChangeInputDto } from './dto/status-change-input.dto';
import { StatusChangeResponseDto } from './dto/model/status-change-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as bcrypt from 'bcryptjs';

/** Fields the legacy controller wrote to the `users` table. */
interface UpdateUserData {
  password?: string;
  relation_id?: number;
  head_id?: number;
}

@Injectable()
export class StatusChangeService {
  private readonly logger = new Logger(StatusChangeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * GraphQL port of the legacy REST `StatusChange` endpoint
   * (`application/controllers/API/StatusChange.php`):
   *
   * 1. Flips `users.status` for every id in `idList`.
   * 2. `extra_info = 1` copies the optional password / relation_id / head_id
   *    onto the selected users and their family members.
   *    `extra_info = 2` moves a user (and their members) under a new family head.
   * 3. Pushes the "account approval" notification to the approved users.
   */
  async statusChange(
    data: StatusChangeInputDto,
    actorId?: number,
  ): Promise<StatusChangeResponseDto> {
    const { idList, status, extra_info, password, relation_id, head_id, id } = data;

    // Legacy `idList` is a comma separated string of user ids.
    const idArray = idList
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);

    if (idArray.length === 0) {
      return { success: false, message: 'Data not found' };
    }

    // 1. Update the status of every requested user.
    await this.prisma.user.updateMany({
      where: { id: { in: idArray } },
      data: { status: Boolean(status) },
    });

    // 2. Apply the optional extra information.
    const updateData: UpdateUserData = {};
    if (password) updateData.password = await this.hashPassword(password);
    if (relation_id) updateData.relation_id = relation_id;
    if (head_id) updateData.head_id = head_id;

    const hasUpdateData = Object.keys(updateData).length > 0;

    if (hasUpdateData && extra_info === 1) {
      await this.changeUsersToFamilyMembers(idArray, updateData);
    } else if (hasUpdateData && extra_info === 2) {
      await this.changeFamilyHead(id, head_id, updateData);
    }

    // 3. Notify the approved users (legacy sends only on approval).
    await this.sendApprovalNotification(idArray, status, id ?? actorId);

    return { success: true, message: 'Status changed successfully' };
  }

  /**
   * Mirrors the legacy `extra_info = 1` block: for each selected user that is
   * itself a family head (`head_id === 0`) the same update data is written to
   * all of their family members, then to the user.
   */
  private async changeUsersToFamilyMembers(
    idList: number[],
    updateData: UpdateUserData,
  ): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: idList } },
      select: { id: true, head_id: true },
    });

    for (const user of users) {
      if (user.head_id === 0) {
        // Change requested family members to the login user's members.
        await this.prisma.user.updateMany({
          where: { head_id: user.id },
          data: updateData,
        });
      }

      // Change the family head / user itself.
      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  }

  /**
   * Mirrors the legacy `extra_info = 2` block: the user `userId` (and every
   * member pointing at them) is moved under the new `headId`, which in turn
   * becomes a family head (main user) itself.
   */
  private async changeFamilyHead(
    userId: number | undefined,
    headId: number | undefined,
    updateData: UpdateUserData,
  ): Promise<void> {
    if (!userId || !headId) {
      this.logger.warn('extra_info=2 requires both `id` and `head_id` — skipping');
      return;
    }

    // The new head becomes a main user (head_id = 0, relation_id = 1).
    const mainUserData: UpdateUserData = { head_id: 0, relation_id: 1 };
    if (updateData.password) mainUserData.password = updateData.password;

    await this.prisma.user.update({
      where: { id: headId },
      data: mainUserData,
    });

    // Move the user's members and the user itself under the new head.
    await this.prisma.user.updateMany({
      where: { head_id: userId },
      data: { head_id: headId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { head_id: headId },
    });
  }

  /**
   * Legacy behaviour: read every device token of the users whose status is
   * being changed and push the approval message to them.
   */
  private async sendApprovalNotification(
    idList: number[],
    status: number,
    actorId?: number,
  ): Promise<void> {
    // The legacy approval message only makes sense when the account is approved.
    if (!status) {
      return;
    }

    const deviceTokens = await this.prisma.tkn_devices.findMany({
      where: { user_id: { in: idList } },
      select: { tokens: true },
    });

    const tokens = deviceTokens.map((device) => device.tokens);

    if (tokens.length === 0) {
      this.logger.warn('No device tokens found for the approved users — push skipped');
      return;
    }

    const textMsg = 'Your request for account approval is approved.';

    await this.firebaseService.sendNotificationToTokens(tokens, 'Request Approved', textMsg, {
      user_id: String(actorId ?? idList[0]),
      message: textMsg,
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
