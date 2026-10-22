import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsInt, IsString, Length } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  first_name: string;

  @Field(() => Int)
  @IsInt()
  last_name_id: number;

  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @Length(6, 10, { message: 'Mobile must be between 6 and 10 characters' })
  mobile: string;

  @Field()
  @Length(6, 15, { message: 'Password must be between 6 and 15 characters' })
  password: string;

  @Field(() => Int)
  @IsInt()
  sub_community_id: number;

  @Field(() => Int)
  @IsInt()
  local_community_id: number;

  @Field(() => Boolean)
  @IsBoolean()
  gender: boolean;

  @Field({ defaultValue: 'noimage.png' })
  @IsString()
  profile_pic: string;

  @Field(() => Int)
  @IsInt()
  states_id: number;

  @Field(() => Int)
  @IsInt()
  city_id: number;

  @Field()
  @IsString()
  address: string;

  @Field(() => Boolean)
  @IsBoolean()
  status: boolean;
}

@ObjectType()
export class LoginMemberDTO {
  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true })
  refresh_token?: string;

  @Field({ nullable: true })
  about_me?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  area?: string;

  @Field({ nullable: true })
  birth_date?: string;

  @Field({ nullable: true })
  birth_place?: string;

  @Field({ nullable: true })
  birth_time?: string;

  @Field({ nullable: true })
  blood_group?: string;

  @Field({ nullable: true })
  business_address?: string;

  @Field({ nullable: true })
  business_category?: string;

  @Field({ nullable: true })
  business_category_id?: string;

  @Field({ nullable: true })
  business_logo?: string;

  @Field({ nullable: true })
  business_sub_category?: string;

  @Field({ nullable: true })
  business_sub_category_id?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  city_id?: string;

  @Field({ nullable: true })
  committee?: string;

  @Field({ nullable: true })
  committee_id?: string;

  @Field({ nullable: true })
  company_name?: string;

  @Field({ nullable: true })
  created_dt?: string;

  @Field({ nullable: true })
  current_activity?: string;

  @Field({ nullable: true })
  current_activity_id?: string;

  @Field({ nullable: true })
  designation?: string;

  @Field({ nullable: true })
  designation_id?: string;

  @Field({ nullable: true })
  distance?: string;

  @Field({ nullable: true })
  distinct_id?: string;

  @Field({ nullable: true })
  education?: string;

  @Field({ nullable: true })
  education_id?: string;

  @Field({ nullable: true })
  email_address?: string;

  @Field({ nullable: true })
  expectation?: string;

  @Field({ nullable: true })
  expire_date?: string;

  @Field({ nullable: true })
  facebook_profile?: string;

  @Field({ nullable: true })
  father_name?: string;

  @Field({ nullable: true })
  first_name?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  gotra?: string;

  @Field({ nullable: true })
  gotra_id?: string;

  @Field({ nullable: true })
  head_id?: string;

  @Field({ nullable: true })
  head_name?: string;

  @Field({ nullable: true })
  head_sub_cast_id?: string;

  @Field({ nullable: true })
  height?: string;

  @Field({ nullable: true })
  hobby?: string;

  @Field({ nullable: true })
  home_lat?: string;

  @Field({ nullable: true })
  home_lng?: string;

  @Field({ nullable: true })
  is_donor?: string;

  @Field({ nullable: true })
  is_expired?: string;

  @Field(() => Boolean, { nullable: true })
  isImportant?: boolean;

  @Field({ nullable: true })
  is_location_enable?: string;

  @Field({ nullable: true })
  is_mangal?: string;

  @Field({ nullable: true })
  is_rented?: string;

  @Field({ nullable: true })
  is_shani?: string;

  @Field({ nullable: true })
  is_spect?: string;

  @Field({ nullable: true })
  last_login?: string;

  @Field({ nullable: true })
  last_name?: string;

  @Field({ nullable: true })
  local_address?: string;

  @Field({ nullable: true })
  local_community?: string;

  @Field({ nullable: true })
  local_community_id?: string;

  @Field(() => Int, { nullable: true })
  login_status?: number;

  @Field({ nullable: true })
  marital_status?: string;

  @Field({ nullable: true })
  marriage_date?: string;

  @Field({ nullable: true })
  matched?: string;

  @Field({ nullable: true })
  matrimony?: string;

  @Field({ nullable: true })
  member_code?: string;

  @Field(() => Int, { nullable: true })
  member_count?: number;

  @Field({ nullable: true })
  mosaad_id?: string;

  @Field({ nullable: true })
  mossad?: string;

  @Field({ nullable: true })
  mother_name?: string;

  @Field({ nullable: true })
  native?: string;

  @Field({ nullable: true })
  native_place_id?: string;

  @Field({ nullable: true })
  nearBy?: string;

  @Field({ nullable: true })
  occupation?: string;

  @Field({ nullable: true })
  occupation_id?: string;

  @Field({ nullable: true })
  office_lat?: string;

  @Field({ nullable: true })
  office_lng?: string;

  @Field(() => Int, { nullable: true })
  online_status?: number;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  pincode?: string;

  @Field({ nullable: true })
  plain_password?: string;

  @Field({ nullable: true })
  profile_completed?: string;

  @Field({ nullable: true })
  profile_password?: string;

  @Field({ nullable: true })
  profile_percentage?: string;

  @Field({ nullable: true })
  profile_pic?: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  relation?: string;

  @Field({ nullable: true })
  relation_id?: string;

  @Field({ nullable: true })
  sharing_id?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  state_id?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  sub_cast_id?: string;

  @Field({ nullable: true })
  sub_community?: string;

  @Field({ nullable: true })
  sub_community_id?: string;

  @Field({ nullable: true })
  updated_dt?: string;

  @Field({ nullable: true })
  user_lat?: string;

  @Field({ nullable: true })
  user_lng?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  weight?: string;

  @Field({ nullable: true })
  work_details?: string;

  @Field({ nullable: true })
  reminder_birth_date?: string;

  @Field({ nullable: true })
  reminder_marriage_date?: string;

  @Field({ nullable: true })
  reminder_expire_date?: string;

  @Field(() => [String], { nullable: true })
  matches?: string[];
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  message: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field({ nullable: true })
  OTP?: string;

  @Field()
  message: string;

  @Field(() => LoginMemberDTO)
  data: LoginMemberDTO;
}
