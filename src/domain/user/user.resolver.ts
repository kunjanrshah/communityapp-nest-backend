import { Resolver, Query, Args, Mutation, Context, Int } from '@nestjs/graphql';
import { UserDTO } from './dto/model/user.dto';
import { UserService } from './user.service';
import { UpsertUserInput } from './dto/user.upsert.dto';
import { ChangePasswordInput, ChangePasswordResponse } from './dto/user.change-password.dto';
import { User, Role } from '@prisma/client';
import { ChangeRoleInput } from './dto/change-role.dto';
import { GetInactiveUsersInput } from './dto/get-inactive-users.dto';
import { GetInactiveUsersResponse } from './dto/model/get-inactive-users.response';
import { StatusChangeInputDto } from './dto/status-change-input.dto';
import { StatusChangeResponseDto } from './dto/model/status-change-response.dto';
import { StatusChangeService } from './status-change.service';
import { GetContactListResponse } from './dto/model/get-contact-list.response';
import { GetContactListInput } from './dto/get-contact-list.input';
import { SearchByCityInput } from './dto/search-by-city.input';
import { SearchByCityResponse } from './dto/model/search-by-city.response';
import { GetUsersByDateInput, GetUsersByDateResponse } from './dto/user.by-date.dto';
import {
  GetUserActivityStatusInput,
  GetUserActivityStatusResponse,
} from './dto/activity-status.dto';
import { GetFamilyMembersResponse } from './dto/model/get-family-members.response';
import { InnerLoginInput } from './dto/inner-login.input';
import { InnerLogoutInput } from './dto/inner-logout.input';
import { SearchCommitteeUsersInput } from './dto/search-committee-users.input';
import { SearchCommitteeUsersResponse } from './dto/model/search-committee-users.response';
import { Roles } from 'src/roles.decorator';

@Resolver(() => UserDTO)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly statusChangeService: StatusChangeService,
  ) {}

  // @Query(() => String)
  // @Roles(Role.SUPER_ADMIN)
  // securedResourceforAdmin(@Context('user') user: UserDTO) {
  //   return 'This is Secured Resource' + JSON.stringify(user);
  // }

  @Mutation(() => ChangePasswordResponse)
  async changePassword(
    @Args('ChangePasswordInput') changePasswordInput: ChangePasswordInput,
    @Context() context,
  ) {
    const userId = context.req.user.userId; // Extract user ID from token
    return this.userService.changePassword(
      userId,
      changePasswordInput.currentPassword,
      changePasswordInput.newPassword,
    );
  }

  @Mutation(() => UserDTO)
  async upsertUser(
    @Args('upsertUserInput') upsertUserInput: UpsertUserInput,
    @Context() context,
  ): Promise<User> {
    const input =
      context.req.user.role === Role.SUPER_ADMIN
        ? upsertUserInput
        : { ...upsertUserInput, role: undefined };

    return this.userService.upsertUser(input);
  }

  @Mutation(() => Boolean)
  async updateLastLogin(@Args('user_id', { type: () => Int }) user_id: number): Promise<boolean> {
    return this.userService.updateLastLogin(user_id);
  }

  @Mutation(() => GetUserActivityStatusResponse)
  async getUserActivityStatus(
    @Args('input') input: GetUserActivityStatusInput,
  ): Promise<GetUserActivityStatusResponse> {
    return this.userService.getUserActivityStatus(input);
  }

  @Query(() => GetFamilyMembersResponse)
  async getFamilyMembers(
    @Args('head_id', { type: () => Int }) head_id: number,
    @Args('loginUserId', { type: () => Int, nullable: true }) loginUserId?: number,
  ): Promise<GetFamilyMembersResponse> {
    return this.userService.getFamilyMembers(head_id, loginUserId);
  }

  @Query(() => UserDTO)
  async getUserProfile(@Args('id', { type: () => Int }) id: number) {
    return this.userService.getUserProfile(id);
  }

  @Query(() => SearchCommitteeUsersResponse)
  async searchCommitteeUsers(
    @Args('input') input: SearchCommitteeUsersInput,
  ): Promise<SearchCommitteeUsersResponse> {
    return this.userService.searchCommitteeUsers(input);
  }

  @Mutation(() => String)
  async innerLogin(@Args('input') input: InnerLoginInput) {
    const result = await this.userService.innerLogin(input);
    return result.success ? 'Login successful' : 'Already logged in';
  }

  @Mutation(() => String)
  async innerLogout(@Args('input') input: InnerLogoutInput) {
    const result = await this.userService.innerLogout(input);
    return result.message;
  }

  @Query(() => [UserDTO], { name: 'usersByDateRange' })
  async getUsersByDateRange(
    @Args('fromDate') fromDate: string,
    @Args('toDate') toDate: string,
    @Args('page') page: number,
    @Args('limit') limit: number,
  ) {
    return this.userService.getUsersByDateRange(fromDate, toDate, page, limit);
  }

  @Query(() => GetUsersByDateResponse, { name: 'usersByDate' })
  async getUsersByDate(@Args('input') input: GetUsersByDateInput): Promise<GetUsersByDateResponse> {
    return this.userService.getUsersByDate(input);
  }

  @Query(() => GetInactiveUsersResponse)
  async getInactiveUsers(
    @Args('input') input: GetInactiveUsersInput,
  ): Promise<GetInactiveUsersResponse> {
    return this.userService.getInactiveUsers(input);
  }

  @Query(() => [UserDTO])
  async getSharedProfiles(@Args('userId', { type: () => Int }) userId: number) {
    return this.userService.getSharedProfiles(userId);
  }

  @Query(() => [UserDTO])
  async getSharingProfiles(@Args('userId', { type: () => Int }) userId: number) {
    return this.userService.getSharingProfiles(userId);
  }

  @Mutation(() => String)
  deleteUserById(@Args({ name: 'userId', type: () => Int }) id: number) {
    return this.userService.deleteUser(id);
  }

  @Roles(Role.SUPER_ADMIN)
  @Mutation(() => String)
  async changeRole(@Args('input') input: ChangeRoleInput): Promise<string> {
    return this.userService.changeRole(input);
  }

  @Mutation(() => StatusChangeResponseDto)
  async statusChange(
    @Args('data') data: StatusChangeInputDto,
    @Context() context,
  ): Promise<StatusChangeResponseDto> {
    // Fall back to the authenticated user id when the client does not send `id`
    // (used for the approval push-notification payload).
    const actorId = context?.req?.user?.userId;
    return this.statusChangeService.statusChange(data, actorId);
  }

  @Query(() => GetContactListResponse)
  async getContactList(@Args('input') input: GetContactListInput): Promise<GetContactListResponse> {
    return this.userService.getContactList(input);
  }

  @Query(() => SearchByCityResponse)
  async searchByCity(@Args('input') input: SearchByCityInput): Promise<SearchByCityResponse> {
    return this.userService.searchByCity(input);
  }

  // @Query(() => String)
  // getProtectedData(@Context() context) {
  //   return `Hello ${context.req.user.email}, this is protected data!`;
  // }

  // @Query(() => UserSchema)
  // findUserById(@Args({ name: 'userId', type: () => Int }) id: number) {
  //   return this.userService.findUserById(id);
  // }

  // @Query(() => UserSchema)
  // findUserByMobile(@Args({ name: 'mobile', type: () => String }) mobile: string) {
  //   return this.userService.findUserByMobile(mobile);
  // }

  // @Query(() => [UserSchema])
  // getAllUsers() {
  //   return this.userService.getAllUsers();
  // }

  // @Query(() => [UserSchema])
  // getAllUsersByFilter() {
  //   return this.userService.getAllUsersByFilter();
  // }

  // @Mutation(() => UserSchema)
  // updateUser(
  //   @Args({ name: 'userId', type: () => Int }) id: number,
  //   @Args('updateUserArgs') updateUserArgs: UpdateUserArgs,
  // ) {
  //   return this.userService.updateUser(id, updateUserArgs);
  // }

  // @Query(() => String)
  // @Roles(Role.USER)
  // securedResourceforUser(@Context('user') user: UserSchema) {
  //   return 'This is Secured Resource' + JSON.stringify(user);
  // }
}
