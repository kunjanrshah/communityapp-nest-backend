import { Int, Field, ObjectType, Float, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { UserAddressDTO } from './user-address.dto';
import { UserMatrimonyDTO } from './user-matrimony.dto';
import { UserPersonalDetailDTO } from './user-personal-details.dto';
import { UserWorkDetailDTO } from './user-work-details.dto';
import { UserLocationDTO } from './user-location.dto';

registerEnumType(Role, {
  name: 'Role', // GraphQL name
});

@ObjectType()
export class UserDTO {
  @Field(() => Int)
  id: number;

  @Field(() => Role, { defaultValue: Role.USER })
  role: Role;

  @Field(() => Int, { defaultValue: 0 })
  head_id: number;

  @Field({ nullable: true })
  member_code?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field()
  password: string;

  @Field(() => Int, { nullable: true })
  relation_id?: number;

  @Field(() => Int, { nullable: true })
  sub_community_id?: number;

  @Field(() => Int, { nullable: true })
  local_community_id?: number;

  @Field()
  first_name: string;

  @Field(() => Int)
  last_name_id: number;

  @Field({ nullable: true })
  father_name?: string;

  @Field({ nullable: true })
  mother_name?: string;

  @Field({ defaultValue: true })
  status: boolean;

  @Field()
  gender: boolean;

  @Field({ nullable: true })
  phone?: string;

  @Field({ defaultValue: 'noimage.png' })
  profile_pic: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ defaultValue: false })
  is_expired: boolean;

  @Field({ nullable: true })
  expire_date?: Date;

  @Field(() => Int, { nullable: true })
  education_id?: number;

  @Field(() => Int, { nullable: true })
  occupation_id?: number;

  @Field({ defaultValue: false })
  deleted: boolean;

  @Field({ nullable: true })
  login_status?: boolean;

  @Field({ nullable: true })
  last_login?: Date;

  @Field(() => Float, { defaultValue: 5 })
  profile_percent: number;

  @Field({ nullable: true })
  updated?: Date;

  @Field(() => UserAddressDTO, { nullable: true }) // Include Address as part of the User response
  userAddress?: UserAddressDTO;

  @Field(() => UserLocationDTO, { nullable: true }) // Include Address as part of the User response
  userLocation?: UserLocationDTO;

  @Field(() => UserMatrimonyDTO, { nullable: true }) // Include Address as part of the User response
  userMatrimony?: UserMatrimonyDTO;

  @Field(() => UserPersonalDetailDTO, { nullable: true }) // Include Address as part of the User response
  userPersonalDetail?: UserPersonalDetailDTO;

  @Field(() => UserWorkDetailDTO, { nullable: true }) // Include Address as part of the User response
  userWorkDetail?: UserWorkDetailDTO;

  @Field(() => [String], { nullable: true })
  matchedFields?: string[];

  @Field(() => String, { nullable: true })
  distance?: string; //"3.2, 5.6"

  @Field(() => String, { nullable: true })
  nearBy?: string; // "home", "office", or "user"

  @Field(() => Int, { nullable: true })
  member_count?: number; // Count of family members under this head user

  @Field(() => String, { nullable: true })
  matched?: string; // Which date field(s) matched for GetUsersByDate

  @Field(() => String, { nullable: true })
  reminder_birth_date?: string;

  @Field(() => String, { nullable: true })
  reminder_marriage_date?: string;

  @Field(() => String, { nullable: true })
  reminder_expire_date?: string;

  /**
   * Legacy GetFamilyMembers enrichment — percentage string e.g. "75%" of the
   * mandatory profile keys that have been filled in.
   */
  @Field(() => String, { nullable: true })
  profile_completed?: string;

  /** Legacy GetFamilyMembers enrichment — 1 when the user was recently online. */
  @Field(() => Int, { nullable: true })
  online_status?: number;

  /** Legacy enrichment — first name of the head user this member belongs to. */
  @Field(() => String, { nullable: true })
  head_name?: string;

  /** Legacy enrichment — surname (sub-cast name). */
  @Field(() => String, { nullable: true })
  last_name?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  sub_community?: string;

  @Field(() => String, { nullable: true })
  local_community?: string;

  @Field(() => String, { nullable: true })
  relation?: string;

  @Field(() => String, { nullable: true })
  designation?: string;

  @Field(() => Int, { nullable: true })
  designation_id?: number;

  @Field(() => String, { nullable: true })
  committee?: string;

  @Field(() => Int, { nullable: true })
  committee_id?: number;

  @Field(() => String, { nullable: true })
  education?: string;

  @Field(() => String, { nullable: true })
  occupation?: string;

  @Field(() => String, { nullable: true })
  current_activity?: string;

  @Field(() => String, { nullable: true })
  gotra?: string;

  @Field(() => String, { nullable: true })
  native?: string;

  @Field(() => String, { nullable: true })
  business_category?: string;

  @Field(() => String, { nullable: true })
  business_sub_category?: string;

  @Field(() => String, { nullable: true })
  mossad?: string;
}
