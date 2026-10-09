import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class StatusChangeInputDto {
  /** Comma separated list of user ids, e.g. `12,34,56` (legacy `idList`). */
  @Field(() => String)
  @IsString()
  idList: string;

  /** 1 = approve/activate, 0 = block/deactivate (legacy `status`). */
  @Field(() => Int)
  @IsInt()
  status: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  extra_info?: number;

  /** Plain password to set on the selected users (legacy `profile_password`). */
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  relation_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  head_id?: number;

  /**
   * Id of the user being acted upon (legacy `id`). Required for
   * `extra_info = 2` and used as the `user_id` in the approval notification.
   */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;
}
