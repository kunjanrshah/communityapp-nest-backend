import { IsInt, IsOptional, IsString, Min, Max, IsBoolean } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@InputType()
export class SmartFilterDto {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field(() => Role, { nullable: true })
  @IsOptional()
  role?: Role;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  last_name_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  local_community_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sub_community_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  native_place_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  city_id?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  member_code?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  head_name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  first_name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  father_name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  mother_name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  gender?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  marital_status?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  min_age?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  max_age?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  min_height?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  max_height?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  min_weight?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  max_weight?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  min_percentage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  max_percentage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  state_id?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email_address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  mobile?: string;

  // Address Filters
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  local_address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  pincode?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  area?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  business_address?: string;

  // Education & Work Filters
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  education_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  gotra_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  business_category_id?: number;

  // @Field(() => Int, { nullable: true })
  // @IsOptional()
  // @IsInt()
  // business_sub_category_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  occupation_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  birth_place_id?: number;

  // @Field(() => Int, { nullable: true })
  // @IsOptional()
  // @IsInt()
  // current_activity_id?: number;

  // Dates
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  birth_date?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  marriage_date?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  expire_date?: string;

  // @Field(() => String, { nullable: true })
  // @IsOptional()
  // @IsString()
  // created_dt?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  updated_dt?: string;

  // Miscellaneous
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  blood_group?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_donor?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_rented?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_expired?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_spect?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  matrimony?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_shani?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  is_mangal?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  str_search?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  committee_id?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  designation_id?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  start_date?: string; // Format: YYYY-MM

  @Field(() => String, { nullable: true })
  @IsString()
  end_date?: string; // Format: YYYY-MM
}

@InputType()
export class SearchRequestDTO {
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  start: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  length: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  alpha?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  orderByVal?: 'asc' | 'desc';

  @Field(() => SmartFilterDto, { nullable: true })
  @IsOptional()
  filter_by?: SmartFilterDto;
}
