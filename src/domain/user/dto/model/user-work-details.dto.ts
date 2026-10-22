import { ObjectType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

@ObjectType()
export class UserWorkDetailDTO {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => Int)
  @IsInt()
  user_id: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  committee_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  designation_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  business_category_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  business_address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  business_logo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  company_name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  work_details?: string;

  @Field({ nullable: true })
  @IsOptional()
  start_date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  end_date?: Date;
}
