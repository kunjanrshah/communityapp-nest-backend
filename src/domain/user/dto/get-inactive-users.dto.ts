import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';

@InputType()
export class GetInactiveUsersInput {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  start?: number;

  @Field(() => Int, { nullable: true, defaultValue: 25 })
  @IsOptional()
  @IsInt()
  length?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  sub_community_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  local_community_id?: number;
}
