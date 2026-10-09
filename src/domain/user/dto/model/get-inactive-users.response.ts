import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserDTO } from './user.dto';

@ObjectType()
export class GetInactiveUsersResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => Int, {
    description: 'Total number of inactive users matching the filter (before pagination).',
  })
  total_records: number;

  @Field(() => [UserDTO])
  members: UserDTO[];
}
