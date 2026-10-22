import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpsertUserInput } from './dto/user.upsert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ChangeRoleInput } from './dto/change-role.dto';
import { GetInactiveUsersInput } from './dto/get-inactive-users.dto';
import { GetInactiveUsersResponse } from './dto/model/get-inactive-users.response';
import { GetContactListInput } from './dto/get-contact-list.input';
import { GetContactListResponse } from './dto/model/get-contact-list.response';
import { SearchByCityInput } from './dto/search-by-city.input';
import { SearchByCityResponse } from './dto/model/search-by-city.response';
import { Prisma } from '@prisma/client';
import {
  GetUserActivityStatusInput,
  GetUserActivityStatusResponse,
  UserActivityStatusDTO,
} from './dto/activity-status.dto';
import { GetUsersByDateInput, GetUsersByDateResponse } from './dto/user.by-date.dto';
import { GetFamilyMembersResponse } from './dto/model/get-family-members.response';
import { SearchCommitteeUsersInput } from './dto/search-committee-users.input';
import { SearchCommitteeUsersResponse } from './dto/model/search-committee-users.response';
import { InnerLoginInput } from './dto/inner-login.input';
import { InnerLogoutInput } from './dto/inner-logout.input';

/**
 * Loosely typed view of a Prisma user row together with its eagerly loaded
 * relation masters. `GetFamilyMembers`, `GetUserProfile` and
 * `SearchCommitteeUsers` flatten these nested names onto the row (legacy
 * `getMembers()` behaviour), so the helpers below only need `name` lookups on a
 * handful of relations. Any other column stays reachable through the index
 * signature.
 */
type UserRowWithRelations = {
  name?: string | null;
  city?: UserRowWithRelations | null;
  states?: UserRowWithRelations | null;
  subCommunity?: UserRowWithRelations | null;
  localCommunity?: UserRowWithRelations | null;
  subCast?: UserRowWithRelations | null;
  relation?: UserRowWithRelations | null;
  education?: UserRowWithRelations | null;
  occupation?: UserRowWithRelations | null;
  designation?: UserRowWithRelations | null;
  committee?: UserRowWithRelations | null;
  businessCategory?: UserRowWithRelations | null;
  current_activity?: UserRowWithRelations | null;
  gotra?: UserRowWithRelations | null;
  native_place?: UserRowWithRelations | null;
  userAddress?: UserRowWithRelations | null;
  userWorkDetail?: UserRowWithRelations | null;
  userPersonalDetail?: UserRowWithRelations | null;
  userMatrimony?: UserRowWithRelations | null;
  last_login?: Date | string | null;
  login_status?: boolean | number | null;
  [key: string]: unknown;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deleted) {
      throw new BadRequestException('User not found');
    }

    // Current password may be the original one OR a temporary password issued
    // by the forgotPassword flow. Both are stored as the same bcrypt hash
    // (rounds = 10 everywhere), so a single compare keeps the two APIs in sync.
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Prevent the user from "changing" back to the very same password.
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      throw new BadRequestException('New password must be different from the current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // Keep in sync with the forgot/reset flow: any pending reset token is
        // invalidated as soon as the user changes the password themselves.
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async upsertUser(data: UpsertUserInput) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;

        const formatISTDate = (date: Date) => {
          const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
          return new Date(date.getTime() + istOffset).toISOString();
        };

        // Remove undefined values dynamically
        const userUpdateData = Object.fromEntries(
          Object.entries({
            role: data.role,
            email: data.email,
            mobile: data.mobile,
            password: hashedPassword,
            head_id: data.head_id,
            member_code: data.member_code,
            relation_id: data.relation_id,
            sub_community_id: data.sub_community_id,
            local_community_id: data.local_community_id,
            first_name: data.first_name,
            last_name_id: data.last_name_id,
            father_name: data.father_name,
            mother_name: data.mother_name,
            status: data.status,
            gender: data.gender,
            phone: data.phone,
            profile_pic: data.profile_pic,
            region: data.region,
            is_expired: data.is_expired,
            expire_date: data.expire_date,
            education_id: data.education_id,
            occupation_id: data.occupation_id,
            deleted: data.deleted,
            login_status: data.login_status,
            last_login: formatISTDate(new Date()),
            profile_percent: data.profile_percent,
          }).filter(([, v]) => v !== undefined),
        );

        const userCreateData = {
          role: data.role ?? 'USER',
          email: data.email ?? null,
          mobile: data.mobile ?? null,
          password: hashedPassword ?? 'defaultPassword',
          head_id: data.head_id ?? 0,
          member_code: data.member_code ?? null,
          relation_id: data.relation_id ?? null,
          sub_community_id: data.sub_community_id ?? 0,
          local_community_id: data.local_community_id ?? 0,
          first_name: data.first_name ?? 'Unknown',
          last_name_id: data.last_name_id ?? 0,
          father_name: data.father_name ?? null,
          mother_name: data.mother_name ?? null,
          status: data.status ?? true,
          gender: data.gender ?? false,
          phone: data.phone ?? null,
          profile_pic: data.profile_pic ?? 'noimage.png',
          region: data.region ?? null,
          is_expired: data.is_expired ?? false,
          expire_date: data.expire_date ?? null,
          education_id: data.education_id ?? null,
          occupation_id: data.occupation_id ?? null,
          deleted: data.deleted ?? false,
          login_status: data.login_status ?? null,
          last_login: formatISTDate(new Date()),
          profile_percent: data.profile_percent ?? 5,
        };

        // Upsert User
        const user = await prisma.user.upsert({
          where: { id: data.user_id ?? -1 },
          update: userUpdateData,
          create: userCreateData,
        });

        // Upsert Address
        if (data.city_id || data.states_id || data.address) {
          const addressUpdateData = Object.fromEntries(
            Object.entries({
              city_id: data.city_id,
              states_id: data.states_id,
              addr_type: data.addr_type,
              address: data.address,
              area: data.area,
              pincode: data.pincode,
              local_address: data.local_address,
              mosaad_id: data.mosaad_id,
            }).filter(([, v]) => v !== undefined),
          );

          await prisma.userAddress.upsert({
            where: { user_id: user.id },
            update: addressUpdateData,
            create: {
              city_id: data.city_id!,
              states_id: data.states_id!,
              addr_type: data.addr_type ?? 'OWN',
              address: data.address!,
              area: data.area ?? null,
              pincode: data.pincode ?? null,
              local_address: data.local_address ?? null,
              mosaad_id: data.mosaad_id ?? null,
              user_id: user.id,
            },
          });
        }

        // **Upsert User Work Details**
        if (data.business_category_id || data.company_name) {
          const workUpdateData = Object.fromEntries(
            Object.entries({
              business_category_id: data.business_category_id,
              business_address: data.business_address,
              business_logo: data.business_logo,
              company_name: data.company_name,
              website: data.website,
              work_details: data.work_details,
            }).filter(([, v]) => v !== undefined),
          );

          await prisma.userWorkDetail.upsert({
            where: { user_id: user.id },
            update: workUpdateData,
            create: {
              user_id: user.id,
              business_category_id: data.business_category_id ?? null,
              business_address: data.business_address ?? null,
              business_logo: data.business_logo ?? null,
              company_name: data.company_name ?? null,
              website: data.website ?? null,
              work_details: data.work_details ?? null,
            },
          });
        }

        // **Upsert User Matrimony Details**
        if (data.hobby || data.birth_time) {
          const matrimonyUpdateData = Object.fromEntries(
            Object.entries({
              birth_time: data.birth_time,
              birth_place_id: data.birth_place_id,
              hobby: data.hobby,
              about_me: data.about_me,
              weight: data.weight,
              height: data.height,
              is_spect: data.is_spect,
              is_mangal: data.is_mangal,
              is_shani: data.is_shani,
              facebook_profile: data.facebook_profile,
              expectation: data.expectation,
            }).filter(([, v]) => v !== undefined),
          );

          await prisma.userMatrimony.upsert({
            where: { user_id: user.id },
            update: matrimonyUpdateData,
            create: {
              user_id: user.id,
              birth_time: data.birth_time ?? null,
              birth_place_id: data.birth_place_id ?? null,
              hobby: data.hobby!,
              about_me: data.about_me ?? null,
              weight: data.weight ?? null,
              height: data.height ?? null,
              is_spect: data.is_spect ?? false,
              is_mangal: data.is_mangal ?? false,
              is_shani: data.is_shani ?? false,
              facebook_profile: data.facebook_profile ?? null,
              expectation: data.expectation ?? null,
            },
          });
        }

        // Upsert UserPersonalDetail
        if (data.is_donor || data.birth_date || data.blood_group) {
          const personalDetailUpdateData = Object.fromEntries(
            Object.entries({
              is_donor: data.is_donor,
              matrimony: data.matrimony,
              birth_date: data.birth_date,
              native_place_id: data.native_place_id,
              blood_group: data.blood_group,
              current_activity_id: data.current_activity_id,
              marital_status: data.marital_status,
              marriage_date: data.marriage_date,
              gotra_id: data.gotra_id,
            }).filter(([, v]) => v !== undefined),
          );

          await prisma.userPersonalDetail.upsert({
            where: { user_id: user.id },
            update: personalDetailUpdateData,
            create: {
              user_id: user.id,
              is_donor: data.is_donor ?? false,
              matrimony: data.matrimony ?? false,
              birth_date: data.birth_date ?? null,
              native_place_id: data.native_place_id ?? null,
              blood_group: data.blood_group ?? null,
              current_activity_id: data.current_activity_id ?? null,
              marital_status: data.marital_status ?? null,
              marriage_date: data.marriage_date ?? null,
              gotra_id: data.gotra_id ?? null,
            },
          });
        }

        // Fetch updated user with related data
        return prisma.user.findUnique({
          where: { id: user.id },
          include: {
            userAddress: true,
            userPersonalDetail: true,
            userWorkDetail: true,
            userMatrimony: true,
          },
        });
      });
    } catch (error) {
      throw new BadRequestException('Error upserting user: ' + error.message);
    }
  }

  async updateLastLogin(user_id: number): Promise<boolean> {
    try {
      // Get the current UTC time
      const now = new Date();

      // Convert UTC to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const istDate = new Date(now.getTime() + istOffset);

      // Update last_login field for the user
      const updatedUser = await this.prisma.user.update({
        where: { id: user_id },
        data: { last_login: istDate },
      });

      return !!updatedUser;
    } catch (error) {
      throw new BadRequestException('Error updating last login: ' + error.message);
    }
  }

  /**
   * Mirrors the legacy REST "GetUserActivityStatus" endpoint:
   *  - updates the given user's last_login to the current IST timestamp
   *  - returns online status for the user and, if present, all members
   *    sharing the same head_id.
   *
   * Online logic (from PHP):
   *  - a user is considered online when login_status is true AND last_login
   *    falls within the last 3.5 minutes (currentTime = now - 3.5min).
   */
  async getUserActivityStatus(
    input: GetUserActivityStatusInput,
  ): Promise<GetUserActivityStatusResponse> {
    const { id } = input;

    if (!id) {
      return { success: false, message: 'Not User found', data: null };
    }

    // Existence check BEFORE any update so unknown ids return the
    // contract fail payload instead of a Prisma P2025 error.
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, message: 'Not User found', data: null };
    }

    const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30
    const now = new Date();
    const istDate = new Date(now.getTime() + istOffset);

    // Update the user's last_login timestamp to the current IST time.
    await this.prisma.user.update({
      where: { id },
      data: { last_login: istDate },
    });

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, last_login: true, login_status: true, head_id: true },
    });

    if (!user) {
      return { success: false, message: 'Not User found', data: null };
    }

    // Fetch the user plus all members that share the same head.
    const headId = user.head_id === 0 ? user.id : user.head_id;
    const relatedUsers = await this.prisma.user.findMany({
      where: {
        OR: [{ id }, { head_id: headId }],
      },
      select: { id: true, last_login: true, login_status: true },
    });

    const currentTime = now.getTime() - 60 * 3.5 * 1000; // now minus 3.5 minutes

    const data: UserActivityStatusDTO[] = relatedUsers.map((u) => {
      const lastLogin = u.last_login ? u.last_login.getTime() : 0;
      let online = 0;
      if (currentTime <= lastLogin && u.login_status) {
        online = 1;
      }
      return {
        id: u.id,
        login_status: u.login_status,
        last_login: u.last_login,
        online_status: online,
      };
    });

    return { success: true, message: 'Users online updated', data };
  }

  /**
   * Family list that mirrors the legacy CodeIgniter "GetFamilyMembers" REST
   * endpoint (API_model::getMembers + GetFamilyMembers controller).
   *
   * Legacy behaviour replicated here:
   *  - returns everyone with `head_id = $head_id` PLUS the head user itself
   *  - each member is enriched with joined master names (city, state,
   *    sub_community, local_community, last_name/surname, relation,
   *    designation, committee, education, occupation, current_activity,
   *    gotra, native, business_category, mossad)
   *  - `profile_completed` % based on mandatory profile keys
   *  - `online_status` 0/1 using the same 3.5 minute window as the legacy app
   *  - members are ordered HEAD first, then the WIFE, then the rest
   *  - envelope `{ success, total_records, members }`
   *  - when an optional `loginUserId` is supplied, the legacy endpoint also
   *    refreshed that user's `last_login` timestamp
   */
  async getFamilyMembers(head_id: number, loginUserId?: number): Promise<GetFamilyMembersResponse> {
    if (loginUserId) {
      try {
        await this.prisma.user.update({
          where: { id: loginUserId },
          data: { last_login: new Date() },
        });
      } catch {
        /* non-fatal: keep returning the list even if the login stamp fails */
      }
    }

    const users = await this.prisma.user.findMany({
      where: { OR: [{ head_id }, { id: head_id }] },
      include: this.familyInclude,
      orderBy: { id: 'asc' },
    });

    const enriched = users.map((user) => this.enrichFamilyMember(user, users));
    const ordered = this.orderFamilyMembers(enriched);

    return {
      success: true,
      total_records: ordered.length,
      members: ordered as unknown as GetFamilyMembersResponse['members'],
    };
  }

  /**
   * Mirrors the legacy "GetUserProfile" REST endpoint (single user row by id).
   */
  async getUserProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.familyInclude,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.enrichFamilyMember(user, [user]);
  }

  /**
   * Mirrors the legacy "InnerLogin" REST endpoint. Instead of the legacy
   * plain-text `profile_password` column (which no longer exists) the new
   * schema stores a bcrypt hash in `user.password`, so we compare against it.
   * On success, `last_login` is refreshed and `login_status` is set to true.
   */
  async innerLogin(input: InnerLoginInput) {
    const user = await this.prisma.user.findUnique({ where: { id: input.id } });

    if (!user || user.deleted) {
      throw new UnauthorizedException('Invalid user');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const now = new Date();
    if (!user.login_status) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { last_login: now, login_status: true },
      });
      return { success: true, message: 'Login successful', id: user.id };
    }

    // Legacy behaviour: an already-logged-in profile returned a special message.
    return { success: false, message: 'Already logged in', id: user.id };
  }

  /**
   * Mirrors the legacy "InnerLogout" REST endpoint: sets `login_status` to
   * false and refreshes `last_login`.
   */
  async innerLogout(input: InnerLogoutInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: input.id },
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.user.update({
      where: { id: input.id },
      data: { last_login: new Date(), login_status: false },
    });

    return { success: true, message: 'Logout successful', id: input.id };
  }

  /**
   * Mirrors the legacy "SearchCommitteeUsers" REST endpoint. Returns active
   * users who belong to a committee (have a `userWorkDetail` row with a
   * committee / designation), optionally narrowed by committee, designation
   * and free-text `filterBy`, with paging via start/length.
   */
  async searchCommitteeUsers(
    input: SearchCommitteeUsersInput,
  ): Promise<SearchCommitteeUsersResponse> {
    const {
      start = 0,
      length = 25,
      filterBy,
      committeeId,
      designationId,
      filter_by: filterByRest,
    } = input;

    if (
      filterByRest?.start_date &&
      filterByRest?.end_date &&
      filterByRest.start_date > filterByRest.end_date
    ) {
      throw new BadRequestException('start_date must be earlier than or equal to end_date');
    }

    const where = this.buildCommitteeUsersWhere({
      filterBy,
      firstName: filterByRest?.str_search,
      committeeId: filterByRest?.committee_id ?? committeeId,
      designationId: filterByRest?.designation_id ?? designationId,
      localCommunityId: filterByRest?.local_community_id,
      subCommunityId: filterByRest?.sub_community_id,
      startDate: filterByRest?.start_date,
      endDate: filterByRest?.end_date,
    });

    const totalRecords = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      skip: length === -1 ? 0 : Math.max(0, start),
      take: length === -1 ? 25 : Math.max(1, length),
      include: this.familyInclude,
      orderBy: { id: 'desc' }, // legacy data-table order: id DESC
    });

    const enriched = users.map((user) => this.enrichFamilyMember(user, users));

    return {
      success: users.length > 0,
      message: users.length > 0 ? 'Data Retrieved Successfully' : 'No user data found',
      total_records: totalRecords,
      members: enriched as unknown as SearchCommitteeUsersResponse['members'],
    };
  }

  private buildCommitteeUsersWhere(
    filters: {
      filterBy?: string;
      firstName?: string;
      committeeId?: number;
      designationId?: number;
      localCommunityId?: number;
      subCommunityId?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Prisma.UserWhereInput {
    const {
      filterBy,
      firstName,
      committeeId,
      designationId,
      localCommunityId,
      subCommunityId,
      startDate,
      endDate,
    } = filters;
    const startDateBoundary = startDate ? new Date(`${startDate}-01T00:00:00.000Z`) : undefined;
    const endDateExclusive = endDate
      ? (() => {
        const [year, month] = endDate.split('-').map(Number);
        return new Date(Date.UTC(year, month, 1));
      })()
      : undefined;

    const where: Prisma.UserWhereInput = {
      status: true,
      deleted: false,
      ...(localCommunityId && { local_community_id: localCommunityId }),
      ...(subCommunityId && { sub_community_id: subCommunityId }),
      userWorkDetail: {
        is: {
          ...(committeeId && { committee_id: committeeId }),
          ...(designationId && { designation_id: designationId }),
          ...(startDateBoundary && { start_date: { gte: startDateBoundary } }),
          ...(endDateExclusive && { end_date: { lt: endDateExclusive } }),
          ...(!committeeId && !designationId && {
            OR: [{ committee_id: { not: null } }, { designation_id: { not: null } }],
          }),
        },
      },
    };

    if (firstName) {
      where.first_name = { contains: firstName, mode: 'insensitive' };
    }

    if (filterBy) {
      const searchConditions: Prisma.UserWhereInput[] = [
        { member_code: { contains: filterBy, mode: 'insensitive' } },
        { first_name: { contains: filterBy, mode: 'insensitive' } },
        { subCast: { name: { contains: filterBy, mode: 'insensitive' } } },
        { mobile: { contains: filterBy, mode: 'insensitive' } },
        { email: { contains: filterBy, mode: 'insensitive' } },
        { userAddress: { area: { contains: filterBy, mode: 'insensitive' } } },
        { userAddress: { city: { name: { contains: filterBy, mode: 'insensitive' } } } },
        { userAddress: { states: { name: { contains: filterBy, mode: 'insensitive' } } } },
      ];

      if (/^\d+$/.test(filterBy)) {
        searchConditions.push({ id: Number(filterBy) });
      }
      if (Object.values(Role).includes(filterBy as Role)) {
        searchConditions.push({ role: filterBy as Role });
      }

      where.OR = searchConditions;
    }

    return where;
  }

  /**
   * Shared Prisma include that loads every relation the legacy queries used to
   * JOIN in order to flatten master names on each user row.
   */
  private familyInclude = {
    userAddress: { include: { city: true, states: true } },
    userMatrimony: true,
    userPersonalDetail: {
      include: { current_activity: true, gotra: true, native_place: true },
    },
    userWorkDetail: {
      include: { designation: true, committee: true, businessCategory: true },
    },
    subCast: true,
    occupation: true,
    education: true,
    relation: true,
    subCommunity: true,
    localCommunity: true,
  } as const;

  /**
   * Flattens the related master names onto the user row exactly like the
   * legacy `getMembers()` SELECT did.
   */
  private enrichFamilyMember<T extends { id: number; head_id?: number | null }>(
    user: T,
    family: Array<{ id: number; first_name?: string | null }>,
  ) {
    const u: Record<string, unknown> = { ...user };
    const row = user as UserRowWithRelations;

    u.city = row.userAddress?.city?.name ?? '';
    u.state = row.userAddress?.states?.name ?? '';
    u.sub_community = row.subCommunity?.name ?? '';
    u.local_community = row.localCommunity?.name ?? '';
    u.last_name = row.subCast?.name ?? '';
    u.relation = row.relation?.name ?? '';
    u.relation_name = row.relation?.name ?? '';
    u.designation = row.userWorkDetail?.designation?.name ?? '';
    u.designation_id = row.userWorkDetail?.designation_id ?? null;
    u.committee = row.userWorkDetail?.committee?.name ?? '';
    u.committee_id = row.userWorkDetail?.committee_id ?? null;
    u.education = row.education?.name ?? '';
    u.occupation = row.occupation?.name ?? '';
    u.current_activity = row.userPersonalDetail?.current_activity?.name ?? '';
    u.gotra = row.userPersonalDetail?.gotra?.name ?? '';
    u.native = row.userPersonalDetail?.native_place?.name ?? '';
    u.business_category = row.userWorkDetail?.businessCategory?.name ?? '';
    // No dedicated tables exist in the new schema for these two legacy masters.
    u.business_sub_category = '';
    u.mossad = '';

    // Legacy head_name: the first_name of the head this member belongs to.
    const headId = user.head_id;
    u.head_name =
      headId && headId !== 0 ? family.find((f) => f.id === headId)?.first_name ?? '' : '';

    // Legacy online detection (same 3.5 minute window as GetFamilyMembers.php).
    const lastTime = row.last_login ? new Date(row.last_login).getTime() : 0;
    const currentTime = Date.now() - 60 * 3.5 * 1000;
    const loginStatus = !!row.login_status;
    u.login_status = loginStatus; // UserDTO declares Boolean — keep it a boolean.
    u.online_status = currentTime <= lastTime && loginStatus ? 1 : 0;

    u.profile_completed = this.computeProfileCompletion(user);

    return u;
  }

  /**
   * Mirrors the legacy GetFamilyMembers `profile_completed` logic: count how
   * many mandatory profile keys are filled and return "round(filled/total*100)%".
   */
  private computeProfileCompletion(user: unknown): string {
    const u = user as UserRowWithRelations;
    const personal: UserRowWithRelations = u.userPersonalDetail ?? {};
    const matrimony: UserRowWithRelations = u.userMatrimony ?? {};
    const work: UserRowWithRelations = u.userWorkDetail ?? {};
    const address: UserRowWithRelations = u.userAddress ?? {};

    const mandatory: Record<string, unknown> = {
      id: u.id,
      email_address: u.email,
      gender: u.gender,
      address: address?.address,
      mobile: u.mobile,
      birth_date: personal?.birth_date,
      birth_time: matrimony?.birth_time,
      birth_place: matrimony?.birth_place_id,
      distinct_id: '',
      native_place_id: personal?.native_place_id,
      blood_group: personal?.blood_group,
      current_activity_id: personal?.current_activity_id,
      gotra_id: personal?.gotra_id,
      profile_pic: u.profile_pic,
      region: u.region,
      is_rented: address?.addr_type === 'RENTED',
      is_donor: personal?.is_donor,
      business_category_id: work?.business_category_id,
      business_sub_category_id: '',
      work_details: work?.work_details,
      company_name: work?.company_name,
      business_address: work?.business_address,
      education_id: u.education_id,
      occupation_id: u.occupation_id,
      designation_id: work?.designation_id,
    };

    if (personal?.marital_status) {
      mandatory.marriage_date = personal?.marriage_date;
      mandatory.mosaad_id = address?.mosaad_id;
    }
    if (personal?.matrimony) {
      mandatory.about_me = matrimony?.about_me;
      mandatory.weight = matrimony?.weight;
      mandatory.height = matrimony?.height;
      mandatory.is_spect = matrimony?.is_spect;
      mandatory.is_mangal = matrimony?.is_mangal;
      mandatory.is_shani = matrimony?.is_shani;
      mandatory.hobby = matrimony?.hobby;
      mandatory.facebook_profile = matrimony?.facebook_profile;
      mandatory.expectation = matrimony?.expectation;
    }
    if (u.is_expired) {
      mandatory.expire_date = u.expire_date;
    }

    // Legacy count: keys that are non-empty and non-zero (0 and '' are empty).
    const entries = Object.values(mandatory);
    const filled = entries.filter((v) => {
      if (v === undefined || v === null || v === '' || v === 0) return false;
      return v !== false; // boolean false => legacy treated it as empty too
    }).length;
    const total = entries.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

    return `${pct}%`;
  }

  /**
   * Mirrors the legacy GetFamilyMembers ordering:
   *  - the HEAD (head_id = 0) is always first
   *  - the WIFE (relation name = 'Wife') is second
   *  - everyone else follows in their original (id) order
   */
  private orderFamilyMembers(members: Record<string, unknown>[]): Record<string, unknown>[] {
    if (!members.length) return members;

    const head = members.find((m) => m.head_id === 0);

    // Legacy queried `relations` by name = 'Wife'; be flexible about case.
    const wife = members.find(
      (m) => m.head_id !== 0 && String(m.relation).trim().toLowerCase() === 'wife',
    );

    if (head) {
      const rest = members.filter((m) => m !== head && m !== wife);
      return [head, ...(wife ? [wife] : []), ...rest];
    }

    return members;
  }

  async getUsersByDateRange(fromDate: string, toDate: string, page: number, limit: number) {
    const skip = (page - 1) * limit; // Pagination logic

    return await this.prisma.user.findMany({
      where: {
        OR: [
          {
            userPersonalDetail: {
              birth_date: {
                gte: new Date(fromDate + 'T00:00:00.000+05:30'), // Convert to IST timezone
                lte: new Date(toDate + 'T23:59:59.999+05:30'),
              },
            },
          },
          {
            userPersonalDetail: {
              marriage_date: {
                gte: new Date(fromDate + 'T00:00:00.000+05:30'),
                lte: new Date(toDate + 'T23:59:59.999+05:30'),
              },
            },
          },
        ],
      },
      include: {
        userAddress: true,
        userPersonalDetail: true,
        userWorkDetail: true,
        userMatrimony: true,
      },
      take: limit, // Limit results
      skip: skip, // Skip based on page number
      orderBy: {
        userPersonalDetail: {
          birth_date: 'asc', // Order by birth_date
        },
      },
    });
  }

  /**
   * Mirrors the legacy REST "GetUsersByDate" endpoint (API_model::getUsersByDate).
   * Matches users whose birth_date / marriage_date / expire_date month-day
   * (MM-DD, anniversary style) falls inside the [fromdate, todate] range.
   * `filter`: 0 = birth_date, 1 = marriage_date, 2 = expire_date.
   * When omitted, all three date fields are checked and `matched` lists
   * every field that fell in range. Prisma Reminder rows for the requesting
   * user (`id`) are attached as reminder_<field> ids ('0' when none).
   */
  async getUsersByDate(input: GetUsersByDateInput): Promise<GetUsersByDateResponse> {
    const { fromdate, todate, date, filter, id, sub_community_id, start = 0, length = 25 } = input;

    const dateFields = ['birth_date', 'marriage_date', 'expire_date'] as const;
    type DateField = (typeof dateFields)[number];
    const fieldsToCheck: DateField[] =
      filter !== undefined && dateFields[filter] ? [dateFields[filter]] : [...dateFields];

    const toMonthDay = (value: string | Date): string | null => {
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      if (mm === '01' && dd === '01' && d.getFullYear() <= 1970) return null;
      return `${mm}-${dd}`;
    };

    const monthDayInRange = (md: string | null): boolean => {
      if (!md) return false;
      // Exact single-date match (mirrors getUsersByDateCount).
      if (date) {
        const target = toMonthDay(date);
        return md === target;
      }
      if (!(fromdate && todate)) return false;
      const from = toMonthDay(fromdate);
      const to = toMonthDay(todate);
      if (!from || !to) return false;
      // Anniversary-style wrap-around support (e.g. Dec -> Jan).
      if (from <= to) return from <= md && md <= to;
      return md >= from || md <= to;
    };

    const baseWhere: Prisma.UserWhereInput = {
      status: true,
      deleted: false,
      ...(sub_community_id ? { sub_community_id } : {}),
    };

    const users = await this.prisma.user.findMany({
      where: baseWhere,
      include: {
        userAddress: true,
        userPersonalDetail: true,
        userWorkDetail: true,
        userMatrimony: true,
        subCast: true,
        subCommunity: true,
        localCommunity: true,
        relation: true,
        occupation: true,
        education: true,
      },
      orderBy: { first_name: 'asc' },
    });

    const getDate = (user: (typeof users)[number], field: DateField): Date | null => {
      if (field === 'expire_date') return user.expire_date;
      return user.userPersonalDetail ? user.userPersonalDetail[field] : null;
    };

    // Fetch reminders for the requesting user once (legacy getRemindersById).
    const reminderIds = new Map<string, number>();
    if (id) {
      const reminders = await this.prisma.reminder.findMany({ where: { user_id: id } });
      for (const r of reminders) {
        reminderIds.set(`${r.rem_type}`, r.id);
      }
    }

    const filtered = users.filter((user) =>
      fieldsToCheck.some((field) => monthDayInRange(toMonthDay(getDate(user, field)))),
    );

    if (!filtered.length) {
      return { success: false, message: 'Data not found', total_records: 0, members: [] };
    }

    const paged = filtered.slice(start >= 0 ? start : 0, (start >= 0 ? start : 0) + length);

    // Legacy `member_count` = non-expired family members under each head user.
    const headIds = [...new Set(paged.filter((u) => u.head_id === 0).map((u) => u.id))];
    const memberCounts = new Map<number, number>();
    if (headIds.length) {
      const counts = await this.prisma.user.groupBy({
        by: ['head_id'],
        where: { head_id: { in: headIds }, is_expired: false },
        _count: { head_id: true },
      });
      for (const c of counts) memberCounts.set(c.head_id, c._count.head_id);
    }

    const members = paged.map((user) => {
      const result = { ...user } as Record<string, unknown>;
      const matched: string[] = [];
      for (const field of fieldsToCheck) {
        if (monthDayInRange(toMonthDay(getDate(user, field)))) {
          matched.push(field);
          // Legacy keys reminder by (user_id, profile_id, reminder_type);
          // Prisma Reminder has rem_type/message, so match rem_type to the field.
          const reminderId = id ? String(reminderIds.get(field) ?? '0') : '0';
          result[`reminder_${field}`] = reminderId;
        }
      }
      result['matched'] = matched.join(',');
      result['member_count'] = user.head_id === 0 ? memberCounts.get(user.id) ?? 0 : 0;
      return result as unknown as (typeof users)[number] & {
        matched?: string;
        reminder_birth_date?: string;
        reminder_marriage_date?: string;
        reminder_expire_date?: string;
      };
    });

    return {
      success: true,
      message: 'Data Retrived',
      total_records: filtered.length,
      members: members as unknown as GetUsersByDateResponse['members'],
    };
  }

  private getUserDate(user, field) {
    if (field === 'expire_date') return user.expire_date;
    return user.userPersonalDetail ? user.userPersonalDetail[field] : null;
  }

  async deleteUser(id: number): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { head_id: true },
      });

      if (!user) return 'User not found.';
      if (user.head_id === 0) return 'Cannot delete head user.';

      await this.prisma.user.delete({ where: { id } });

      return 'User deleted successfully.';
    } catch (error) {
      return 'Failed to delete user. ' + error.message;
    }
  }

  async changeRole(input: ChangeRoleInput): Promise<string> {
    const { idList, role, subCommunityId, localCommunityId } = input;

    try {
      // Validate users exist
      const users = await this.prisma.user.findMany({
        where: { id: { in: idList } },
      });

      if (!users.length) {
        throw new BadRequestException('No matching users found.');
      }

      // Update users
      await this.prisma.user.updateMany({
        where: { id: { in: idList } },
        data: {
          role,
          ...(subCommunityId && { sub_community_id: subCommunityId }),
          ...(localCommunityId && { local_community_id: localCommunityId }),
        },
      });

      return 'Role changed successfully.';
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update roles.');
    }
  }

  /**
   * Mirrors the legacy REST "GetInactiveUsers" endpoint
   * (API_model::getInactiveUsers / getInactiveUsersCount).
   *
   * Returns users that are inactive (status != 1), not deleted and, when
   * provided, filtered by sub_community_id (which takes precedence) or
   * local_community_id. `member_count` is the number of non-expired family
   * members headed by each returned user. `total_records` is the total number
   * of matching users before pagination.
   */
  async getInactiveUsers(input: GetInactiveUsersInput): Promise<GetInactiveUsersResponse> {
    const { start = 0, length = 25, sub_community_id, local_community_id } = input;

    // Legacy filter precedence: sub_community_id wins over local_community_id.
    const where: Prisma.UserWhereInput = {
      status: false, // legacy: status != 1 (false => inactive)
      deleted: false,
    };

    if (sub_community_id) {
      where.sub_community_id = sub_community_id;
    } else if (local_community_id) {
      where.local_community_id = local_community_id;
    }

    const total_records = await this.prisma.user.count({ where });

    if (!total_records) {
      return { success: false, message: 'Data not found', total_records: 0, members: [] };
    }

    const users = await this.prisma.user.findMany({
      where,
      skip: start >= 0 ? start : 0,
      take: length > 0 ? length : 25,
      orderBy: { first_name: 'asc' },
      include: {
        userAddress: true,
        userMatrimony: true,
        userPersonalDetail: true,
        userWorkDetail: true,
      },
    });

    // Legacy `member_count` sub-select: users whose head_id points at the
    // returned user and who are not expired.
    const userIds = users.map((user) => user.id);
    const memberCounts = new Map<number, number>();
    if (userIds.length) {
      const counts = await this.prisma.user.groupBy({
        by: ['head_id'],
        where: { head_id: { in: userIds }, is_expired: false },
        _count: { head_id: true },
      });
      for (const c of counts) memberCounts.set(c.head_id, c._count.head_id);
    }

    const members = users.map((user) => ({
      ...user,
      member_count: memberCounts.get(user.id) ?? 0,
    }));

    return {
      success: true,
      message: 'Data retrived successfully.',
      total_records,
      members: members as unknown as GetInactiveUsersResponse['members'],
    };
  }

  async getSharedProfiles(userId: number) {
    // Find UserLocation for the given user
    const userLocation = await this.prisma.userLocation.findFirst({
      where: { user_id: userId },
      select: { sharing_id: true },
    });

    if (!userLocation || !userLocation.sharing_id) {
      return [];
    }

    // Extract shared user IDs
    const sharedUserIds = userLocation.sharing_id.split(',').map(Number);

    // Fetch users whose IDs are in sharing_id
    return this.prisma.user.findMany({
      where: { id: { in: sharedUserIds } },
    });
  }

  // Get users who have shared their profile with the given userId
  async getSharingProfiles(userId: number) {
    const userLocations = await this.prisma.userLocation.findMany({
      where: {
        sharing_id: { contains: `${userId}` },
      },
      select: { user_id: true },
    });

    const sharingUserIds = userLocations.map((loc) => loc.user_id);

    return this.prisma.user.findMany({
      where: { id: { in: sharingUserIds } },
    });
  }

  async getContactList(input: GetContactListInput): Promise<GetContactListResponse> {
    const { mobiles } = input;

    const users = await this.prisma.user.findMany({
      where: {
        mobile: { in: mobiles },
        status: { not: false },
      },
    });

    if (users.length > 0) {
      return {
        success: true,
        message: 'Data Retrieved Successfully',
        members: users, // Returns full user records
      };
    } else {
      return {
        success: false,
        message: 'No Data Found',
        members: [],
      };
    }
  }

  /**
   * Converts the legacy REST "SearchByCity" endpoint into GraphQL.
   *
   * Equivalent PHP logic (Users_model::get_datatables_for_api):
   *  - joins users with cities, states, sub_community, local_community, sub_casts
   *  - filters status != 0 and only head users (head_id = 0) for the member list
   *  - optional sub_community_id equality filter
   *  - optional alphabet filter on first_name (LIKE 'alpha%')
   *  - optional free text search across member_code, first_name, mobile,
   *    email, city and state
   * Each returned head user (head_id = 0) is enriched with `member_count`, the
   * number of active non-expired family members under it
   * (Users_model::get_members_counts($id, 1)).
   * Returns success, totalHead (number of matching head users), totalMem
   * (sum of family members under all matched heads) and the paged member list.
   */
  async searchByCity(input: SearchByCityInput): Promise<SearchByCityResponse> {
    const { start = 0, length = 10 } = input;

    const where = this.buildSearchByCityWhere(input);

    const totalHead = await this.prisma.user.count({ where });

    const members = await this.prisma.user.findMany({
      where,
      skip: start >= 0 ? start : 0,
      take: length > 0 ? length : 10,
      orderBy: { first_name: 'asc' },
      include: {
        userAddress: true,
      },
    });

    // Legacy `member_count` (Users_model::get_members_counts called with
    // $admin = 1 from get_datatables_for_api): number of active, non-expired
    // family members whose head_id points to this head user. Only head users
    // (head_id = 0) own a family, every other row reports 0.
    const pageHeadIds = members.filter((member) => member.head_id === 0).map((member) => member.id);
    const pageCounts = await this.getMemberCountsByHeadIds(pageHeadIds);

    const membersWithCount = members.map((member) => ({
      ...member,
      member_count: member.head_id === 0 ? pageCounts.get(member.id) ?? 0 : 0,
    }));

    // Legacy `totalMem` is the sum of member_count across EVERY matched head
    // user, not only the heads on the current page (SearchByCity.php loops over
    // the unpaged $dataListTotal result set).
    let totalMem = 0;
    for (const count of pageCounts.values()) totalMem += count;

    if (members.length < totalHead) {
      const allHeads = await this.prisma.user.findMany({ where, select: { id: true } });
      const allCounts = await this.getMemberCountsByHeadIds(allHeads.map((head) => head.id));
      totalMem = 0;
      for (const count of allCounts.values()) totalMem += count;
    }

    return {
      success: true,
      totalHead,
      totalMem,
      members: membersWithCount,
    };
  }

  private buildSearchByCityWhere(input: SearchByCityInput): Prisma.UserWhereInput {
    const { cityId, subCommunityId, alpha, search } = input;

    const where: Prisma.UserWhereInput = {
      // Mirrors the legacy "users.status != 0" filter.
      status: true,
      deleted: false,
      // Legacy query only lists head users in the member list.
      head_id: 0,
      ...(subCommunityId ? { sub_community_id: subCommunityId } : {}),
      ...(cityId ? { userAddress: { city_id: cityId } } : {}),
      ...(alpha ? { first_name: { startsWith: alpha } } : {}),
      ...(search ? this.buildSearchByCityFreeText(search) : {}),
    };

    return where;
  }

  private buildSearchByCityFreeText(search: string): Prisma.UserWhereInput {
    return {
      OR: [
        { member_code: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        {
          userAddress: {
            city: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          userAddress: {
            states: { name: { contains: search, mode: 'insensitive' } },
          },
        },
      ],
    };
  }

  /**
   * Batch version of the legacy `get_members_counts($headId, 1)`: returns a map
   * of head user id -> number of active, non-expired family members under that
   * head. Head ids without any member are simply absent from the map (callers
   * default them to 0).
   */
  private async getMemberCountsByHeadIds(headIds: number[]): Promise<Map<number, number>> {
    const memberCounts = new Map<number, number>();
    const uniqueHeadIds = [...new Set(headIds)].filter((id) => Number.isFinite(id));
    if (!uniqueHeadIds.length) return memberCounts;

    const counts = await this.prisma.user.groupBy({
      by: ['head_id'],
      where: {
        head_id: { in: uniqueHeadIds },
        is_expired: false,
        status: true,
      },
      _count: { head_id: true },
    });

    for (const row of counts) memberCounts.set(row.head_id, row._count.head_id);
    return memberCounts;
  }

  // async findUserById(id: number) {
  //   const user = await this.prisma.user.findUnique({ where: { id } });
  //   return user;
  // }

  // async findUserByMobile(mobile: string) {
  //   const user = await this.prisma.user.findFirst({ where: { mobile } });
  //   return user;
  // }

  // async getAllUsers() {
  //   const users = await this.prisma.user.findMany();
  //   return users;
  // }

  // async getAllUsersByFilter() {
  //   const users = await this.prisma.user.findMany();
  //   return users;
  // }
}
