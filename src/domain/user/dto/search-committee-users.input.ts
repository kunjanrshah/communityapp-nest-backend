import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

@InputType()
export class SearchCommitteeUsersFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  str_search?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  local_community_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  sub_community_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  committee_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  designation_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'start_date must use YYYY-MM format' })
  start_date?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'end_date must use YYYY-MM format' })
  end_date?: string;
}

@InputType()
export class SearchCommitteeUsersInput {
  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  start: number;

  @Field(() => Int, { defaultValue: 25 })
  @IsOptional()
  @IsInt()
  @Min(-1)
  length: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  filterBy?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  committeeId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  designationId?: number;

  @Field(() => SearchCommitteeUsersFilterInput, { nullable: true })
  @IsOptional()
  filter_by?: SearchCommitteeUsersFilterInput;
}
